import Admin from "../../models/admin.js";
import { Op } from "sequelize";
import OrderItems from "../../models/orderItems.js";
import Orders from "../../models/orders.js";
import OrderRefund from '../../models/orderRefund.js'
import OrderCancel from '../../models/orderCancel.js'
import Customer from "../../models/customer.js";
import Products from "../../models/products.js";
import ProductVariantValues from "../../models/productVariantValues.js";
import ProductVariantCombination from "../../models/productVariantCombination.js";
import Notifications from "../../models/notifications.js";
import { orderSendMail } from '../../utils/mailer.js';
import { orderStatusUpdateTemplate } from "../../utils/emailTemplates.js";
import { io } from "../../server.js";
import RefundProof from "../../models/refundProof.js";
import {v2 as cloudinary} from 'cloudinary';
import OrderTransaction from "../../models/orderTransaction.js";
import PaymentProof from "../../models/paymentProof.js";
import OrderDeliveryProof from "../../models/orderDeliveryProof.js";
import InventoryStock from "../../models/inventoryStock.js";
import InventoryBatch from "../../models/inventoryBatch.js";
import InventoryHistory from "../../models/inventoryHistory.js";
import ProductInventorySettings from "../../models/productInventorySettings.js";
import fs from 'fs/promises';
import { adminCancellationRemovedTemplate, adminRefundSubmittedTemplate, returnRefundStatusTemplate, stockAdjustmentLowStockTemplate } from "../../utils/emailTemplates.js";


// ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};


export const fetchOrdersService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const orders = await Orders.findAll({});
        if (orders.length === 0) {
            return {
                success: true,
                orders: [],
                orderItems: [],
            };
        }

        const orderItems = await OrderItems.findAll({});
        if (orderItems.length === 0) {
            return {
                success: true,
                orders,
                orderItems: [],
            };
        }

        return {
            success: true,
            orders,
            orderItems,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderPaymentProofService = async (adminId) => {
    try {
      // Validate customer exists
      const user = await Admin.findByPk(adminId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const allPaymentProof = await PaymentProof.findAll({});
      if (allPaymentProof.length === 0) {
        return {
          success: false,
          allPaymentProof: [],
        };
      }

      return {
        success: true,
        allPaymentProof
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchRefundProofService = async (adminId) => {
    try {
      const adminUser = await Admin.findByPk(adminId);
      if (!adminUser) {
          return {
              success: false,
              message: 'User not found'
          }
      }

      const refundProof = await RefundProof.findAll({});
      if (refundProof.length === 0) {
          return {
              success: true,
              refundProof: [],
          };
      }

      return {
          success: true,
          refundProof
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderCancelService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }


        const orderCancel = await OrderCancel.findAll({});
        if (orderCancel.length === 0) {
            return {
            success: true,
            orderCancel: []
            };
        }

        return {
            success: true,
            orderCancel
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderReturnAndRefundService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }


        const returnRefundOrders = await OrderRefund.findAll({});
        if (returnRefundOrders.length === 0) {
            return {
            success: true,
            returnRefundOrders: []
            };
        }

        return {
            success: true,
            returnRefundOrders
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const adminRemoveCancellationService = async (adminID, customerID, orderItemID, orderCancelID) => {
  try {

    // 1️⃣ Validate admin
    const admin = await Admin.findByPk(adminID);
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }

    // 1️⃣ Validate customer
    const user = await Customer.findByPk(customerID);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // 2️⃣ Validate order item
    const orderItem = await OrderItems.findByPk(orderItemID);
    if (!orderItem) {
      return { success: false, message: "Order item not found." };
    }

    // 3️⃣ Validate cancel request
    const removeCancellation = await OrderCancel.findOne({
      where: {
        ID: orderCancelID,
        orderItemId: orderItemID,
        customerId: customerID,
        cancelledBy: 'Admin',
      },
    });
    if (!removeCancellation) {
      return { success: false, message: "Admin cancellation record not found." };
    }

    // 4️⃣ Fetch product
    const product = await Products.findByPk(orderItem.productId);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    // 5️⃣ Delete the cancel request
    await removeCancellation.destroy();

    // 6️⃣ Reset order item status
    await orderItem.update({ orderStatus: 'Pending' });

    const fullOrder = await Orders.findByPk(orderItem.orderId);
    
    // 🔹 AUTO-GENERATE TRANSACTION ID & CREATE ORDER TRANSACTION
    const lastTransaction = await OrderTransaction.findOne({order: [['ID', 'DESC']]});
    const nextTransactionNo = lastTransaction ? Number(lastTransaction.ID) + 1 : 1;
    const transactionId = withTimestamp('TRXN', nextTransactionNo);

    await OrderTransaction.create({
      transactionId,
      orderId: fullOrder.ID,
      orderItemId: orderItem.ID,
      customerId: customerID,
      transactionType: 'Admin Cancellation Removed',
      totalAmount: orderItem.subTotal,
      paymentMethod: fullOrder.paymentMethod,
      transactionDate: new Date(),
    });

    // 🔔 Notifications
    const lastNotification = await Notifications.findOne({ order: [["ID", "DESC"]] });
    let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;
    const userName = user.medicalInstitutionName;

    const customerNotification = await Notifications.create({
      notificationId: withTimestamp("NTFY", nextNotificationNo++),
      senderId: customerID,
      receiverId: customerID,
      receiverType: "Customer",
      senderType: "System",
      notificationType: "Order Cancellation",
      title: "Order Cancellation Removed by Admin",
      message: `The admin has removed the cancellation for your order "${product.productName}" (Order #${fullOrder.orderId}). Your order is now back to Pending.`,
      isRead: false,
      createAt: new Date(),
    });

    const adminNotification = await Notifications.create({
      notificationId: withTimestamp("NTFY", nextNotificationNo++),
      senderId: customerID,
      receiverId: null,
      receiverType: "Admin",
      senderType: "System",
      notificationType: "Order Cancellation",
      title: `Admin Cancellation Removed — ${userName}`,
      message: `Admin removed the cancellation for "${product.productName}" (Order #${fullOrder.orderId}) of ${userName}. Order restored to Pending.`,
      isRead: false,
      createAt: new Date(),
    });

    const staffNotification = await Notifications.create({
      notificationId: withTimestamp("NTFY", nextNotificationNo++),
      senderId: customerID,
      receiverId: null,
      receiverType: "Staff",
      senderType: "System",
      notificationType: "Order Cancellation",
      title: `Admin Cancellation Removed — ${userName}`,
      message: `Admin removed the cancellation for "${product.productName}" (Order #${fullOrder.orderId}) of ${userName}. Order restored to Pending.`,
      isRead: false,
      createAt: new Date(),
    });

    // 📡 Socket emissions
    io.emit("orderCancelledUpdate", { orderCancelId: orderCancelID, orderItemId: orderItemID, customerId: customerID, newStatus: "Pending" });
    io.emit("newNotification_Customer", customerNotification);
    io.emit("newNotification_Admin", adminNotification);
    io.emit("newNotification_Staff", staffNotification);

    // Send email
    orderSendMail({
        to: user.loginEmail ? user.loginEmail : user.emailAddress,
        subject: 'Order cancellation has been removed by the admin.',
        html: adminCancellationRemovedTemplate(user.medicalInstitutionName, 'Pending', fullOrder.paymentMethod, fullOrder.orderId, product.productName)
    });

    return {
      success: true,
      message: "Admin cancellation successfully removed. Order restored to Pending.",
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const updateOrderStatusService = async (adminId, data) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return { success: false, message: "User not found" };
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: "Invalid payload format" };
    }

    const notificationsToEmit = [];
    const orderGroups = {};
    let orderID;

    for (const item of data) {
      const { customerID, orderItemID, changeStatus, cancelComments } = item;

      if (!customerID || !orderItemID || !changeStatus) {
        return {
          success: false,
          message: "Missing required fields",
        };
      }

      // 🔍 STEP 1 — Validate OrderItem
      const orderItem = await OrderItems.findByPk(orderItemID);
      if (!orderItem) {
        return {
          success: false,
          message: `OrderItem not found for orderItemID: ${orderItemID}`,
        };
      }

      const order = await Orders.findByPk(orderItem.orderId);
      if (!order) {
        return {
          success: false,
          message: `Order not found for orderId: ${order.orderId}`,
        };
      }
      orderID = order.ID;

      const customer = await Customer.findByPk(order.customerId);
      if (!customer) {
        return {
          success: false,
          message: `Customer not found for order ${order.orderId}`
        };
      }

      // 🔍 Validate customerId sent from frontend matches actual customerId
      if (customer.ID !== customerID) {
        return {
          success: false,
          message: `Customer mismatch for orderItemID: ${orderItemID}`,
        };
      }

      // Get product info for listOfProduct
      const product = await Products.findByPk(orderItem.productId);
      const productLine = `${product?.productName}${orderItem.value ? ` (${orderItem.value})` : ""} x${orderItem.quantity}`;

      // -------------------------
      // UPDATE ORDER ITEM STATUS
      // -------------------------
      const updateData = { orderStatus: changeStatus };

      const transactionTypeMap = {
        "Processing": "Order Processing",
        "Out for Delivery": "Out for Delivery",
        "Delivered": "Order Delivered",
      };

      if (changeStatus === "Delivered") {
        updateData.dateDelivered = new Date();
      }

      await OrderItems.update(updateData, {
        where: { ID: orderItem.ID }
      });

      // -------------------------
      // CANCELLED → CREATE OrderCancel
      // -------------------------
      if (changeStatus === "Cancelled") {
        // ✅ Stock is NOT restored on cancellation — stock was never deducted at order placement.
        // Stock deduction only happens when the order is marked as Delivered.

        /* ================================
          1️⃣ CREATE OrderCancel RECORD
        ================================= */
        const lastCancel = await OrderCancel.findOne({
          order: [["ID", "DESC"]],
        });

        const nextCancelNo = lastCancel ? Number(lastCancel.ID) + 1 : 1;
        const cancelId = withTimestamp("OCAN", nextCancelNo);

        // Check if PaymentProof exists for this order + customer
        const existingPaymentProof = await PaymentProof.findOne({
          where: {
            orderId: order.ID,
            customerId: customer.ID,
          },
        });

        // If NO payment proof found → cancellationStatus is "Completed"
        const cancellationStatus = existingPaymentProof ? "Processing" : "Completed";

        const cancelledData = await OrderCancel.create({
          cancelId,
          orderItemId: orderItem.ID,
          customerId: customer.ID,
          cancelComments: cancelComments,
          cancellationStatus: cancellationStatus,
          cancelledBy: "Admin",
        });

        // Fetch the complete order record to include auto-generated orderId
        const fullOrder = await Orders.findByPk(orderItem.orderId);

        /* ================================
          2️⃣ DEDUCT CANCELLED ITEM PRICE FROM ORDER TOTAL
             (only when cancellationStatus === 'Completed')
        ================================= */
        if (cancellationStatus === 'Completed') {
          let itemUnitPrice = 0;

          if (orderItem.productVariantCombinationId) {
            const variantCombination = await ProductVariantCombination.findByPk(
              orderItem.productVariantCombinationId
            );
            itemUnitPrice = Number(variantCombination?.price || 0);

          } else if (orderItem.productVariantValueId) {
            const variantValue = await ProductVariantValues.findByPk(
              orderItem.productVariantValueId
            );
            itemUnitPrice = Number(variantValue?.price || 0);

          } else {
            itemUnitPrice = Number(product?.price || 0);
          }

          const deductAmount = itemUnitPrice * Number(orderItem.quantity || 1);
          const newTotalAmount = Math.max(0, Number(fullOrder.totalAmount || 0) - deductAmount);
          const newSubtotal = Math.max(0, Number(fullOrder.subtotal || 0) - deductAmount);

          await fullOrder.update({
            totalAmount: newTotalAmount,
            subtotal: newSubtotal,
            updatedAt: new Date(),
          });
        }
  
        // 🔹 AUTO-GENERATE TRANSACTION ID & CREATE ORDER TRANSACTION
        const lastTransaction = await OrderTransaction.findOne({order: [['ID', 'DESC']]});
        const nextTransactionNo = lastTransaction ? Number(lastTransaction.ID) + 1 : 1;
        const transactionId = withTimestamp('TRXN', nextTransactionNo);
  
        await OrderTransaction.create({
          transactionId,
          orderId: fullOrder.ID,
          orderItemId: orderItem.ID,
          customerId: customer.ID,
          transactionType: 'Order Cancellation Processed',
          totalAmount: orderItem.subTotal,
          paymentMethod: fullOrder.paymentMethod,
          transactionDate: new Date(),
        });

        io.emit("addCancelOrder", {
          orderCancelId: cancelledData.ID,
          orderItemId: cancelledData.orderItemId,
          customerId: cancelledData.customerId,
          cancelComments: cancelledData.cancelComments,
          cancellationStatus: cancelledData.cancellationStatus,
          cancelledBy: cancelledData.cancelledBy,
          newStatus: "Cancelled"
        });
      }

      if (transactionTypeMap[changeStatus]) {
        const lastTransaction = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
        const nextTransactionNo = lastTransaction ? Number(lastTransaction.ID) + 1 : 1;
        const transactionId = withTimestamp('TRXN', nextTransactionNo);

        await OrderTransaction.create({
          transactionId,
          orderId: order.ID,
          orderItemId: orderItem.ID,
          customerId: customer.ID,
          transactionType: transactionTypeMap[changeStatus],
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          transactionDate: new Date(),
        });
      }

      // -------------------------
      // DELIVERED → DEDUCT STOCK
      // -------------------------
      if (changeStatus === "Delivered") {
        const unitType = product.unitType || 'PIECE';
        const piecesPerBox = Number(product.piecesPerBox) || 1;
        const quantityToDeduct = unitType === 'BOX'
          ? Number(orderItem.quantity) * piecesPerBox
          : Number(orderItem.quantity);

        /* ================================
          1️⃣ DEDUCT INVENTORY STOCK
        ================================= */
        const inventoryStock = await InventoryStock.findOne({
          where: {
            productId: orderItem.productId,
            variantValueId: orderItem.productVariantValueId || null,
            variantCombinationId: orderItem.productVariantCombinationId || null,
          },
        });

        if (!inventoryStock) {
          return { success: false, message: "Inventory stock record not found" };
        }

        const newTotalQuantity = Math.max(0, Number(inventoryStock.totalQuantity || 0) - quantityToDeduct);

        await inventoryStock.update({
          totalQuantity: newTotalQuantity,
          updatedAt: new Date(),
        });

        /* ================================
          2️⃣ DEDUCT INVENTORY BATCH (FIFO)
        ================================= */
        let remainingToDeduct = quantityToDeduct;
        const inventoryBatches = await InventoryBatch.findAll({
          where: {
            productId: orderItem.productId,
            variantValueId: orderItem.productVariantValueId || null,
            variantCombinationId: orderItem.productVariantCombinationId || null,
            remainingQuantity: { [Op.gt]: 0 },
          },
          order: [
            ["expirationDate", "ASC"],
            ["dateReceived", "ASC"],
          ],
        });

        for (const batch of inventoryBatches) {
          if (remainingToDeduct <= 0) break;
          const batchRemaining = Number(batch.remainingQuantity || 0);
          const deductFromBatch = Math.min(batchRemaining, remainingToDeduct);
          await batch.update({ remainingQuantity: batchRemaining - deductFromBatch });
          remainingToDeduct -= deductFromBatch;
        }

        /* ================================
          3️⃣ INVENTORY HISTORY (OUT)
        ================================= */
        const lastInventoryHistory = await InventoryHistory.findOne({ order: [["ID", "DESC"]] });
        const nextInventoryHistoryNo = lastInventoryHistory ? Number(lastInventoryHistory.ID) + 1 : 1;

        await InventoryHistory.create({
          inventoryHistoryId: withTimestamp("IHST", nextInventoryHistoryNo),
          productId: orderItem.productId,
          variantValueId: orderItem.productVariantValueId || null,
          variantCombinationId: orderItem.productVariantCombinationId || null,
          type: "OUT",
          quantity: quantityToDeduct,
          stockAfter: newTotalQuantity,
          referenceId: `DELIVERED-${order.orderId}`,
          remarks: `Order delivered to ${customer.medicalInstitutionName}. ${unitType === 'BOX' ? `(${orderItem.quantity} box/es × ${piecesPerBox} pcs)` : `(${orderItem.quantity} piece/s)`}`,
          createdAt: new Date(),
        });

        /* ================================
          4️⃣ OUT OF STOCK CHECK
        ================================= */
        if (newTotalQuantity === 0) {
          await Products.update({ isOutOfStock: true }, { where: { ID: orderItem.productId } });

          const lastOosNotif = await Notifications.findOne({ order: [["ID", "DESC"]] });
          let oosNotifNo = lastOosNotif ? Number(lastOosNotif.ID) + 1 : 1;

          const oosNotification = await Notifications.create({
            notificationId: withTimestamp("NTFY", oosNotifNo++),
            senderId: null,
            receiverId: null,
            receiverType: "All",
            senderType: "System",
            notificationType: "Product Update",
            title: "Out of Stock Alert",
            message: `❌ The product "${product.productName}" is now OUT OF STOCK.`,
            isRead: false,
            createAt: new Date(),
          });

          io.emit("lowStockAlert", oosNotification);

          const oosAdmins = await Admin.findAll({ where: { verifiedUser: true } });
          const oosCustomers = await Customer.findAll({ where: { verifiedCustomer: true } });
          const oosAllEmails = [...new Set([
            ...oosAdmins.map(a => a.emailAddress).filter(Boolean),
            ...oosCustomers.map(c => c.loginEmail || c.emailAddress).filter(Boolean),
          ])];

          if (oosAllEmails.length > 0) {
            orderSendMail({
              to: oosAllEmails.join(","),
              subject: `OUT OF STOCK: ${product.productName}`,
              html: stockAdjustmentLowStockTemplate(
                product.productName,
                "ORDER",
                quantityToDeduct,
                newTotalQuantity,
                `Order delivered to ${customer.medicalInstitutionName}`,
                0
              ),
            });
          }
        }

        /* ================================
          5️⃣ LOW STOCK ALERT
        ================================= */
        const inventorySettings = await ProductInventorySettings.findOne({
          where: {
            productId: orderItem.productId,
            variantValueId: orderItem.productVariantValueId || null,
            variantCombinationId: orderItem.productVariantCombinationId || null,
          },
        });

        if (inventorySettings && newTotalQuantity > 0 && newTotalQuantity <= inventorySettings.lowStockThreshold) {
          const lastLowNotif = await Notifications.findOne({ order: [["ID", "DESC"]] });
          let lowNotifNo = lastLowNotif ? Number(lastLowNotif.ID) + 1 : 1;

          const lowStockNotification = await Notifications.create({
            notificationId: withTimestamp("NTFY", lowNotifNo++),
            senderId: null,
            receiverId: null,
            receiverType: "All",
            senderType: "System",
            notificationType: "Product Update",
            title: "Low Stock Alert",
            message: `⚠️ The product "${product.productName}" is running low. Only ${newTotalQuantity} left in stock!`,
            isRead: false,
            createAt: new Date(),
          });

          io.emit("lowStockAlert", lowStockNotification);

          const allAdmins = await Admin.findAll({ where: { verifiedUser: true } });
          const allCustomers = await Customer.findAll({ where: { verifiedCustomer: true } });
          const allEmails = [...new Set([
            ...allAdmins.map(a => a.emailAddress).filter(Boolean),
            ...allCustomers.map(c => c.loginEmail || c.emailAddress).filter(Boolean),
          ])];

          if (allEmails.length > 0) {
            orderSendMail({
              to: allEmails.join(","),
              subject: `Low Stock Alert: ${product.productName}`,
              html: stockAdjustmentLowStockTemplate(
                product.productName,
                "ORDER",
                quantityToDeduct,
                newTotalQuantity,
                `Order delivered to ${customer.medicalInstitutionName}`,
                inventorySettings.lowStockThreshold
              ),
            });
          }
        }
      }

      // -------------------------
      // BUILD NOTIFICATION MESSAGE
      // -------------------------
      let AdminStaffNotifMessage = "";
      let notifMessage = "";
      let emailSubject = "";

      switch (changeStatus) {
        case "Processing":
          AdminStaffNotifMessage = `${productLine} for ${customer.medicalInstitutionName} has been processed.`;
          notifMessage = `Your order ${productLine} is now being processed.`;
          emailSubject = "Your order has been processed."; 
          break;

        case "Out for Delivery":
          AdminStaffNotifMessage = `${productLine} for ${customer.medicalInstitutionName} is out for delivery.`;
          notifMessage = `Your order ${productLine} is out for delivery.`;
          emailSubject = "Your order has been out for delivery";
          break;

        case "Delivered":
          AdminStaffNotifMessage = `${productLine} for ${customer.medicalInstitutionName} has been delivered.`;
          notifMessage = `Your order ${productLine} has been delivered successfully.`;
          emailSubject = "Your order has been delivered successfully";
          break;

        case "Cancelled":
          AdminStaffNotifMessage = `${productLine} for ${customer.medicalInstitutionName} has been cancelled.`;
          notifMessage = `Your order ${productLine} has been cancelled.`;
          emailSubject = "Your order has been cancelled";
          break;
        default:
          return { 
            success: false, 
            message: "Invalid changeStatus value." 
        };
      }

      // -------------------------
      // CREATE NOTIFICATIONS
      // -------------------------
      const lastNotif = await Notifications.findOne({
        order: [["ID", "DESC"]],
      });
      let notifCounter = lastNotif ? Number(lastNotif.ID) : 0;


      notifCounter++;
      const customerNotificationId = withTimestamp("NTFY", notifCounter);
      const customerNotif = await Notifications.create({
        notificationId: customerNotificationId,
        senderId: null,
        receiverId: customer.ID,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Transaction",
        title: customer.medicalInstitutionName,
        message: notifMessage,
        isRead: false,
        createAt: new Date()
      });


      notifCounter++;
      const adminNotificationId = withTimestamp("NTFY", notifCounter);
      const adminNotif = await Notifications.create({
        notificationId: adminNotificationId,
        senderId: customer.ID,
        receiverId: null,
        receiverType: "Admin",
        senderType: "System",
        notificationType: "Transaction",
        title: "Order Update",
        message: AdminStaffNotifMessage,
        isRead: false,
        createAt: new Date()
      });


      notifCounter++;
      const staffNotificationId = withTimestamp("NTFY", notifCounter);
      const staffNotif = await Notifications.create({
        notificationId: staffNotificationId,
        senderId: customer.ID,
        receiverId: null,
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Transaction",
        title: "Order Update",
        message: AdminStaffNotifMessage,
        isRead: false,
        createAt: new Date()
      });

      // Queue for socket emission
      notificationsToEmit.push({ customerNotif, adminNotif, staffNotif });
      
      // 🔥 NEW: Group data by orderId for email sending
      const orderId = order.ID;
      if (!orderGroups[orderId]) {
        orderGroups[orderId] = {
          order: order,
          customer: customer,
          changeStatus: changeStatus,
          emailSubject: emailSubject,
          productLines: []
        };
      }
      
      // Add product line to this order's list
      orderGroups[orderId].productLines.push(productLine);
    }

    // ==================== STEP 2: SEND ONE EMAIL PER ORDER ====================
    for (const orderId in orderGroups) {
      const group = orderGroups[orderId];
      
      // ✅ AFTER (With bullet points):
      const completeProductList = group.productLines.map(line => `<li>${line}</li>`).join('');
      
      orderSendMail({
        to: group.customer.loginEmail || group.customer.emailAddress || group.customer.repEmailAddress,
        subject: group.emailSubject,
        html: orderStatusUpdateTemplate(
          group.customer.medicalInstitutionName, 
          group.changeStatus, 
          group.order.paymentMethod, 
          completeProductList, // ✅ Complete list of products
          group.order.dateOrdered
        )
      });
    }

    for (const notif of notificationsToEmit) {
      io.emit("newNotification_Customer", notif.customerNotif);
      io.emit("newNotification_Admin", notif.adminNotif);
      io.emit("newNotification_Staff", notif.staffNotif);
    }

    const fullOrder = await Orders.findByPk(orderID);
    const fullOrderItems = await OrderItems.findAll({
      where: { orderId: fullOrder.ID },
    });

    io.emit("updateOrderStatus", {
      orderItems: fullOrderItems, // ✅ Array of all updated order items
    });

    return {
      success: true,
      message: "Order status updated successfully",
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const processRefundRequestService = async (adminId, refundID, newStatus) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "Admin user not found" };

    const refundOrder = await OrderRefund.findByPk(refundID);
    if (!refundOrder) return { success: false, message: "Refund request not found" };

    refundOrder.refundStatus = newStatus;
    await refundOrder.save();

    // ── Gather context for notifications ──
    const orderItem = await OrderItems.findByPk(refundOrder.orderItemId);
    const fullOrder = orderItem ? await Orders.findByPk(orderItem.orderId) : null;
    const customer = await Customer.findByPk(refundOrder.customerId);
    const product = orderItem ? await Products.findByPk(orderItem.productId) : null;

    if (orderItem && fullOrder && customer && product) {
      // Transaction
      const lastTx = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
      const txNo = lastTx ? Number(lastTx.ID) + 1 : 1;
      await OrderTransaction.create({
        transactionId: withTimestamp('TRXN', txNo),
        orderId: fullOrder.ID,
        orderItemId: orderItem.ID,
        customerId: customer.ID,
        transactionType: 'Order Refund Processing',
        totalAmount: orderItem.subTotal,
        paymentMethod: fullOrder.paymentMethod,
        transactionDate: new Date(),
      });

      // Notifications
      const lastNotif = await Notifications.findOne({ order: [['ID', 'DESC']] });
      let notifNo = lastNotif ? Number(lastNotif.ID) + 1 : 1;
      const msg = `Return/refund request for "${product.productName}" (Order #${fullOrder.orderId}) is now being processed.`;

      const custNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: null, receiverId: customer.ID, receiverType: 'Customer', senderType: 'System', notificationType: 'Order Return/Refund', title: 'Return/Refund Processing', message: msg, isRead: false, createAt: new Date() });
      const adminNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Admin', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Processing — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });
      const staffNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Staff', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Processing — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });

      io.emit('newNotification_Customer', custNotif);
      io.emit('newNotification_Admin', adminNotif);
      io.emit('newNotification_Staff', staffNotif);

      // Email
      orderSendMail({
        to: customer.loginEmail || customer.emailAddress,
        subject: 'Your Return/Refund Request is Being Processed',
        html: returnRefundStatusTemplate(customer.medicalInstitutionName, 'Processing', fullOrder.paymentMethod, product.productName, fullOrder.orderId),
      });
    }

    return { success: true, message: "Refund request updated successfully", updatedRefund: refundOrder };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const approveRefundRequestService = async (adminId, refundID, newStatus, pickupScheduledDate = null) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "Admin user not found" };

    const approveRefund = await OrderRefund.findByPk(refundID);
    if (!approveRefund) return { success: false, message: "Approve Refund request not found" };

    approveRefund.refundStatus = newStatus;
    if (approveRefund.returnMethod === 'PICKUP' && pickupScheduledDate) {
      approveRefund.pickupScheduledDate = new Date(pickupScheduledDate);
    } else if (approveRefund.returnMethod !== 'PICKUP') {
      approveRefund.pickupScheduledDate = null;
    }
    await approveRefund.save();

    // ── Gather context ──
    const orderItem = await OrderItems.findByPk(approveRefund.orderItemId);
    const fullOrder = orderItem ? await Orders.findByPk(orderItem.orderId) : null;
    const customer = await Customer.findByPk(approveRefund.customerId);
    const product = orderItem ? await Products.findByPk(orderItem.productId) : null;

    if (orderItem && fullOrder && customer && product) {
      // Transaction
      const lastTx = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
      const txNo = lastTx ? Number(lastTx.ID) + 1 : 1;
      await OrderTransaction.create({
        transactionId: withTimestamp('TRXN', txNo),
        orderId: fullOrder.ID,
        orderItemId: orderItem.ID,
        customerId: customer.ID,
        transactionType: 'Order Refund Approved',
        totalAmount: orderItem.subTotal,
        paymentMethod: fullOrder.paymentMethod,
        transactionDate: new Date(),
      });

      // Notifications
      const lastNotif = await Notifications.findOne({ order: [['ID', 'DESC']] });
      let notifNo = lastNotif ? Number(lastNotif.ID) + 1 : 1;
      const pickupInfo = approveRefund.returnMethod === 'PICKUP' && pickupScheduledDate
        ? ` Pickup scheduled on ${new Date(pickupScheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
        : '';
      const msg = `Return/refund request for "${product.productName}" (Order #${fullOrder.orderId}) has been approved.${pickupInfo}`;

      const custNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: null, receiverId: customer.ID, receiverType: 'Customer', senderType: 'System', notificationType: 'Order Return/Refund', title: 'Return/Refund Approved', message: msg, isRead: false, createAt: new Date() });
      const adminNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Admin', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Approved — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });
      const staffNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Staff', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Approved — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });

      io.emit('newNotification_Customer', custNotif);
      io.emit('newNotification_Admin', adminNotif);
      io.emit('newNotification_Staff', staffNotif);

      // Email
      const extraInfo = pickupInfo ? `<strong>Note:</strong>${pickupInfo}` : '';
      orderSendMail({
        to: customer.loginEmail || customer.emailAddress,
        subject: 'Your Return/Refund Request Has Been Approved',
        html: returnRefundStatusTemplate(customer.medicalInstitutionName, 'Processing', fullOrder.paymentMethod, product.productName, fullOrder.orderId, extraInfo),
      });
    }

    return { success: true, message: "Approve Refund request successfully", updatedRefund: approveRefund };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const sucessfullyProcessedRefundService = async (adminId, refundID, newStatus) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "Admin user not found" };

    const successProcessedRefund = await OrderRefund.findByPk(refundID);
    if (!successProcessedRefund) return { success: false, message: "Success processed refund not found" };

    successProcessedRefund.refundStatus = newStatus;
    await successProcessedRefund.save();

    // ── Gather context ──
    const orderItem = await OrderItems.findByPk(successProcessedRefund.orderItemId);
    const fullOrder = orderItem ? await Orders.findByPk(orderItem.orderId) : null;
    const customer = await Customer.findByPk(successProcessedRefund.customerId);
    const product = orderItem ? await Products.findByPk(orderItem.productId) : null;

    if (orderItem && fullOrder && customer && product) {
      // Transaction
      const lastTx = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
      const txNo = lastTx ? Number(lastTx.ID) + 1 : 1;
      await OrderTransaction.create({
        transactionId: withTimestamp('TRXN', txNo),
        orderId: fullOrder.ID,
        orderItemId: orderItem.ID,
        customerId: customer.ID,
        transactionType: 'Order Refund Completed',
        totalAmount: orderItem.subTotal,
        paymentMethod: fullOrder.paymentMethod,
        transactionDate: new Date(),
      });

      // Notifications
      const lastNotif = await Notifications.findOne({ order: [['ID', 'DESC']] });
      let notifNo = lastNotif ? Number(lastNotif.ID) + 1 : 1;
      const msg = `Return/refund request for "${product.productName}" (Order #${fullOrder.orderId}) has been successfully processed.`;

      const custNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: null, receiverId: customer.ID, receiverType: 'Customer', senderType: 'System', notificationType: 'Order Return/Refund', title: 'Return/Refund Completed', message: msg, isRead: false, createAt: new Date() });
      const adminNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Admin', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Completed — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });
      const staffNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Staff', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Completed — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });

      io.emit('newNotification_Customer', custNotif);
      io.emit('newNotification_Admin', adminNotif);
      io.emit('newNotification_Staff', staffNotif);

      // Email
      orderSendMail({
        to: customer.loginEmail || customer.emailAddress,
        subject: 'Your Return/Refund Request Has Been Successfully Processed',
        html: returnRefundStatusTemplate(customer.medicalInstitutionName, 'Successfully Processed', fullOrder.paymentMethod, product.productName, fullOrder.orderId),
      });
    }

    return { success: true, message: "Processed Refund successfully", updatedRefund: successProcessedRefund };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const rejectedRefundRequestService = async (adminId, refundID, newStatus, rejectedReason) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "Admin user not found" };

    const rejectedRefund = await OrderRefund.findByPk(refundID);
    if (!rejectedRefund) return { success: false, message: "Rejected refund not found" };

    rejectedRefund.refundStatus = newStatus;
    rejectedRefund.rejectedReason = rejectedReason;
    await rejectedRefund.save();

    // ── Gather context ──
    const orderItem = await OrderItems.findByPk(rejectedRefund.orderItemId);
    const fullOrder = orderItem ? await Orders.findByPk(orderItem.orderId) : null;
    const customer = await Customer.findByPk(rejectedRefund.customerId);
    const product = orderItem ? await Products.findByPk(orderItem.productId) : null;

    if (orderItem && fullOrder && customer && product) {
      // Transaction
      const lastTx = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
      const txNo = lastTx ? Number(lastTx.ID) + 1 : 1;
      await OrderTransaction.create({
        transactionId: withTimestamp('TRXN', txNo),
        orderId: fullOrder.ID,
        orderItemId: orderItem.ID,
        customerId: customer.ID,
        transactionType: 'Order Refund Rejected',
        totalAmount: orderItem.subTotal,
        paymentMethod: fullOrder.paymentMethod,
        transactionDate: new Date(),
      });

      // Notifications
      const lastNotif = await Notifications.findOne({ order: [['ID', 'DESC']] });
      let notifNo = lastNotif ? Number(lastNotif.ID) + 1 : 1;
      const msg = `Return/refund request for "${product.productName}" (Order #${fullOrder.orderId}) has been rejected. Reason: ${rejectedReason}`;

      const custNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: null, receiverId: customer.ID, receiverType: 'Customer', senderType: 'System', notificationType: 'Order Return/Refund', title: 'Return/Refund Rejected', message: msg, isRead: false, createAt: new Date() });
      const adminNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Admin', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Rejected — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });
      const staffNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Staff', senderType: 'System', notificationType: 'Order Return/Refund', title: `Return/Refund Rejected — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });

      io.emit('newNotification_Customer', custNotif);
      io.emit('newNotification_Admin', adminNotif);
      io.emit('newNotification_Staff', staffNotif);

      // Email
      orderSendMail({
        to: customer.loginEmail || customer.emailAddress,
        subject: 'Your Return/Refund Request Has Been Rejected',
        html: returnRefundStatusTemplate(customer.medicalInstitutionName, 'Rejected', fullOrder.paymentMethod, product.productName, fullOrder.orderId, `<strong>Reason:</strong> ${rejectedReason}`),
      });
    }

    return { success: true, message: "Reject refund successfully", updatedRefund: rejectedRefund };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const submitRefundProofService = async (adminId, body, file) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "Admin user not found" };

    const orderRefund = await OrderRefund.findByPk(body.refundID);
    if (!orderRefund) return { success: false, message: "Refund request not found" };

    orderRefund.refundStatus = body.newStatus;
    await orderRefund.save();

    const customer = await Customer.findByPk(body.customerID);
    if (!customer) return { success: false, message: "Customer not found" };

    // Upload image to Cloudinary
    let cloudResult = null;
    if (file?.receiptImage?.[0]) {
      try {
        cloudResult = await cloudinary.uploader.upload(file.receiptImage[0].path, { folder: "gamj/refundReceipt", resource_type: "image" });
      } catch (err) {
        return { success: false, message: "Image upload failed", error: err.message };
      }
      try { await fs.unlink(file.receiptImage[0].path); } catch (e) { console.error("Image unlink failed:", e.message); }
    }

    const lastRefundProof = await RefundProof.findOne({ order: [["ID", "DESC"]] });
    const nextRefundProofNo = lastRefundProof ? Number(lastRefundProof.ID) + 1 : 1;
    const refundProofId = withTimestamp("RFDP", nextRefundProofNo);

    const createdProof = await RefundProof.create({
      refundProofId,
      customerId: body.customerID,
      refundId: body.refundID,
      refundAmount: body.refundAmount,
      receiptImage: cloudResult ? cloudResult.secure_url : body.receiptImage,
      transactionID: body.transactionID,
    });

    // ── Notifications + Transaction + Email ──
    const orderItem = await OrderItems.findByPk(orderRefund.orderItemId);
    const fullOrder = orderItem ? await Orders.findByPk(orderItem.orderId) : null;
    const product = orderItem ? await Products.findByPk(orderItem.productId) : null;

    if (orderItem && fullOrder && product) {
      const lastTx = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
      const txNo = lastTx ? Number(lastTx.ID) + 1 : 1;
      await OrderTransaction.create({
        transactionId: withTimestamp('TRXN', txNo),
        orderId: fullOrder.ID,
        orderItemId: orderItem.ID,
        customerId: customer.ID,
        transactionType: 'Order Refund Completed',
        totalAmount: orderItem.subTotal,
        paymentMethod: fullOrder.paymentMethod,
        transactionDate: new Date(),
      });

      const lastNotif = await Notifications.findOne({ order: [['ID', 'DESC']] });
      let notifNo = lastNotif ? Number(lastNotif.ID) + 1 : 1;
      const msg = `Refund of ₱${Number(body.refundAmount).toFixed(2)} for "${product.productName}" (Order #${fullOrder.orderId}) has been successfully processed to your PayPal account.`;

      const custNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: null, receiverId: customer.ID, receiverType: 'Customer', senderType: 'System', notificationType: 'Order Return/Refund', title: 'Refund Successfully Processed', message: msg, isRead: false, createAt: new Date() });
      const adminNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Admin', senderType: 'System', notificationType: 'Order Return/Refund', title: `Refund Completed — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });
      const staffNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo++), senderId: customer.ID, receiverId: null, receiverType: 'Staff', senderType: 'System', notificationType: 'Order Return/Refund', title: `Refund Completed — ${customer.medicalInstitutionName}`, message: msg, isRead: false, createAt: new Date() });

      io.emit('newNotification_Customer', custNotif);
      io.emit('newNotification_Admin', adminNotif);
      io.emit('newNotification_Staff', staffNotif);

      orderSendMail({
        to: customer.loginEmail || customer.emailAddress,
        subject: 'Your Refund Has Been Successfully Processed',
        html: returnRefundStatusTemplate(customer.medicalInstitutionName, 'Successfully Processed', fullOrder.paymentMethod, product.productName, fullOrder.orderId, `<strong>Refund Amount:</strong> ₱${Number(body.refundAmount).toFixed(2)}<br><strong>PayPal Transaction ID:</strong> ${body.transactionID}`),
      });
    }

    return { success: true, message: "Refund processed successfully", refundProof: createdProof, updatedRefund: orderRefund };
  } catch (error) {
    console.error("submitRefundProofService ERROR:", error);
    return { success: false, message: error.message };
  }
};

// CANCELLED ORDER BY CUSTOMER
export const cancelSubmitAsRefundService = async (adminId, body, file) => {
  try {
    // ----------------------------------
    // 1. Validate admin
    // ----------------------------------
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "Admin user not found"
      };
    }

    // ----------------------------------
    // 2. Find refund order
    // ----------------------------------
    const orderCancel = await OrderCancel.findByPk(body.cancelID);
    if (!orderCancel) {
      return {
        success: false,
        message: "Submit as refund not found"
      };
    }

    // ----------------------------------
    // 3. Update refund status
    // ----------------------------------
    orderCancel.cancellationStatus = body.newStatus;
    await orderCancel.save();

    // ----------------------------------
    // 4. Validate customer
    // ----------------------------------
    const customer = await Customer.findByPk(body.customerID);
    if (!customer) {
      return {
        success: false,
        message: "Customer not found"
      };
    }

    const orderItem = await OrderItems.findByPk(orderCancel.orderItemId);
    if (!orderItem) {
      return { success: false, message: "Order item not found." };
    }

    const fullOrder = await Orders.findByPk(orderItem.orderId);
    if (!fullOrder) {
      return { success: false, message: "Order not found." };
    }

    const product = await Products.findByPk(orderItem.productId);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    // ----------------------------------
    // 5. Upload image to Cloudinary
    // ----------------------------------
   let cloudResult = null;

    if (file?.receiptImage?.[0]) {
      try {
        cloudResult = await cloudinary.uploader.upload(
          file.receiptImage[0].path,
          {
            folder: "gamj/refundReceipt",
            resource_type: "image"
          }
        );
      } catch (err) {
        return {
          success: false,
          message: "Image upload failed",
          error: err.message
        };
      }

      // Delete local image after upload
      try {
        await fs.unlink(file.receiptImage[0].path);
      } catch (unlinkErr) {
        console.error("Image unlink failed: ", unlinkErr.message);
      }
    }

    // 6. AUTO-GENERATE refundProofId
    const lastRefundProof = await RefundProof.findOne({
      order: [["ID", "DESC"]],
    });

    const nextRefundProofNo = lastRefundProof ? Number(lastRefundProof.ID) + 1 : 1;
    const refundProofId = withTimestamp("RFDP", nextRefundProofNo);

    // ----------------------------------
    // 7. Save RefundProof record
    // ----------------------------------
    await RefundProof.create({
      refundProofId,
      customerId: body.customerID,
      cancelId: body.cancelID,
      refundAmount: body.refundAmount,
      receiptImage: cloudResult ? cloudResult.secure_url : body.receiptImage,
      transactionID: body.transactionID
    });

    // 🔹 AUTO-GENERATE TRANSACTION ID & CREATE ORDER TRANSACTION
    const lastTransaction = await OrderTransaction.findOne({order: [['ID', 'DESC']]});
    const nextTransactionNo = lastTransaction ? Number(lastTransaction.ID) + 1 : 1;
    const transactionId = withTimestamp('TRXN', nextTransactionNo);

    await OrderTransaction.create({
      transactionId,
      orderId: fullOrder.ID,
      orderItemId: orderItem.ID,
      customerId: customer.ID,
      transactionType: 'Order Cancellation Refunded',
      totalAmount: orderItem.subTotal,
      paymentMethod: fullOrder.paymentMethod,
      transactionDate: new Date(),
    });

    // 🔔 Notifications
    const lastNotification = await Notifications.findOne({ order: [["ID", "DESC"]] });
    let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;
    const userName = customer.medicalInstitutionName;

    const customerNotification = await Notifications.create({
      notificationId: withTimestamp("NTFY", nextNotificationNo++),
      senderId: customer.ID,
      receiverId: customer.ID,
      receiverType: "Customer",
      senderType: "System",
      notificationType: "Order Cancellation",
      title: "Refund Submitted by Admin",
      message: `The admin has submitted a refund for your cancelled order "${product.productName}" (Order #${fullOrder.orderId}). Please check your PayPal account.`,
      isRead: false,
      createAt: new Date(),
    });

    const adminNotification = await Notifications.create({
      notificationId: withTimestamp("NTFY", nextNotificationNo++),
      senderId: customer.ID,
      receiverId: null,
      receiverType: "Admin",
      senderType: "System",
      notificationType: "Order Cancellation",
      title: `Refund Submitted — ${userName}`,
      message: `Refund proof has been submitted for "${product.productName}" (Order #${fullOrder.orderId}) of ${userName}.`,
      isRead: false,
      createAt: new Date(),
    });

    const staffNotification = await Notifications.create({
      notificationId: withTimestamp("NTFY", nextNotificationNo++),
      senderId: customer.ID,
      receiverId: null,
      receiverType: "Staff",
      senderType: "System",
      notificationType: "Order Cancellation",
      title: `Refund Submitted — ${userName}`,
      message: `Refund proof has been submitted for "${product.productName}" (Order #${fullOrder.orderId}) of ${userName}.`,
      isRead: false,
      createAt: new Date(),
    });

    io.emit("addCancelOrder", {
      orderCancelId: orderCancel.ID,
      orderItemId: orderCancel.orderItemId,
      customerId: orderCancel.customerId,
      cancelComments: orderCancel.cancelComments,
      cancellationStatus: orderCancel.cancellationStatus,
      cancelledBy: orderCancel.cancelledBy,
      newStatus: "Cancelled"
    });

    io.emit("newNotification_Customer", customerNotification);
    io.emit("newNotification_Admin", adminNotification);
    io.emit("newNotification_Staff", staffNotification);

    orderSendMail({
      to: customer.loginEmail ? customer.loginEmail : customer.emailAddress,
      subject: 'Your refund has been submitted by the admin.',
      html: adminRefundSubmittedTemplate(customer.medicalInstitutionName, 'Order Cancellation Refunded', fullOrder.paymentMethod, fullOrder.orderId, product.productName)
    });

    return {
      success: true,
      message: "Successfully Refunded",
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const cancelSubmitAsCompletedService = async (adminId, cancelID, newStatus) => {
  try {
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "Admin user not found"
      };
    }

    // Find refund order
    const orderCancel = await OrderCancel.findByPk(cancelID);
    if (!orderCancel) {
      return {
        success: false,
        message: "Order cancel submit as completed not found"
      };
    }

    // Update status
    orderCancel.cancellationStatus = newStatus;
    await orderCancel.save();

    return {
      success: true,
      message: "Submit as completed successfully",
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const fetchOrderTransactionService = async (adminId) => {
    try {
      const adminUser = await Admin.findByPk(adminId);
      if (!adminUser) {
          return {
              success: false,
              message: 'User not found'
          }
      }

      const orderTransaction = await OrderTransaction.findAll({});
      if (orderTransaction.length === 0) {
          return {
              success: true,
              orderTransaction: [],
          };
      }

      return {
          success: true,
          orderTransaction
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


// FETCH DELIVERY PROOF
export const fetchOrderDeliveryProofService = async (adminId) => {
    try {
      // Validate customer exists
      const user = await Admin.findByPk(adminId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const orderDeliveryProof = await OrderDeliveryProof.findAll({});
      if (orderDeliveryProof.length === 0) {
        return {
          success: false,
          orderDeliveryProof: [],
        };
      }

      return {
        success: true,
        orderDeliveryProof
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// ADD DELIVERY PROOF
export const addOrderDeliveryProofService = async (adminId, data, file) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const { orderItemId, riderName, deliveryNotes } = data;

    if (!orderItemId || !riderName) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const orderItem = await OrderItems.findByPk(orderItemId);

    if (!orderItem) {
      return {
        success: false,
        message: "Order item not found",
      };
    }

    // ----------------------------------
    // Upload image to Cloudinary
    // ----------------------------------
    let imageUrl = null;

    if (file?.proofImage?.[0]) {
      try {
        const cloudResult = await cloudinary.uploader.upload(
          file.proofImage[0].path,
          {
            folder: "gamj/orderDeliveryProof",
            resource_type: "image"
          }
        );

        imageUrl = cloudResult.secure_url;

      } catch (err) {
        return {
          success: false,
          message: "Image upload failed",
          error: err.message
        };
      }

      // Delete local image after upload
      try {
        await fs.unlink(file.proofImage[0].path);
      } catch (unlinkErr) {
        console.error("Image unlink failed: ", unlinkErr.message);
      }
    }

    // 6. AUTO-GENERATE refundProofId
    const lastOrderDeliveryProof = await RefundProof.findOne({
      order: [["ID", "DESC"]],
    });

    const nextOrderDeliveryProofNo = lastOrderDeliveryProof ? Number(lastOrderDeliveryProof.ID) + 1 : 1;
    const orderDeliveryProofId = withTimestamp("ODP", nextOrderDeliveryProofNo);

    await OrderDeliveryProof.create({
      orderDeliveryProofId,
      orderItemId: orderItemId,
      riderName: riderName,
      deliveryNotes: deliveryNotes || null,
      proofImage: imageUrl,
      createdBy: adminId,
    });

    return {
      success: true,
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};


export const adminDeleteOrderItemService = async (adminId, orderItemId) => {
  try {
    // 1. Validate admin
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }

    // 2. Validate order item
    const orderItem = await OrderItems.findByPk(orderItemId);
    if (!orderItem) {
      return { success: false, message: "Order item not found." };
    }

    // Soft-delete: set the correct flag based on who is deleting
    // userType: 'Delivery Staff' → isDeletedByDeliveryStaff = true
    // userType: 'Admin'          → isDeletedByAdmin = true
    if (admin.userType === "Delivery Staff") {
      await orderItem.update({ isDeletedByDeliveryStaff: true });
    } else {
      await orderItem.update({ isDeletedByAdmin: true });
    }

    return {
      success: true,
      message: "Order item deleted successfully.",
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

// ─── PROCESS RETURN/REFUND STOCK (DAMAGED or RETURN) ────────────────────────
export const processRefundStockService = async (adminId, refundId, stockAction, quantity) => {
  try {
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) return { success: false, message: "Admin not found" };

    if (!['DAMAGED', 'RETURN'].includes(stockAction)) {
      return { success: false, message: "Invalid stock action. Must be DAMAGED or RETURN." };
    }

    if (!quantity || Number(quantity) <= 0) {
      return { success: false, message: "Quantity must be greater than 0." };
    }

    const orderRefund = await OrderRefund.findByPk(refundId);
    if (!orderRefund) return { success: false, message: "Refund record not found." };

    const orderItem = await OrderItems.findByPk(orderRefund.orderItemId);
    if (!orderItem) return { success: false, message: "Order item not found." };

    const fullOrder = await Orders.findByPk(orderItem.orderId);
    if (!fullOrder) return { success: false, message: "Order not found." };

    const customer = await Customer.findByPk(orderRefund.customerId);
    if (!customer) return { success: false, message: "Customer not found." };

    const product = await Products.findByPk(orderItem.productId);
    if (!product) return { success: false, message: "Product not found." };

    const adjustQty = Number(quantity);

    // ── Find inventory stock ──
    const stock = await InventoryStock.findOne({
      where: {
        productId: orderItem.productId,
        variantValueId: orderItem.productVariantValueId || null,
        variantCombinationId: orderItem.productVariantCombinationId || null,
      },
    });
    if (!stock) return { success: false, message: "Inventory stock record not found." };

    const currentQty = Number(stock.totalQuantity || 0);

    // DAMAGED → deduct (subtract from stock)
    // RETURN  → add (restore to stock)
    let newTotalQuantity;
    if (stockAction === 'DAMAGED') {
      if (adjustQty > currentQty) {
        return { success: false, message: `Cannot deduct ${adjustQty} — only ${currentQty} in stock.` };
      }
      newTotalQuantity = Math.max(0, currentQty - adjustQty);
    } else {
      newTotalQuantity = currentQty + adjustQty;
    }

    await stock.update({ totalQuantity: newTotalQuantity, updatedAt: new Date() });

    // ── Update isOutOfStock flag ──
    if (newTotalQuantity === 0) {
      await Products.update({ isOutOfStock: true }, { where: { ID: orderItem.productId } });
    } else {
      await Products.update({ isOutOfStock: false }, { where: { ID: orderItem.productId } });
    }

    // ── Update InventoryBatch ──
    if (stockAction === 'DAMAGED') {
      // FIFO deduct
      let remaining = adjustQty;
      const batches = await InventoryBatch.findAll({
        where: {
          productId: orderItem.productId,
          variantValueId: orderItem.productVariantValueId || null,
          variantCombinationId: orderItem.productVariantCombinationId || null,
        },
        order: [["expirationDate", "ASC"], ["dateReceived", "ASC"]],
      });
      for (const batch of batches) {
        if (remaining <= 0) break;
        const batchRemaining = Number(batch.remainingQuantity || 0);
        const deduct = Math.min(batchRemaining, remaining);
        await batch.update({ remainingQuantity: batchRemaining - deduct, updatedAt: new Date() });
        remaining -= deduct;
      }
    } else {
      // RETURN → add to latest batch
      const latestBatch = await InventoryBatch.findOne({
        where: {
          productId: orderItem.productId,
          variantValueId: orderItem.productVariantValueId || null,
          variantCombinationId: orderItem.productVariantCombinationId || null,
        },
        order: [["dateReceived", "DESC"]],
      });
      if (latestBatch) {
        await latestBatch.update({
          quantityReceived: Number(latestBatch.quantityReceived) + adjustQty,
          remainingQuantity: Number(latestBatch.remainingQuantity) + adjustQty,
          updatedAt: new Date(),
        });
      }
    }

    // ── InventoryHistory ──
    const lastHistory = await InventoryHistory.findOne({ order: [["ID", "DESC"]] });
    const nextHistoryNo = lastHistory ? Number(lastHistory.ID) + 1 : 1;
    await InventoryHistory.create({
      inventoryHistoryId: withTimestamp("IHT", nextHistoryNo),
      productId: orderItem.productId,
      variantValueId: orderItem.productVariantValueId || null,
      variantCombinationId: orderItem.productVariantCombinationId || null,
      type: stockAction === 'DAMAGED' ? 'DAMAGED' : 'RETURN',
      adjustType: stockAction === 'DAMAGED' ? 'DEDUCT' : 'ADD',
      quantity: adjustQty,
      stockAfter: newTotalQuantity,
      referenceId: `REFUND-${orderRefund.refundId}`,
      remarks: `${stockAction === 'DAMAGED' ? 'Damaged stock deducted' : 'Returned stock restored'} from return/refund for ${customer.medicalInstitutionName} — Order #${fullOrder.orderId}`,
      createdAt: new Date(),
    });

    // ── OrderTransaction ──
    const lastTx = await OrderTransaction.findOne({ order: [['ID', 'DESC']] });
    const txNo = lastTx ? Number(lastTx.ID) + 1 : 1;
    await OrderTransaction.create({
      transactionId: withTimestamp('TRXN', txNo),
      orderId: fullOrder.ID,
      orderItemId: orderItem.ID,
      customerId: customer.ID,
      transactionType: 'Return/Refund Stock Processed',
      totalAmount: orderItem.subTotal,
      paymentMethod: fullOrder.paymentMethod,
      transactionDate: new Date(),
    });

    // ── Low stock / out-of-stock check ──
    const inventorySettings = await ProductInventorySettings.findOne({
      where: {
        productId: orderItem.productId,
        variantValueId: orderItem.productVariantValueId || null,
        variantCombinationId: orderItem.productVariantCombinationId || null,
      },
    });

    const shouldNotifyLow = stockAction === 'DAMAGED' && inventorySettings && newTotalQuantity > 0 && newTotalQuantity <= inventorySettings.lowStockThreshold;
    const shouldNotifyOos = newTotalQuantity === 0;

    if (shouldNotifyOos || shouldNotifyLow) {
      const lastNotif = await Notifications.findOne({ order: [["ID", "DESC"]] });
      let notifNo = lastNotif ? Number(lastNotif.ID) + 1 : 1;

      const alertTitle = shouldNotifyOos ? "Out of Stock Alert" : "Low Stock Alert";
      const alertMsg = shouldNotifyOos
        ? `❌ "${product.productName}" is now OUT OF STOCK after a return/refund stock adjustment.`
        : `⚠️ "${product.productName}" is running low after a return/refund stock adjustment. Only ${newTotalQuantity} left!`;

      const alertNotif = await Notifications.create({
        notificationId: withTimestamp("NTFY", notifNo++),
        senderId: null, receiverId: null, receiverType: "All", senderType: "System",
        notificationType: "Product Update", title: alertTitle, message: alertMsg,
        isRead: false, createAt: new Date(),
      });
      io.emit("lowStockAlert", alertNotif);

      const allAdmins = await Admin.findAll({ where: { verifiedUser: true } });
      const allCustomers = await Customer.findAll({ where: { verifiedCustomer: true } });
      const allEmails = [...new Set([
        ...allAdmins.map(a => a.emailAddress).filter(Boolean),
        ...allCustomers.map(c => c.loginEmail || c.emailAddress).filter(Boolean),
      ])];

      if (allEmails.length > 0) {
        orderSendMail({
          to: allEmails.join(","),
          subject: shouldNotifyOos ? `OUT OF STOCK: ${product.productName}` : `Low Stock Alert: ${product.productName}`,
          html: stockAdjustmentLowStockTemplate(
            product.productName,
            stockAction === 'DAMAGED' ? 'DEDUCT' : 'ADD',
            adjustQty,
            newTotalQuantity,
            `Return/Refund — Order #${fullOrder.orderId}`,
            inventorySettings?.lowStockThreshold || 0
          ),
        });
      }
    }

    // ── Notifications to Customer / Admin / Staff ──
    const lastNotif2 = await Notifications.findOne({ order: [["ID", "DESC"]] });
    let notifNo2 = lastNotif2 ? Number(lastNotif2.ID) + 1 : 1;
    const stockMsg = `Stock for "${product.productName}" has been ${stockAction === 'DAMAGED' ? 'deducted (damaged)' : 'restored (returned)'} — ${adjustQty} stock. Order #${fullOrder.orderId}.`;

    const custNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo2++), senderId: null, receiverId: customer.ID, receiverType: 'Customer', senderType: 'System', notificationType: 'Order Return/Refund', title: 'Return/Refund Stock Updated', message: stockMsg, isRead: false, createAt: new Date() });
    const adminNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo2++), senderId: customer.ID, receiverId: null, receiverType: 'Admin', senderType: 'System', notificationType: 'Order Return/Refund', title: `Stock Updated — ${customer.medicalInstitutionName}`, message: stockMsg, isRead: false, createAt: new Date() });
    const staffNotif = await Notifications.create({ notificationId: withTimestamp('NTFY', notifNo2++), senderId: customer.ID, receiverId: null, receiverType: 'Staff', senderType: 'System', notificationType: 'Order Return/Refund', title: `Stock Updated — ${customer.medicalInstitutionName}`, message: stockMsg, isRead: false, createAt: new Date() });

    io.emit('newNotification_Customer', custNotif);
    io.emit('newNotification_Admin', adminNotif);
    io.emit('newNotification_Staff', staffNotif);

    return {
      success: true,
      message: `Stock ${stockAction === 'DAMAGED' ? 'deducted (damaged)' : 'restored (returned)'} successfully. New total: ${newTotalQuantity}.`,
      newTotalQuantity,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

// ─── DELETE REFUND RECORD (hard delete — only for Completed/Rejected) ────────
export const deleteRefundRecordService = async (adminId, refundID) => {
  try {
    const admin = await Admin.findByPk(adminId);
    if (!admin) return { success: false, message: "Admin not found" };

    const refundRecord = await OrderRefund.findByPk(refundID);
    if (!refundRecord) return { success: false, message: "Refund record not found." };

    // Only allow deletion when the process is fully done
    const allowedStatuses = ["Successfully Processed", "Rejected"];
    if (!allowedStatuses.includes(refundRecord.refundStatus)) {
      return { success: false, message: "Can only delete completed or rejected refund records." };
    }

    await refundRecord.destroy();

    return { success: true, message: "Refund record deleted successfully." };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
