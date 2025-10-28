import { addOrderService, fetchOrdersService, cancelOrderService, fetchOrderCancelService, removeCancelOrderService } from '../services/customerOrderService.js';

export const addOrder = async (req, res) => {
    try {
        const { ID } = req.user;
        const { paymentMethod, orderItems } = req.body;
        const result = await addOrderService(ID, paymentMethod, orderItems);
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