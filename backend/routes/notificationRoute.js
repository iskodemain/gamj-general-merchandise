import express from 'express';
import customerAuth from '../middleware/customerAuth.js';
import { fetchCustomerNotification, deleteCustomerNotification, readCustomerNotification } from '../controllers/customerNotificationController.js';

const notificationRouter = express.Router();

// FETCH NOTIFICATION
notificationRouter.get('/', customerAuth, fetchCustomerNotification);


// DELETE NOTIFICATION
notificationRouter.delete('/delete', customerAuth, deleteCustomerNotification);

// READ NOTIFICATION
notificationRouter.patch('/read', customerAuth, readCustomerNotification);


export default notificationRouter;