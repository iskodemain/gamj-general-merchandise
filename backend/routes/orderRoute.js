import express from 'express';
import customerAuth from '../middleware/customerAuth.js'
import { addOrder, fetchOrders, cancelOrder, fetchOrderCancel } from '../controllers/customerOrderController.js';

const orderRouter = express.Router();


// ADD ORDER
orderRouter.post('/add', customerAuth, addOrder);

// FETCH ORDERS
orderRouter.get('/', customerAuth, fetchOrders);

// CANCEL ORDER
orderRouter.post('/cancel-order/add', customerAuth, cancelOrder);

// CANCEL ORDER
orderRouter.get('/cancel-order/', customerAuth, fetchOrderCancel);

export default orderRouter;