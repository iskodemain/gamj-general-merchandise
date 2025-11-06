import { fetchCustomerNotificationService } from '../services/customerNotificationServices.js'


export const fetchCustomerNotification = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchCustomerNotificationService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}