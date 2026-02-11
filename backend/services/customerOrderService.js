import Orders from "../models/orders.js";
import OrderItems from "../models/orderItems.js";
import Products from "../models/products.js";
import ProductVariantValues from "../models/productVariantValues.js";
import ProductVariantCombination from "../models/productVariantCombination.js";
import Customer from "../models/customer.js";
import OrderCancel from "../models/orderCancel.js"
import RefundProof from "../models/refundProof.js";
import OrderRefund from "../models/orderRefund.js";
import Notifications from "../models/notifications.js";
import Cart from "../models/cart.js";
import OrderTransaction from "../models/orderTransaction.js";
import InventoryStock from "../models/inventoryStock.js";
import InventoryBatch from "../models/inventoryBatch.js";
import InventoryHistory from "../models/inventoryHistory.js";
import PaymentProof from "../models/paymentProof.js";
import { Op } from "sequelize";
import { io } from "../server.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs/promises';
import { orderSendMail } from "../utils/mailer.js";
import { placeOrderTemplate, customerCancelledOrderTemplate, refundOrderTemplate } from "../utils/emailTemplates.js";

// 🔹 ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};

// CUSTOMER SIDE
export const addOrderService = async (customerId, paymentMethod, orderItems, cartItemsToDelete) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Validate input
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return { success: false, message: "Order items are required" };
    }

    if (!paymentMethod) {
      return { success: false, message: "Payment method is required" };
    }

    // ✅ PHASE 1: VALIDATE ALL BEFORE CREATING ORDER
    for (const item of orderItems) {
      const { productId, productVariantValueId, productVariantCombinationId } = item;

      const product = await Products.findByPk(productId);
      if (!product) {
        return { success: false, message: `Product ID ${productId} not found` };
      }

      if (productVariantCombinationId) {
        const variantCombo = await ProductVariantCombination.findByPk(productVariantCombinationId);
        if (!variantCombo) {
          return { success: false, message: `Product Variant Combination ID ${productVariantCombinationId} not found` };
        }
      }

      if (productVariantValueId) {
        const variantValue = await ProductVariantValues.findByPk(productVariantValueId);
        if (!variantValue) {
          return { success: false, message: `Product Variant Value ID ${productVariantValueId} not found` };
        }
      }
    }

    // 🔹 AUTO-GENERATE ORDER ID
    const lastOrder = await Orders.findOne({order: [['ID', 'DESC']]});
    const nextOrderNo = lastOrder ? Number(lastOrder.ID) + 1 : 1;
    const orderId = withTimestamp("ORDR", nextOrderNo);

    // Create main order
    const order = await Orders.create({
      orderId,
      customerId,
      paymentMethod,
    });

    // ORDER ITEM ID BASE
    const lastOrderItem = await OrderItems.findOne({order: [['ID', 'DESC']]});
    let nextOrderItemNo = lastOrderItem ? Number(lastOrderItem.ID) + 1 : 1;

    // ⭐ FIXED — NOTIFICATION ID BASE (DECLARE ONCE)
    const lastNotification = await Notifications.findOne({order: [["ID", "DESC"]]});
    let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;

    for (const item of orderItems) {
      const {productId, productVariantValueId, productVariantCombinationId, value, quantity, subTotal} = item;

      const inventoryStock = await InventoryStock.findOne({
        where: {
          productId,
          variantValueId: productVariantValueId || null,
          variantCombinationId: productVariantCombinationId || null,
        },
      });

      if (!inventoryStock) {
        return {
          success: false,
          message: "Inventory record not found for product",
        };
      }

      if (inventoryStock.totalQuantity < quantity) {
        return {
          success: false,
          message: "Insufficient stock available",
        };
      }

      const product = await Products.findByPk(productId);
      const productName = product.productName;

      // ✅ UPDATE INVENTORY STOCK
      const newTotalQuantity = Math.max((inventoryStock.totalQuantity || 0) - quantity, 0);
      await inventoryStock.update({ 
        totalQuantity: newTotalQuantity,
        updatedAt: new Date()
      });

      // ✅ UPDATE INVENTORY BATCH
      let remainingToDeduct = quantity;
      const inventoryBatches = await InventoryBatch.findAll({
        where: {
          productId,
          variantValueId: productVariantValueId || null,
          variantCombinationId: productVariantCombinationId || null,
          remainingQuantity: { [Op.gt]: 0 },
        },
        order: [
          ['expirationDate', 'ASC'],  // FIFO: oldest expiration first
          ['dateReceived', 'ASC'],     // Then by date received
        ],
      });

      for (const batch of inventoryBatches) {
        if (remainingToDeduct <= 0) break;

        const batchRemaining = Number(batch.remainingQuantity || 0);
        const deductFromBatch = Math.min(batchRemaining, remainingToDeduct);

        await batch.update({
          remainingQuantity: batchRemaining - deductFromBatch,
        });

        remainingToDeduct -= deductFromBatch;
      }

      if (remainingToDeduct > 0) {
        return {
          success: false,
          message: "Inventory batch inconsistency detected",
        };
      }

      // 🧾 INVENTORY HISTORY — STOCK OUT (ORDER)
      const lastInventoryHistory = await InventoryHistory.findOne({
        order: [['ID', 'DESC']]
      });

      const nextInventoryHistoryNo = lastInventoryHistory ? Number(lastInventoryHistory.ID) + 1 : 1;

      await InventoryHistory.create({
        inventoryHistoryId: withTimestamp("IHST", nextInventoryHistoryNo),
        productId,
        variantValueId: productVariantValueId || null,
        variantCombinationId: productVariantCombinationId || null,
        type: "OUT",                          // ✅ matches ENUM
        quantity: Number(quantity),
        referenceId: orderId,                 // OR fullOrder.orderId
        remarks: `Order placed by ${user.medicalInstitutionName}`,
        createdAt: new Date(),
      });


      // NEW SECTION: LOW STOCK ALERT
      if (newTotalQuantity <= inventoryStock.lowStockThreshold) {
        const lowStockMessage = newTotalQuantity === 0 ? `⚠️ The product "${productName}" is now OUT OF STOCK.` : `⚠️ The product "${productName}" is running low. Only ${newTotalQuantity} left in stock!`;
         // ⭐ FIXED — LOW STOCK NOTIFICATION ID
        const lowStockNotification = await Notifications.create({
            notificationId: withTimestamp("NTFY", nextNotificationNo++),
            senderId: null,
            receiverId: null,               // ✅ null = broadcast to all users
            receiverType: "All",            // ✅ notify all types
            senderType: "System",
            notificationType: "Product Update",
            title: "Low Stock Alert",
            message: lowStockMessage,
            isRead: false,
            createAt: new Date()
          }
        );

        io.emit("lowStockAlert", lowStockNotification);
      }

      const orderItemId = withTimestamp("OITM", nextOrderItemNo);
      nextOrderItemNo++;

      // ✅ Create Order Item
      await OrderItems.create(
        {
          orderItemId,
          orderId: order.ID,
          productId,
          productVariantValueId: productVariantValueId || null,
          productVariantCombinationId: productVariantCombinationId || null,
          value: value || "",
          quantity: Number(quantity) || 0,
          subTotal: Number(subTotal) || 0,
        },
      );
    }

    // Fetch the complete order record to include auto-generated orderId
    const fullOrder = await Orders.findByPk(order.ID);

    // CREATION OF ORDER TRANSATION RECORD
    const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.subTotal || 0), 0);

    const lastTransaction = await OrderTransaction.findOne({order: [['ID', 'DESC']]});
    const nextTransactionNo = lastTransaction ? Number(lastTransaction.ID) + 1 : 1;
    const transactionId = withTimestamp('TRXN', nextTransactionNo);

    await OrderTransaction.create({
      transactionId,
      orderId: fullOrder.ID,
      orderItemId: null, 
      customerId,
      transactionType: 'Order Placed',
      totalAmount,
      paymentMethod: fullOrder.paymentMethod,
      transactionDate: new Date(),
    });

    // ✅ Create notification for both Admin & Staff
    const notificationMessage = `placed a new order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`;
    const userName = user.medicalInstitutionName;

    // 1️⃣ CUSTOMER NOTIFICATION (specific customer only)
    const customerNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: null, // because it system
        receiverId: customerId,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Transaction",
        title: userName,
        message: notificationMessage,
        isRead: false,
        createAt: new Date()
      }
    );

    // 2️⃣ ADMIN NOTIFICATION (all admins)
    const adminNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,  // ✅ Who triggered this
        receiverId: null,      // ✅ null = broadcast to ALL admins
        receiverType: "Admin",
        senderType: "System",
        notificationType: "Transaction",
        title: userName,
        message: `placed a new order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`,
        isRead: false,
        createAt: new Date()
      }
    );
    
    // 2️⃣ ADMIN NOTIFICATION (all admins)
    const staffNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,  // ✅ Who triggered this
        receiverId: null,      // ✅ null = broadcast to ALL admins
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Transaction",
        title: userName,
        message: `placed a new order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`,
        isRead: false,
        createAt: new Date()
      }
    );


    // SOCKET.IO EMITS
    io.emit("newNotification_Customer", customerNotification);
    io.emit("newNotification_Admin", adminNotification);
    io.emit("newNotification_Staff", staffNotification);

    // ✅ Fetch all order items
    const fullOrderItems = await OrderItems.findAll({
      where: { orderId: fullOrder.ID },
    });

    // ✅ Emit full order
    io.emit("newOrder", {
      order: fullOrder,
      orderItems: fullOrderItems,
      customer: user,
    });

    // ✅ Delete selected cart items after successful order placement
    if (cartItemsToDelete && Array.isArray(cartItemsToDelete) && cartItemsToDelete.length > 0) {
      await Cart.destroy({
        where: { ID: cartItemsToDelete }
      }); 

      io.emit("cartUpdated", { customerId, deletedIds: cartItemsToDelete });
    }

    // Send email
    await orderSendMail({
        to: user.loginEmail ? user.loginEmail : user.emailAddress,
        subject: 'Your order has been placed.',
        html: placeOrderTemplate(user.medicalInstitutionName, 'Pending', fullOrder.paymentMethod, fullOrder.orderId),
        attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
    });

    return {
      success: true,
      message: "Order placed successfully"
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const fetchOrdersService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }


      const orders = await Orders.findAll({ where: { customerId: user.ID } });
      if (orders.length === 0) {
        return {
          success: false,
          message: "No orders found.",
          orders: [],
          orderItems: [],
        };
      }

      const orderItems = await OrderItems.findAll({
        where: {
          orderId: {
            [Op.in]: orders.map((order) => order.ID),
          },
        },
      });
      if (orderItems.length === 0) {
          return {
            success: false,
            message: "No order items found.",
            orders,
            orderItems: [],
          };
      }

      return {
          success: true,
          message: "Orders and order items fetched successfully.",
          orders,
          orderItems,
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderPaymentProofService = async (customerId) => {
    try {
      // Validate customer exists
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const paymentProof = await PaymentProof.findAll({ where: { customerId: user.ID } });
      if (paymentProof.length === 0) {
        return {
          success: false,
          paymentProof: [],
        };
      }

      return {
        success: true,
        paymentProof
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const deleteOrderPaymentProofService = async (customerId, paymentProofID) => {
    try {
      // Validate customer exists
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const paymentProof = await PaymentProof.findOne({
        where: {
          ID: paymentProofID,
          customerId: customerId 
        }
      });
      if (!paymentProof) {
        return {
          success: false,
          message: "Payment proof not found",
        };
      }

      const orders = await Orders.findByPk(paymentProof.orderId);
      if (!orders) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      await paymentProof.destroy();

      // ⭐ FIXED — NOTIFICATION ID BASE (DECLARE ONCE)
      const lastNotification = await Notifications.findOne({order: [["ID", "DESC"]]});
      let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;

      const userName = user.medicalInstitutionName;

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const adminNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,  // ✅ Who triggered this
        receiverId: null,      // ✅ null = broadcast to ALL admins
        receiverType: "Admin",
        senderType: "System",
        notificationType: `Transaction` ,
        title: `${userName} - Delete Proof of Payment`,
        message: `${userName} delete proof of payment for order #(${orders.orderId}).`,
        isRead: false,
        createAt: new Date()
      });
      

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const staffNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,
        receiverId: null,
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Transaction",
        title: `${userName} - Delete Proof of Payment`,
        message: `${userName} delete proof of payment for order #(${orders.orderId}).`,
        isRead: false,
        createAt: new Date(),
      });

      io.emit("newNotification_Admin", adminNotification);
      io.emit("newNotification_Staff", staffNotification);

      return {
        success: true,
        message: "Order proof of payment successfully deleted"
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const addOrderPaymentProofService = async (customerId, orderId, referenceId, amountPaid, receiptImage) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      orderId = Number(orderId);
      const orders = await Orders.findByPk(orderId);
      if (!orders) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Upload to clodinary
      const [upload1] = await Promise.all([
        cloudinary.uploader.upload(receiptImage.path, {
          folder: 'gamj/orderPaymentProof',
          resource_type: 'image',
        }),
      ]);
      
      // Delete local file
      try {
        await Promise.all([fs.unlink(receiptImage.path)]);
      } catch (unlinkError) {
        console.error('Warning: Failed to delete temp image(s):', unlinkError.message);
      }

      // Auto-generate paymentProofId
      const lastPaymentProof = await PaymentProof.findOne({
        order: [["ID", "DESC"]]
      });
  
      const nextNumber = lastPaymentProof ? lastPaymentProof.ID + 1 : 1;
      const paymentProofId = withTimestamp("PAYP", nextNumber);

      const newOrderPaymentProof = await PaymentProof.create({
        paymentProofId,
        customerId,
        orderId, 
        referenceId, 
        amountPaid, 
        receiptImage: upload1.secure_url
      });

      // ⭐ FIXED — NOTIFICATION ID BASE (DECLARE ONCE)
      const lastNotification = await Notifications.findOne({order: [["ID", "DESC"]]});
      let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;

      const userName = user.medicalInstitutionName;

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const adminNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,  // ✅ Who triggered this
        receiverId: null,      // ✅ null = broadcast to ALL admins
        receiverType: "Admin",
        senderType: "System",
        notificationType: `Transaction` ,
        title: `${userName} - Upload Proof of Payment`,
        message: `${userName} proof of payment for order #(${orders.orderId}).`,
        isRead: false,
        createAt: new Date()
      });
      

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const staffNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,
        receiverId: null,
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Transaction",
        title: `${userName} - Upload Proof of Payment`,
        message: `${userName} proof of payment for order #(${orders.orderId}).`,
        isRead: false,
        createAt: new Date(),
      });

      io.emit("newNotification_Admin", adminNotification);
      io.emit("newNotification_Staff", staffNotification);

      return {
        success: true,
        message: "Order proof of payment submitted successfully",
        newOrderPaymentProof
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const cancelOrderService = async (customerId, orderItemId, reasonForCancellation, cancelComments, cancelPaypalEmail, cancellationStatus, cancelledBy) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const orderItem = await OrderItems.findByPk(orderItemId);
      if (!orderItem) {
        return {
          success: false,
          message: "Order item not found",
        };
      }

      // ✅ 3. Fetch product info
      const product = await Products.findByPk(orderItem.productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found.",
        };
      }


      // --- Important variables ---
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
        return {
          success: false,
          message: "Inventory stock record not found",
        };
      }

      const newTotalQuantity = Number(inventoryStock.totalQuantity || 0) + quantityToRestore;

      await inventoryStock.update({
        totalQuantity: newTotalQuantity,
        updatedAt: new Date(),
      });

      /* ================================
       2️⃣ RESTORE INVENTORY BATCH (FIFO REVERSE)
        - Restore stock to FIFO / oldest-consumed batches (FEFO)
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

      if (restoreBatch) {
        const maxCapacity = Number(restoreBatch.quantityReceived);
        const currentRemaining = Number(restoreBatch.remainingQuantity);

        const newRemaining = Math.min(
          maxCapacity,
          currentRemaining + quantityToRestore
        );

        await restoreBatch.update({
          remainingQuantity: newRemaining,
        });
      } else {
        return {
          success: false,
          message: "No inventory batch found for restoration",
        };
      }

      /* ================================
        3️⃣ INVENTORY HISTORY (IN)
      ================================= */
      const lastInventoryHistory = await InventoryHistory.findOne({
        order: [["ID", "DESC"]],
      });

      const nextInventoryHistoryNo = lastInventoryHistory ? Number(lastInventoryHistory.ID) + 1 : 1;

      await InventoryHistory.create({
        inventoryHistoryId: withTimestamp("IHST", nextInventoryHistoryNo),
        productId: orderItem.productId,
        variantValueId: orderItem.productVariantValueId || null,
        variantCombinationId: orderItem.productVariantCombinationId || null,
        type: "IN",
        quantity: quantityToRestore,
        referenceId: `CANCEL-${orderItem.orderId}`,
        remarks: `Order cancelled by ${user.medicalInstitutionName}`,
        createdAt: new Date(),
      });

      // ✅ 6. Update order item status to Cancelled
      await orderItem.update({ orderStatus: "Cancelled" });

      // 🔹 AUTO-GENERATE ORDER ID
      const lastCancelOrder = await OrderCancel.findOne({order: [['ID', 'DESC']]});
      const nextCancelOrderNo = lastCancelOrder ? Number(lastCancelOrder.ID) + 1 : 1;
      const cancelId = withTimestamp("OCAN", nextCancelOrderNo);

      const cancelRecord = await OrderCancel.create({
        cancelId,
        orderItemId,
        customerId,
        reasonForCancellation,
        cancelComments: cancelComments || null,
        cancelPaypalEmail: cancelPaypalEmail || null,
        cancellationStatus,
        cancelledBy,
      });

      // Fetch the complete order record to include auto-generated orderId
      const fullOrder = await Orders.findByPk(orderItem.orderId);

      // 🔹 AUTO-GENERATE TRANSACTION ID & CREATE ORDER TRANSACTION
      const lastTransaction = await OrderTransaction.findOne({order: [['ID', 'DESC']]});
      const nextTransactionNo = lastTransaction ? Number(lastTransaction.ID) + 1 : 1;
      const transactionId = withTimestamp('TRXN', nextTransactionNo);

      await OrderTransaction.create({
        transactionId,
        orderId: fullOrder.ID,
        orderItemId: orderItem.ID,
        customerId,
        transactionType: 'Order Cancelled',
        totalAmount: orderItem.subTotal,
        paymentMethod: fullOrder.paymentMethod,
        transactionDate: new Date(),
      });


      // ⭐ FIXED — NOTIFICATION ID BASE (DECLARE ONCE)
      const lastNotification = await Notifications.findOne({order: [["ID", "DESC"]]});
      let nextNotificationNo = lastNotification ? Number(lastNotification.ID) + 1 : 1;

      // Notify the CUSTOMER (stock restoration)
      const stockRestoration = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: null,
        receiverId: customerId,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Order Cancellation",
        title: "Stock Restored",
        message: `Your cancelled order for "${product.productName}" has been processed. ${quantityToRestore} stock has been restored.`,
        isRead: false,
        createAt: new Date()
      });

      const userName = user.medicalInstitutionName;

      // 1️⃣ CUSTOMER NOTIFICATION (specific customer only)
      const customerNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId, 
        receiverId: customerId,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Order Cancellation",
        title: "Order Cancellation",
        message: `You cancelled your ${product.productName} order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`,
        isRead: false,
        createAt: new Date()
      });

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const adminNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,  // ✅ Who triggered this
        receiverId: null,      // ✅ null = broadcast to ALL admins
        receiverType: "Admin",
        senderType: "System",
        notificationType: "Order Cancellation",
        title: `${userName} - Order Cancelled`,
        message: `${userName} cancelled order #${fullOrder.orderId} (${fullOrder.paymentMethod}).`,
        isRead: false,
        createAt: new Date()
      });
      

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const staffNotification = await Notifications.create({
        notificationId: withTimestamp("NTFY", nextNotificationNo++),
        senderId: customerId,
        receiverId: null,
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Order Cancellation",
        title: `${userName} - Order Cancelled`,
        message: `${userName} cancelled order #${fullOrder.orderId} (${fullOrder.paymentMethod}).`,
        isRead: false,
        createAt: new Date(),
      });

      io.emit("addCancelOrder", {
        orderCancelId: cancelRecord.ID,
        orderItemId,
        customerId,
        reasonForCancellation: cancelRecord.reasonForCancellation,
        cancelComments: cancelRecord.cancelComments,
        cancelPaypalEmail: cancelRecord.cancelPaypalEmail,
        cancellationStatus: cancelRecord.cancellationStatus,
        cancelledBy: cancelRecord.cancelledBy,
        newStatus: "Cancelled"
      });

      io.emit("newNotification_Customer", customerNotification);
      io.emit("newNotification_Admin", adminNotification);
      io.emit("newNotification_Staff", staffNotification);

      io.emit("stockRestoration", stockRestoration);

      // Send email
      await orderSendMail({
          to: user.loginEmail ? user.loginEmail : user.emailAddress,
          subject: 'Your order cancellation has been processed.',
          html: customerCancelledOrderTemplate(user.medicalInstitutionName, 'Cancelled', fullOrder.paymentMethod, fullOrder.orderId, product.productName),
          attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
      });

      return {
          success: true,
          message: "Cancelled Order Successfully.",
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderCancelService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }


      const orderCancel = await OrderCancel.findAll({ where: { customerId: user.ID } });
      if (orderCancel.length === 0) {
        return {
          success: false,
          message: "Cancelled orders not found.",
          orderCancel: []
        };
      }

      return {
          success: true,
          message: "Cancelled orders fetched successfully.",
          orderCancel
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const removeCancelOrderService = async (customerId, orderItemId) => {
  try {  
    // 1️⃣ Validate customer
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // 2️⃣ Find the order item and its related order manually (no include)
    const orderItem = await OrderItems.findByPk(orderItemId);
    if (!orderItem) {
      return {
        success: false,
        message: "Order item not found.",
      };
    }

    // 3️⃣ Fetch the related order to validate it belongs to this customer
    const order = await Orders.findByPk(orderItem.orderId);
    if (!order) {
      return {
        success: false,
        message: "Order not found for this order item.",
      };
    }

    // 4️⃣ Ensure that the order actually belongs to this customer
    if (order.customerId !== customerId) {
      return {
        success: false,
        message: "This order item does not belong to the current customer.",
      };
    }

    // 4️⃣ Update flag
    await orderItem.update({ isDeletedByCustomer: true });

    io.emit("orderItemRemoved", {orderItemId, customerId});

    return {
      success: true,
      message: "Removed Item Successfully.",
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const cancelOrderRequestService = async (customerId, orderItemId, orderCancelId) => {
  try {
    // 1️⃣ Validate customer
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const orderItem = await OrderItems.findByPk(orderItemId);
    if (!orderItem) {
      return {
        success: false,
        message: "Order item not found for this customer.",
      };
    }

    const cancelRequest = await OrderCancel.findOne({
      where: { ID: orderCancelId, orderItemId, customerId },
    });
    if (!cancelRequest) {
      return {
        success: false,
        message: "Cancel request not found for this customer.",
      };
    }

    // 4️⃣ Delete the cancel request
    await cancelRequest.destroy();

    // 5️⃣ Reset the order item status if needed
    await orderItem.update({ orderStatus: 'Pending' });

    io.emit("orderCancelledUpdate", {orderCancelId, orderItemId, customerId, newStatus: "Pending"});

    return {
      success: true,
      message: "Cancellation request removed successfully.",
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const markRefundReceivedService = async (customerId, orderCancelId, orderRefundId) => {
  try {
    // 1️⃣ Validate customer
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return {
        success: false,
        message: "Customer not found.",
      };
    }

    // ORDER CANCEL ID
    if (orderCancelId) {
      const orderCancel = await OrderCancel.findOne({
        where: { ID: orderCancelId, customerId },
      });

      if (!orderCancel) {
        return {
          success: false,
          message: "No cancellation record found for this customer.",
        };
      }

      await orderCancel.update({ cancellationStatus: "Completed" });
      await RefundProof.destroy({
        where: {
          cancelId: orderCancelId,
          refundId: null, // ensure only cancel-related proof is removed
        },
      });

      io.emit("refundMarkedAsCompleted", {
        orderCancelId,
        cancellationStatus: "Completed",
      });

      return {
        success: true,
        message: "Cancellation refund marked as received successfully.",
      };
    }

    // ORDER REFUND ID
    if (orderRefundId) {
      const orderRefund = await OrderRefund.findOne({
        where: { ID: orderRefundId, customerId },
      });

      if (!orderRefund) {
        return {
          success: false,
          message: "No refund record found for this customer.",
        };
      }

      await orderRefund.update({ refundStatus: "Refunded" });
      await RefundProof.destroy({
        where: {
          refundId: orderRefundId,
          cancelId: null, // ensure only refund-related proof is removed
        },
      });

      io.emit("refundMarkedAsCompleted", {
        orderRefundId,
        refundStatus: "Refunded",
      });

      return {
        success: true,
        message: "Return/Refund marked as received successfully.",
      };
    }

    return { success: false, message: "Invalid request" };
    
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const fetchRefundProofService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const refundProof = await RefundProof.findAll({ where: { customerId: user.ID } });
      if (refundProof.length === 0) {
        return {
          success: false,
          message: "No refund proof found.",
          refundProof: []
        };
      }

      return {
          success: true,
          message: "Refund proof fetched successfully.",
          refundProof
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const addOrderRefundService = async (customerId, orderItemId, reasonForRefund, refundComments, imageProof1, imageProof2, refundResolution, otherReason, refundMethod, refundPaypalEmail, refundStatus) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      orderItemId = Number(orderItemId);
      const orderItem = await OrderItems.findByPk(orderItemId);
      if (!orderItem) {
        return {
          success: false,
          message: "Order item not found",
        };
      }

      // Upload to clodinary
      const [upload1, upload2] = await Promise.all([
        cloudinary.uploader.upload(imageProof1.path, {
          folder: 'gamj/orderRefund',
          resource_type: 'image',
        }),
        cloudinary.uploader.upload(imageProof2.path, {
          folder: 'gamj/orderRefund',
          resource_type: 'image',
        }),
      ]);
      
      // Delete local file
      try {
        await Promise.all([
          fs.unlink(imageProof1.path),
          fs.unlink(imageProof2.path),
        ]);
      } catch (unlinkError) {
        console.error('Warning: Failed to delete temp image(s):', unlinkError.message);
      }

      const newOrderRefund = await OrderRefund.create(
        {
          customerId,
          orderItemId,
          reasonForRefund,
          refundComments: refundComments || null,
          imageProof1: upload1.secure_url,
          imageProof2: upload2.secure_url,
          refundResolution,
          otherReason: otherReason || null,
          refundMethod: refundMethod || null,
          refundPaypalEmail: refundPaypalEmail || null,
          refundStatus: refundStatus || 'Pending',
          dateRequest: new Date(),
        }, {
          fields: [
            'customerId',
            'orderItemId',
            'reasonForRefund',
            'refundComments',
            'imageProof1',
            'imageProof2',
            'refundResolution',
            'otherReason',
            'refundMethod',
            'refundPaypalEmail',
            'refundStatus',
            'dateRequest'
          ]
      });

      // 5️⃣ Reset the order item status if needed
      await orderItem.update({ orderStatus: 'Return/Refund' });

      io.emit("addOrderRefund", {
        refundId: newOrderRefund.ID,
        orderItemId,
        customerId,  
        reasonForRefund: newOrderRefund.reasonForRefund,  
        refundComments: newOrderRefund.refundComments,    
        imageProof1: newOrderRefund.imageProof1,          
        imageProof2: newOrderRefund.imageProof2,          
        refundResolution: newOrderRefund.refundResolution,
        otherReason: newOrderRefund.otherReason,          
        refundMethod: newOrderRefund.refundMethod,        
        refundPaypalEmail: newOrderRefund.refundPaypalEmail, 
        refundStatus: newOrderRefund.refundStatus,
        orderStatus: "Return/Refund",
        dateRequest: newOrderRefund.dateRequest,          
      });

      let notificationMessage = '';
      if (refundMethod === 'PayPal Refund — Refund will be processed to your PayPal account.') {
        notificationMessage = 'The refund will be processed directly to your PayPal account';
      } else if (refundMethod === 'Cash Refund — Receive your refund in cash.') {
        notificationMessage = 'The refund will be issued in cash.';
      } else if (refundMethod === 'No Refund Needed — I don\'t need a refund') {
        notificationMessage = 'A refund is not needed.';
      }

      // Fetch the complete order record to include auto-generated orderId
      const fullOrder = await Orders.findByPk(orderItem.orderId);
      const userName = user.medicalInstitutionName;
      // Fetch product info FOR NOTITICATION
      const product = await Products.findByPk(orderItem.productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found.",
        };
      }

      // 1️⃣ CUSTOMER NOTIFICATION (specific customer only)
      const customerNotification = await Notifications.create({
        senderId: customerId, 
        receiverId: customerId,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Order Return/Refund",
        title: "Order Return/Refund",
        message: `You have requested a return/refund for ${product.productName} order #${fullOrder.orderId}. ${notificationMessage}`,
        isRead: false,
        createAt: new Date()
      }, {
        fields: [ 
          "senderId", 
          "receiverId",
          "receiverType", 
          "senderType", 
          "notificationType", 
          "title", 
          "message", 
          "isRead", 
          "createAt"
        ]
      });

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const adminNotification = await Notifications.create({
        senderId: customerId,  // ✅ Who triggered this
        receiverId: null,      // ✅ null = broadcast to ALL admins
        receiverType: "Admin",
        senderType: "System",
        notificationType: "Order Return/Refund",
        title: `${userName} - Return/Refund Request`,
        message: `${userName} has requested a return/refund for ${product.productName} (Order #${fullOrder.orderId}). Preferred refund method: ${refundMethod ? refundMethod : ''}.`,
        isRead: false,
        createAt: new Date()
      }, {
        fields: [ 
          "senderId", 
          "receiverId",
          "receiverType", 
          "senderType", 
          "notificationType", 
          "title", 
          "message", 
          "isRead", 
          "createAt"
        ]
      });
      

      // 2️⃣ ADMIN NOTIFICATION (all admins)
      const staffNotification = await Notifications.create({
        senderId: customerId,
        receiverId: null,
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Order Return/Refund",
        title: `${userName} - Return/Refund Request`,
        message: `${userName} has requested a return/refund for ${product.productName} (Order #${fullOrder.orderId}). Preferred refund method: ${refundMethod ? refundMethod : ''}.`,
        isRead: false,
        createAt: new Date(),
      }, {
        fields: [ 
          "senderId", 
          "receiverId",
          "receiverType", 
          "senderType", 
          "notificationType", 
          "title", 
          "message", 
          "isRead", 
          "createAt"
        ]
      });

      io.emit("newNotification_Customer", customerNotification);
      io.emit("newNotification_Admin", adminNotification);
      io.emit("newNotification_Staff", staffNotification);

      // Send email
      await orderSendMail({
          to: user.loginEmail ? user.loginEmail : user.emailAddress,
          subject: 'Your requested order return/refund has been processed.',
          html: refundOrderTemplate(user.medicalInstitutionName, 'Return/Refund', refundMethod, fullOrder.orderId, product.productName),
          attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
      });

      return {
        success: true,
        message: "Refund request submitted successfully",
        newOrderRefund
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderRefundService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const orderRefund = await OrderRefund.findAll({ where: { customerId } });
      if (orderRefund.length === 0) {
        return {
          success: false,
          message: "No refund proof found.",
          orderRefund: []
        };
      }

      return {
          success: true,
          message: "Refund proof fetched successfully.",
          orderRefund
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const cancelOrderRefundRequestService = async (customerId, orderRefundId, orderItemId) => {
  try {
    // 1️⃣ Validate customer
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // 2️⃣ Validate refund request
    const orderRefund = await OrderRefund.findOne({
      where: { ID: orderRefundId, customerId },
    });
    if (!orderRefund) {
      return {
        success: false,
        message: "Refund request not found.",
      };
    }

    // 3️⃣ Validate related order item
    const orderItem = await OrderItems.findByPk(orderItemId);
    if (!orderItem) {
      return {
        success: false,
        message: "Order item not found for this customer.",
      };
    }

    // 5️⃣ Reset order item status
    await orderItem.update({ orderStatus: "Delivered" });

    // 4️⃣ Delete the refund request
    await orderRefund.destroy();

  
    // 6️⃣ Emit event to update frontend in real-time
    io.emit("cancelOrderRefundRequest", {
      orderRefundId,
      orderItemId,
      customerId,
      orderStatus: "Delivered",
    });

    return {
      success: true,
      message: "Refund request cancelled successfully.",
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};



