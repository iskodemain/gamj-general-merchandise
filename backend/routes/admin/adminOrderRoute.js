import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';
import { fetchOrders, fetchOrderCancel } from '../../controllers/admin/adminOrderController.js';

import upload from '../../middleware/multer.js';

const adminOrderRouter = express.Router();

// FETCH ORDERS
adminOrderRouter.get('/list', adminAuth, fetchOrders);

// FETCH CANCEL ORDER
adminOrderRouter.get('/list-cancel-order', adminAuth, fetchOrderCancel);


export default adminOrderRouter;