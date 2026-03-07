import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';
import { fetchOrders, fetchOrderCancel, fetchOrderReturnAndRefund, updateOrderStatus, fetchRefundProof, processRefundRequest, approveRefundRequest, sucessfullyProcessedRefund, rejectedRefundRequest, submitRefundProof, cancelSubmitAsRefund, cancelSubmitAsCompleted, fetchOrderTransaction, fetchOrderPaymentProof, addOrderDeliveryProof, fetchOrderDeliveryProof } from '../../controllers/admin/adminOrderController.js';

import upload from '../../middleware/multer.js';

const adminOrderRouter = express.Router();

// FETCH 
adminOrderRouter.get('/list', adminAuth, fetchOrders);
adminOrderRouter.get('/list-cancel-order', adminAuth, fetchOrderCancel);
adminOrderRouter.get('/list-return-refund', adminAuth, fetchOrderReturnAndRefund);
adminOrderRouter.get('/list-refund-proof', adminAuth, fetchRefundProof);
adminOrderRouter.get('/list-order-transaction', adminAuth, fetchOrderTransaction);
adminOrderRouter.get('/list-payment-proof', adminAuth, fetchOrderPaymentProof);
adminOrderRouter.get('/order-delivery-proof/fetch', adminAuth, fetchOrderDeliveryProof);


// UPDATE ORDER STATUS
adminOrderRouter.patch('/update-status', adminAuth, updateOrderStatus);
adminOrderRouter.patch('/process-refund-request', adminAuth, processRefundRequest);
adminOrderRouter.patch('/approve-refund-request', adminAuth, approveRefundRequest);
adminOrderRouter.patch('/success-refund-process', adminAuth, sucessfullyProcessedRefund);
adminOrderRouter.patch('/reject-refund-request', adminAuth, rejectedRefundRequest);

adminOrderRouter.patch('/cancel/submit-as-completed', adminAuth, cancelSubmitAsCompleted);


// CREATE FOR RETURN/REFUND
adminOrderRouter.post(
  '/submit-refund-proof',
  upload.fields([
    { name: "receiptImage", maxCount: 1 }
  ]),
  adminAuth,
  submitRefundProof
);


// CREATE FOR ORDER CANCELLATION
adminOrderRouter.post(
  '/cancel/submit-refund-proof',
  upload.fields([
    { name: "receiptImage", maxCount: 1 }
  ]),
  adminAuth,
  cancelSubmitAsRefund
);


// ADD DELIVERY PROOF
adminOrderRouter.post(
  '/order-delivery-proof/add',
  upload.fields([
    { name: "proofImage", maxCount: 1 }
  ]),
  adminAuth,
  addOrderDeliveryProof
);


export default adminOrderRouter;