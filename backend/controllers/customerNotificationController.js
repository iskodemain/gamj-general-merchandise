import { fetchCustomerNotificationService, deleteCustomerNotificationService, readCustomerNotificationService } from '../services/customerNotificationServices.js'


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


export const deleteCustomerNotification = async (req, res) => {
    try {
        const { ID } = req.user;
        const { notificationID } = req.body;
        const result = await deleteCustomerNotificationService(ID, notificationID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const readCustomerNotification = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await readCustomerNotificationService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}