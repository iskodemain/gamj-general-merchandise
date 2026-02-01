import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

import { fetchAdminNotification } from '../../controllers/admin/adminNotificationController.js';


const adminNotificationRouter = express.Router();

// FETCH NOTIFICATION
adminNotificationRouter.get('/', adminAuth, fetchAdminNotification);

export default adminNotificationRouter;