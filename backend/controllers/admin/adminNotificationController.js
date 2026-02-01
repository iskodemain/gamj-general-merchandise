import { fetchAdminNotificationService } from "../../services/admin/adminNotificationService.js";

export const fetchAdminNotification = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchAdminNotificationService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}