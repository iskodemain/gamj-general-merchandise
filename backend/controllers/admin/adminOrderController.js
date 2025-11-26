import { fetchOrdersService, fetchOrderCancelService, fetchOrderReturnAndRefundService } from "../../services/admin/adminOrderService.js";

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
