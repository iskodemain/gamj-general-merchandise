import express from 'express';
import customerAuth from '../middleware/customerAuth.js'
import { addOrder, fetchOrders } from '../controllers/customerOrderController.js';

const orderRouter = express.Router();


// ADD ORDER
orderRouter.post('/add', customerAuth, addOrder);

// FETCH ORDERS
orderRouter.get('/', customerAuth, fetchOrders);

export default orderRouter;