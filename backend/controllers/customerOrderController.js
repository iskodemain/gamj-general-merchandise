import { addOrderService, fetchOrdersService, cancelOrderService, fetchOrderCancelService, removeCancelOrderService, cancelOrderRequestService, markRefundReceivedService, fetchRefundProofService, addOrderRefundService, fetchOrderRefundService, cancelOrderRefundRequestService } from '../services/customerOrderService.js';

export const addOrder = async (req, res) => {
    try {
        const { ID } = req.user;
        const { paymentMethod, orderItems, cartItemsToDelete } = req.body;
        const result = await addOrderService(ID, paymentMethod, orderItems, cartItemsToDelete);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrders = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchOrdersService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const cancelOrder = async (req, res) => {
    try {
        const { ID } = req.user;
        const { orderItemId, reasonForCancellation, cancelComments, cancelPaypalEmail, cancellationStatus, cancelledBy } = req.body;
        const result = await cancelOrderService(ID, orderItemId, reasonForCancellation, cancelComments, cancelPaypalEmail, cancellationStatus, cancelledBy);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrderCancel = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchOrderCancelService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const removeCancelOrder = async (req, res) => {
    try {
        const { ID } = req.user;
        const { orderItemId } = req.body;
        const result = await removeCancelOrderService(ID, orderItemId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const cancelOrderRequest = async (req, res) => {
    try {
        const { ID } = req.user;
        const { orderItemId, orderCancelId } = req.body;
        const result = await cancelOrderRequestService(ID, orderItemId, orderCancelId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const markRefundReceived = async (req, res) => {
    try {
        const { ID } = req.user;
        const { orderCancelId, orderRefundId } = req.body;
        const result = await markRefundReceivedService(ID, orderCancelId, orderRefundId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchRefundProof = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchRefundProofService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const addOrderRefund = async (req, res) => {
    try {
        const { ID } = req.user;
        const imageProof1 = req.files?.imageProof1?.[0];
        const imageProof2 = req.files?.imageProof2?.[0];
        const { orderItemId, reasonForRefund, refundComments, refundResolution, otherReason, refundMethod, refundPaypalEmail, refundStatus } = req.body;
        const result = await addOrderRefundService(ID, orderItemId, reasonForRefund, refundComments, imageProof1, imageProof2, refundResolution, otherReason, refundMethod, refundPaypalEmail, refundStatus);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrderRefund = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchOrderRefundService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const cancelOrderRefundRequest = async (req, res) => {
    try {
        const { ID } = req.user;
        const { orderRefundId, orderItemId } = req.body;
        const result = await cancelOrderRefundRequestService(ID, orderRefundId, orderItemId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}