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
import { Op } from "sequelize";
import { io } from "../server.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs/promises';
import { orderSendMail } from "../utils/mailer.js";
import { placeOrderTemplate } from "../utils/emailTemplates.js";

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

    // Create main order
    const order = await Orders.create(
      {
        customerId,
        paymentMethod,
      }, {
        fields: [
          'customerId',
          'paymentMethod'
        ]
    });

    for (const item of orderItems) {
      const {productId, productVariantValueId, productVariantCombinationId, value, quantity, subTotal} = item;

      // ✅ Create Order Item
      await OrderItems.create(
        {
          orderId: order.ID,
          productId,
          productVariantValueId: productVariantValueId || null,
          productVariantCombinationId: productVariantCombinationId || null,
          value: value || "",
          quantity: Number(quantity) || 0,
          subTotal: Number(subTotal) || 0,
        },
        {
          fields: [
            "orderId",
            "productId",
            "productVariantValueId",
            "productVariantCombinationId",
            "value",
            "quantity",
            "subTotal",
          ],
        }
      );

      let newStock = 0;
      let productName = "";

       // ✅ Update stock
      if (productVariantCombinationId) {
        const variantCombo = await ProductVariantCombination.findByPk(productVariantCombinationId);
        newStock = Math.max((variantCombo.stock || 0) - quantity, 0);
        await variantCombo.update({ stock: newStock });

        const product = await Products.findByPk(productId);
        productName = product.productName; // FOR NOTIFICATION
        const allVariantCombos = await ProductVariantCombination.findAll({ where: { productId } });
        const hasStock = allVariantCombos.some(v => v.stock > 0);
        await product.update({ isOutOfStock: !hasStock });
      } 
      else if (productVariantValueId) {
        const variantValue = await ProductVariantValues.findByPk(productVariantValueId);
        newStock = Math.max((variantValue.stock || 0) - quantity, 0);
        await variantValue.update({ stock: newStock });

        const product = await Products.findByPk(productId);
        productName = product.productName; // FOR NOTIFICATION
        const allVariantValues = await ProductVariantValues.findAll({ where: { productId } });
        const hasStock = allVariantValues.some(v => v.stock > 0);
        await product.update({ isOutOfStock: !hasStock });
      } 
      else {
        const product = await Products.findByPk(productId);
        newStock = Math.max((product.stockQuantity || 0) - quantity, 0);
        await product.update({
          stockQuantity: newStock,
          isOutOfStock: newStock <= 0 ? true : false,
        });
        productName = product.productName; // FOR NOTIFICATION
      }

      // NEW SECTION: LOW STOCK ALERT
      if (newStock <= 10) {
        const lowStockMessage = newStock === 0 ? `⚠️ The product "${productName}" is now OUT OF STOCK.` : `⚠️ The product "${productName}" is running low. Only ${newStock} left in stock!`;

        const lowStockNotification = await Notifications.create({
          senderId: null,
          receiverId: null,               // ✅ null = broadcast to all users
          receiverType: "All",            // ✅ notify all types
          senderType: "System",
          notificationType: "Product Update",
          title: "Low Stock Alert",
          message: lowStockMessage,
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

        io.emit("lowStockAlert", lowStockNotification);
      }
    }

    
    // Fetch the complete order record to include auto-generated orderId
    const fullOrder = await Orders.findByPk(order.ID);

    // ✅ Create notification for both Admin & Staff
    const notificationMessage = `placed a new order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`;
    const userName = user.medicalInstitutionName;

    // 1️⃣ CUSTOMER NOTIFICATION (specific customer only)
    const customerNotification = await Notifications.create({
      senderId: null, // because it system
      receiverId: customerId,
      receiverType: "Customer",
      senderType: "System",
      notificationType: "Transaction",
      title: userName,
      message: notificationMessage,
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
      notificationType: "Transaction",
      title: userName,
      message: `placed a new order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`,
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
      senderId: customerId,  // ✅ Who triggered this
      receiverId: null,      // ✅ null = broadcast to ALL admins
      receiverType: "Staff",
      senderType: "System",
      notificationType: "Transaction",
      title: userName,
      message: `placed a new order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`,
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

      // ✅ 4. Determine variant structure
      const { hasVariant, hasVariantCombination } = product;

      // --- Important variables ---
      const quantityToRestore = Number(orderItem.quantity || 0);
      let updatedStock;

      const productStock = Number(product.stockQuantity || 0);

      // ✅ 5. Update stock logic
      if (hasVariant && !hasVariantCombination) {
        // 👉 Product has individual variant values (e.g., size = "Small", "Medium") but no combined sets
        const variantValue = await ProductVariantValues.findOne({
          where: { productId: product.ID, value: orderItem.value },
        });

        if (variantValue) {
          const variantStock = Number(variantValue.stock || 0);
          updatedStock = variantStock + quantityToRestore;
          await variantValue.update({ stock: updatedStock });
        }

        // Also update main product stock
        await product.update({ stockQuantity: productStock + quantityToRestore });
      }

      else if (hasVariant && hasVariantCombination) {
        // 👉 Product uses combination variants (e.g., size + color)
        const variantCombination = await ProductVariantCombination.findOne({
          where: { productId: product.ID, combinations: orderItem.value },
        });

        if (variantCombination) {
          const comboStock = Number(variantCombination.stock || 0);
          updatedStock = comboStock + quantityToRestore;
          await variantCombination.update({ stock: updatedStock });
        }

        // Also update main product stock
        await product.update({ stockQuantity: productStock + quantityToRestore });
      }

      else {
        // 👉 Product has no variants — just update its main stock
        updatedStock = productStock + quantityToRestore;
        await product.update({ stockQuantity: updatedStock });
      }
      
      // ✅ 6. Update order item status to Cancelled
      await orderItem.update({ orderStatus: "Cancelled" });

      const cancelRecord = await OrderCancel.create({
        orderItemId,
        customerId,
        reasonForCancellation,
        cancelComments: cancelComments || null,
        cancelPaypalEmail: cancelPaypalEmail || null,
        cancellationStatus,
        cancelledBy,
      }, {
        fields: [
          'orderItemId',
          'customerId',
          'reasonForCancellation',
          'cancelComments',
          'cancelPaypalEmail',
          'cancellationStatus',
          'cancelledBy'
        ]
      });

      // Notify the CUSTOMER (stock restoration)
      const stockRestoration = await Notifications.create({
        senderId: null,
        receiverId: customerId,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Order Cancellation",
        title: "Stock Restored",
        message: `Your cancelled order for "${product.productName}" has been processed. ${quantityToRestore} stock has been restored.`,
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

      // Fetch the complete order record to include auto-generated orderId
      const fullOrder = await Orders.findByPk(orderItem.orderId);

      const userName = user.medicalInstitutionName;

      // 1️⃣ CUSTOMER NOTIFICATION (specific customer only)
      const customerNotification = await Notifications.create({
        senderId: customerId, 
        receiverId: customerId,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Order Cancellation",
        title: "Order Cancellation",
        message: `You cancelled your ${product.productName} order #${fullOrder.orderId} with ${fullOrder.paymentMethod}.`,
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
        notificationType: "Order Cancellation",
        title: `${userName} - Order Cancelled`,
        message: `${userName} cancelled order #${fullOrder.orderId} (${fullOrder.paymentMethod}).`,
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
        notificationType: "Order Cancellation",
        title: `${userName} - Order Cancelled`,
        message: `${userName} cancelled order #${fullOrder.orderId} (${fullOrder.paymentMethod}).`,
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



