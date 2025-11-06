import Customer from '../models/customer.js';
import Notifications from '../models/notifications.js'


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