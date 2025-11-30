import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';
import { fetchOrders, fetchOrderCancel, fetchOrderReturnAndRefund, updateOrderStatus } from '../../controllers/admin/adminOrderController.js';

import upload from '../../middleware/multer.js';

const adminOrderRouter = express.Router();

// FETCH ORDERS
adminOrderRouter.get('/list', adminAuth, fetchOrders);

// FETCH CANCEL ORDER
adminOrderRouter.get('/list-cancel-order', adminAuth, fetchOrderCancel);

// FETCH CANCEL ORDER
adminOrderRouter.get('/list-return-refund', adminAuth, fetchOrderReturnAndRefund);

// UPDATE ORDER STATUS
adminOrderRouter.patch('/update-status', adminAuth, updateOrderStatus);


export default adminOrderRouter;