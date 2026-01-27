import Admin from "../../models/admin.js";
import OrderItems from "../../models/orderItems.js";
import Orders from "../../models/orders.js";
import OrderRefund from '../../models/orderRefund.js'
import OrderCancel from '../../models/orderCancel.js'
import Customer from "../../models/customer.js";
import Products from "../../models/products.js";
import Notifications from "../../models/notifications.js";
import { orderSendMail } from '../../utils/mailer.js';
import { orderStatusUpdateTemplate } from "../../utils/emailTemplates.js";
import { io } from "../../server.js";
import RefundProof from "../../models/refundProof.js";
import {v2 as cloudinary} from 'cloudinary';
import OrderTransaction from "../../models/orderTransaction.js";


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
        // 🔹 AUTO-GENERATE cancelId
        const lastCancel = await OrderCancel.findOne({
          order: [["ID", "DESC"]],
        });

        const nextCancelNo = lastCancel ? Number(lastCancel.ID) + 1 : 1;
        const cancelId = withTimestamp("OCAN", nextCancelNo);

        const cancelledData = await OrderCancel.create({
          cancelId,
          orderItemId: orderItem.ID,
          customerId: customer.ID,
          cancelComments: cancelComments,
          cancellationStatus: "Processing",
          cancelledBy: "Admin",
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
      
      await orderSendMail({
        to: group.customer.loginEmail || group.customer.emailAddress || group.customer.repEmailAddress,
        subject: group.emailSubject,
        html: orderStatusUpdateTemplate(
          group.customer.medicalInstitutionName, 
          group.changeStatus, 
          group.order.paymentMethod, 
          completeProductList, // ✅ Complete list of products
          group.order.dateOrdered
        ),
        attachments: [{ filename: 'GAMJ.png', path: './uploads/GAMJ.png', cid: 'gamj_logo' }],
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

export const approveRefundRequestService = async (adminId, refundID, newStatus) => {
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
    }, {
      fields: [
        'customerId',
        'cancelId',
        'refundAmount',
        'receiptImage',
        'transactionID'
      ]
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

export const adminDeleteOrderItemService = async (adminId, orderItemID) => {
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
    const orderItem = await OrderItems.findByPk(orderItemID);
    if (!orderItem) {
      return {
        success: false,
        message: "Order item not found"
      };
    }

    // Update status
    orderItem.isDeletedByAdmin = 1;
    await orderItem.save();

    return {
      success: true,
      message: "Successfully deleted",
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


