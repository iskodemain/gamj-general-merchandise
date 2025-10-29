import express from 'express';
import customerAuth from '../middleware/customerAuth.js'
import { addOrder, fetchOrders, cancelOrder, fetchOrderCancel, removeCancelOrder, cancelOrderRequest, markRefundReceived } from '../controllers/customerOrderController.js';

const orderRouter = express.Router();


// ADD ORDER
orderRouter.post('/add', customerAuth, addOrder);

// FETCH ORDERS
orderRouter.get('/', customerAuth, fetchOrders);

// CANCEL ORDER
orderRouter.post('/cancel-order/add', customerAuth, cancelOrder);

// CANCEL ORDER
orderRouter.get('/cancel-order', customerAuth, fetchOrderCancel);

// REMOVE ORDER
orderRouter.put('/remove-order', customerAuth, removeCancelOrder);

// CANCEL ORDER REQUEST
orderRouter.put('/cancel-order-request', customerAuth, cancelOrderRequest);

// MARK REFUND RECEIVED
orderRouter.put('/mark-refund-received', customerAuth, markRefundReceived);

export default orderRouter;