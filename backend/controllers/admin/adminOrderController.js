import { fetchOrdersService } from "../../services/admin/adminOrderService.js";

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
