import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';
import { fetchOrders, fetchOrderCancel, fetchOrderReturnAndRefund } from '../../controllers/admin/adminOrderController.js';

import upload from '../../middleware/multer.js';

const adminOrderRouter = express.Router();

// FETCH ORDERS
adminOrderRouter.get('/list', adminAuth, fetchOrders);

// FETCH CANCEL ORDER
adminOrderRouter.get('/list-cancel-order', adminAuth, fetchOrderCancel);

// FETCH CANCEL ORDER
adminOrderRouter.get('/list-return-refund', adminAuth, fetchOrderReturnAndRefund);


export default adminOrderRouter;