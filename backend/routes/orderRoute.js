import express from 'express';
import customerAuth from '../middleware/customerAuth.js'
import { addOrder, fetchOrders, cancelOrder, fetchOrderCancel, removeCancelOrder, cancelOrderRequest, markRefundReceived, fetchRefundProof, addOrderRefund, fetchOrderRefund, cancelOrderRefundRequest, fetchOrderPaymentProof, addOrderPaymentProof } from '../controllers/customerOrderController.js';

import upload from '../middleware/multer.js';

const orderRouter = express.Router();


// ADD ORDER
orderRouter.post('/add', customerAuth, addOrder);

// FETCH ORDERS
orderRouter.get('/', customerAuth, fetchOrders);

// FETCH ORDER PAYMENT PROOF
orderRouter.get('/payment-proof', customerAuth, fetchOrderPaymentProof);

// ADD ORDER PAYMENT PROOF
orderRouter.post('/payment-proof/add', customerAuth, upload.single('receiptImage'), addOrderPaymentProof);

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

// FETCH REFUND PROOF
orderRouter.get('/refund-proof', customerAuth, fetchRefundProof);

// ADD ORDER REFUND 
orderRouter.post(
    '/order-refund/add', 
    customerAuth, 
    upload.fields([
        { name: 'imageProof1', maxCount: 1 },
        { name: 'imageProof2', maxCount: 1 }
    ]),
    addOrderRefund
);

// FETCH REFUND PROOF
orderRouter.get('/order-refund', customerAuth, fetchOrderRefund);

// CANCEL ORDER REFUND
orderRouter.patch('/cancel-refund-request', customerAuth, cancelOrderRefundRequest);

export default orderRouter;