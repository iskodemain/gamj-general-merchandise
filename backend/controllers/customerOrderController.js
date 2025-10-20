import { addOrderService, fetchOrdersService } from '../services/customerOrderService.js';

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