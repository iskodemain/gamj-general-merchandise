import Admin from "../../models/admin.js";
import OrderItems from "../../models/orderItems.js";
import Orders from "../../models/orders.js";
import OrderRefund from '../../models/orderRefund.js'
import OrderCancel from '../../models/orderCancel.js'
import Customer from "../../models/customer.js";
import Products from "../../models/products.js";
import DeliveryInfo from "../../models/deliveryInfo.js";
import Notifications from "../../models/notifications.js";
import { orderSendMail } from '../../utils/mailer.js';
import { orderStatusUpdateTemplate } from "../../utils/emailTemplates.js";
import { io } from "../../server.js";



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
        await OrderCancel.create({
          orderItemId: orderItem.ID,
          customerId: customer.ID,
          cancelComments: cancelComments,
          cancellationStatus: "Processing",
          cancelledBy: "Admin",
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
      const customerNotif = await Notifications.create({
        senderId: null,
        receiverId: customer.ID,
        receiverType: "Customer",
        senderType: "System",
        notificationType: "Transaction",
        title: customer.medicalInstitutionName,
        message: notifMessage,
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

      const adminNotif = await Notifications.create({
        senderId: customer.ID,
        receiverId: null,
        receiverType: "Admin",
        senderType: "System",
        notificationType: "Transaction",
        title: "Order Update",
        message: AdminStaffNotifMessage,
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

      const staffNotif = await Notifications.create({
        senderId: customer.ID,
        receiverId: null,
        receiverType: "Staff",
        senderType: "System",
        notificationType: "Transaction",
        title: "Order Update",
        message: AdminStaffNotifMessage,
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

