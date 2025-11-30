import { fetchOrdersService, fetchOrderCancelService, fetchOrderReturnAndRefundService, updateOrderStatusService } from "../../services/admin/adminOrderService.js";

export const fetchOrders = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchOrdersService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrderCancel = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchOrderCancelService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchOrderReturnAndRefund = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchOrderReturnAndRefundService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const payload = req.body;
        const { ID } = req.admin;
        const result = await updateOrderStatusService(ID, payload);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}
