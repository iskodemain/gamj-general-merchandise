import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';
import { fetchOrders } from '../../controllers/admin/adminOrderController.js';

import upload from '../../middleware/multer.js';

const adminOrderRouter = express.Router();

// FETCH ORDERS
adminOrderRouter.get('/list', adminAuth, fetchOrders);

export default adminOrderRouter;