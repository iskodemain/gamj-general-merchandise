import Customer from '../models/customer.js';
import Notifications from '../models/notifications.js';
import { io } from "../server.js";

export const fetchCustomerNotificationService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const notifications = await Notifications.findAll({where: { senderId: customerId, receiverType: "Customer" }});

      if (notifications.length === 0) {
        return {
          success: false,
          message: "No notifications found.",
          notifications: []
        };
      }

      return {
          success: true,
          message: "Notifications fetched successfully.",
          notifications
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const deleteCustomerNotificationService = async (customerId, notificationID) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // ✅ 2. Find the notification that belongs to this customer
      const notification = await Notifications.findOne({
        where: {
          ID: notificationID,
          senderId: customerId,
          receiverType: 'Customer'
        },
      });

      if (!notification) {
        return {
          success: false,
          message: "No notifications found.",
        };
      }

      // ✅ 3. Delete the notification
      await notification.destroy();

      // ✅ Emit socket event for real-time update
      io.emit("notificationDeleted", { notificationID, customerId });

      return {
          success: true,
          message: "Notifications successfully deleted.",
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const readCustomerNotificationService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // ✅ 2. Find the notification that belongs to this customer
      const notification = await Notifications.findOne({
        where: {
          senderId: customerId,
          receiverType: 'Customer'
        },
      });

      if (!notification) {
        return {
          success: false,
          message: "No notifications found.",
        };
      }

      // ✅ 3. Update the notification
      await Notifications.update(
        { isRead: true },
        {
          where: {
            senderId: customerId,
            receiverType: 'Customer',
          },
        }
      );


      // ✅ Emit socket event for real-time update
      io.emit("notificationRead", { isRead: true, customerId });

      return {
          success: true,
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}