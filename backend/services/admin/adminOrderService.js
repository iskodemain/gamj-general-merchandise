import Admin from "../../models/admin.js";
import OrderItems from "../../models/orderItems.js";
import Orders from "../../models/orders.js";
import OrderRefund from '../../models/orderRefund.js'
import OrderCancel from '../../models/orderCancel.js'
import Customer from "../../models/customer.js";
import Products from "../../models/products.js";
import ProductVariantValues from "../../models/productVariantValues.js";
import ProductVariantCombination from "../../models/ProductVariantCombination.js";
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
import fs from 'fs/promises';
import { adminCancellationRemovedTemplate, adminRefundSubmittedTemplate } from "../../utils/emailTemplates.js";


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

    const quantityToDeduct = Number(orderItem.quantity || 0);

    // 5️⃣ Deduct InventoryStock
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
    await inventoryStock.update({ totalQuantity: newTotalQuantity, updatedAt: new Date() });

    // 6️⃣ Deduct InventoryBatch (FIFO)
    const deductBatch = await InventoryBatch.findOne({
      where: {
        productId: orderItem.productId,
        variantValueId: orderItem.productVariantValueId || null,
        variantCombinationId: orderItem.productVariantCombinationId || null,
      },
      order: [["expirationDate", "ASC"], ["dateReceived", "ASC"]],
    });
    if (deductBatch) {
      const newRemaining = Math.max(0, Number(deductBatch.remainingQuantity || 0) - quantityToDeduct);
      await deductBatch.update({ remainingQuantity: newRemaining });
    } else {
      return { success: false, message: "No inventory batch found for deduction" };
    }

    // 7️⃣ InventoryHistory (OUT)
    const lastInventoryHistory = await InventoryHistory.findOne({ order: [["ID", "DESC"]] });
    const nextInventoryHistoryNo = lastInventoryHistory ? Number(lastInventoryHistory.ID) + 1 : 1;

    await InventoryHistory.create({
      inventoryHistoryId: withTimestamp("IHST", nextInventoryHistoryNo),
      productId: orderItem.productId,
      variantValueId: orderItem.productVariantValueId || null,
      variantCombinationId: orderItem.productVariantCombinationId || null,
      type: "OUT",
      adjustType: null,
      quantity: quantityToDeduct,
      stockAfter: newTotalQuantity,
      referenceId: `CANCEL-REQUEST-REMOVED-${orderItem.orderId}`,
      remarks: `Admin cancellation removed for ${user.medicalInstitutionName} — STOCK DEDUCTED AGAIN`,
      createdAt: new Date(),
    });

    // 8️⃣ Delete the cancel request
    await removeCancellation.destroy();

    // 9️⃣ Reset order item status
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
      message: `The admin has removed the cancellation for your order "${product.productName}" (Order #${fullOrder.orderId}). Your order is now back to Pending. ${quantityToDeduct} stock has been deducted again.`,
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
      message: `Admin removed the cancellation for "${product.productName}" (Order #${fullOrder.orderId}) of ${userName}. Order restored to Pending. ${quantityToDeduct} stock has been deducted again.`,
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
      message: `Admin removed the cancellation for "${product.productName}" (Order #${fullOrder.orderId}) of ${userName}. Order restored to Pending. ${quantityToDeduct} stock has been deducted again.`,
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
      message: "Admin cancellation successfully removed. Stock has been deducted again.",
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
        const quantityToRestore = Number(orderItem.quantity || 0);

        /* ================================
          1️⃣ RESTORE INVENTORY STOCK
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

        const newTotalQuantity = Number(inventoryStock.totalQuantity || 0) + quantityToRestore;

        await inventoryStock.update({
          totalQuantity: newTotalQuantity,
          updatedAt: new Date(),
        });

        /* ================================
          2️⃣ RESTORE INVENTORY BATCH (FEFO)
        ================================= */
        const restoreBatch = await InventoryBatch.findOne({
          where: {
            productId: orderItem.productId,
            variantValueId: orderItem.productVariantValueId || null,
            variantCombinationId: orderItem.productVariantCombinationId || null,
          },
          order: [
            ["expirationDate", "ASC"],
            ["dateReceived", "ASC"],
          ],
        });

        if (!restoreBatch) {
          return { success: false, message: "No inventory batch found for restoration" };
        }

        const maxCapacity = Number(restoreBatch.quantityReceived);
        const currentRemaining = Number(restoreBatch.remainingQuantity);
        const newRemaining = Math.min(maxCapacity, currentRemaining + quantityToRestore);

        await restoreBatch.update({ remainingQuantity: newRemaining });

        /* ================================
          3️⃣ INVENTORY HISTORY (IN)
        ================================= */
        const lastInventoryHistory = await InventoryHistory.findOne({
          order: [["ID", "DESC"]],
        });

        const nextInventoryHistoryNo = lastInventoryHistory
          ? Number(lastInventoryHistory.ID) + 1
          : 1;

        await InventoryHistory.create({
          inventoryHistoryId: withTimestamp("IHST", nextInventoryHistoryNo),
          productId: orderItem.productId,
          variantValueId: orderItem.productVariantValueId || null,
          variantCombinationId: orderItem.productVariantCombinationId || null,
          type: "RETURN",
          quantity: quantityToRestore,
          stockAfter: newTotalQuantity,
          referenceId: `CANCEL-${orderItem.orderId}`,
          remarks: `Order cancelled by Admin for ${customer.medicalInstitutionName}`,
          createdAt: new Date(),
        });

        /* ================================
          4️⃣ CREATE OrderCancel RECORD
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
          5️⃣ DEDUCT CANCELLED ITEM PRICE FROM ORDER TOTAL
             (only when cancellationStatus === 'Completed')
        ================================= */
        if (cancellationStatus === 'Completed') {
          let itemUnitPrice = 0;

          if (orderItem.productVariantCombinationId) {
            // Priority 1: Variant Combination price
            const variantCombination = await ProductVariantCombination.findByPk(
              orderItem.productVariantCombinationId
            );
            itemUnitPrice = Number(variantCombination?.price || 0);

          } else if (orderItem.productVariantValueId) {
            // Priority 2: Variant Value price
            const variantValue = await ProductVariantValue.findByPk(
              orderItem.productVariantValueId
            );
            itemUnitPrice = Number(variantValue?.price || 0);

          } else {
            // Priority 3: Base product price
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
    // Verify admin exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return {
        success: false,
        message: "Admin user not found"
      };
    }

    // Find refund order
    const refundOrder = await OrderRefund.findByPk(refundID);
    if (!refundOrder) {
      return {
        success: false,
        message: "Refund request not found"
      };
    }

    // Update status
    refundOrder.refundStatus = newStatus;
    await refundOrder.save();

    return {
      success: true,
      message: "Refund request updated successfully",
      updatedRefund: refundOrder,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const approveRefundRequestService = async (adminId, refundID, newStatus, pickupScheduledDate = null) => {
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
    const approveRefund = await OrderRefund.findByPk(refundID);
    if (!approveRefund) {
      return {
        success: false,
        message: "Approve Refund request not found"
      };
    }

    // Update status
    approveRefund.refundStatus = newStatus;

    // Only save pickupScheduledDate if returnMethod is PICKUP and date is provided
    if (approveRefund.returnMethod === 'PICKUP' && pickupScheduledDate) {
      approveRefund.pickupScheduledDate = new Date(pickupScheduledDate);
    } else if (approveRefund.returnMethod !== 'PICKUP') {
      approveRefund.pickupScheduledDate = null; // clear it if not pickup
    }

    await approveRefund.save();

    return {
      success: true,
      message: "Approve Refund request successfully",
      updatedRefund: approveRefund,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const sucessfullyProcessedRefundService = async (adminId, refundID, newStatus) => {
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
    const successProcessedRefund = await OrderRefund.findByPk(refundID);
    if (!successProcessedRefund) {
      return {
        success: false,
        message: "Success processed refund not found"
      };
    }

    // Update status
    successProcessedRefund.refundStatus = newStatus;
    await successProcessedRefund.save();

    return {
      success: true,
      message: "Processed Refund successfully",
      updatedRefund: successProcessedRefund,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const rejectedRefundRequestService = async (adminId, refundID, newStatus, rejectedReason) => {
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
    const rejectedRefund = await OrderRefund.findByPk(refundID);
    if (!rejectedRefund) {
      return {
        success: false,
        message: "Rejected refund not found"
      };
    }

    // Update status
    rejectedRefund.refundStatus = newStatus;
    rejectedRefund.rejectedReason = rejectedReason;
    await rejectedRefund.save();

    return {
      success: true,
      message: "Reject refund successfully",
      updatedRefund: rejectedRefund,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const submitRefundProofService = async (adminId, body, file) => {
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
    const orderRefund = await OrderRefund.findByPk(body.refundID);
    if (!orderRefund) {
      return {
        success: false,
        message: "Refund request not found"
      };
    }

    // ----------------------------------
    // 3. Update refund status
    // ----------------------------------
    orderRefund.refundStatus = body.newStatus;
    await orderRefund.save();

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
    const createdProof = await RefundProof.create({
      refundProofId,
      customerId: body.customerID,
      refundId: body.refundID,
      refundAmount: body.refundAmount,
      receiptImage: cloudResult ? cloudResult.secure_url : body.receiptImage, // supports image URL fallback
      transactionID: body.transactionID
    });

    return {
      success: true,
      message: "Refund processed successfully",
      refundProof: createdProof,
      updatedRefund: orderRefund
    };

  } catch (error) {
    console.error("submitRefundProofService ERROR:", error);
    return {
      success: false,
      message: error.message
    };
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

