import Notifications from "../../models/notifications.js";
import Admin from "../../models/admin.js";


export const fetchAdminNotificationService = async (adminID) => {
    try {
      const user = await Admin.findByPk(adminID);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const notifications = await Notifications.findAll({});

      if (notifications.length === 0) {
        return {
          success: false,
          message: "No notifications found.",
          notifications: []
        };
      }

      return {
          success: true,
          notifications
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}