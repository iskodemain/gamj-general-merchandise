import express from 'express';
import customerAuth from '../middleware/customerAuth.js';
import { fetchCustomerNotification } from '../controllers/customerNotificationController.js';

const notificationRouter = express.Router();

// FETCH NOTIFICATION
notificationRouter.get('/', customerAuth, fetchCustomerNotification);


export default notificationRouter;