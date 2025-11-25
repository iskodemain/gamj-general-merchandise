import Admin from "../../models/admin.js";
import OrderItems from "../../models/orderItems.js";
import Orders from "../../models/orders.js";
import OrderCancel from '../../models/orderCancel.js'


export const fetchOrdersService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        const orders = await Orders.findAll({});
        if (orders.length === 0) {
            return {
                success: true,
                orders: [],
                orderItems: [],
            };
        }

        const orderItems = await OrderItems.findAll({});
        if (orderItems.length === 0) {
            return {
                success: true,
                orders,
                orderItems: [],
            };
        }

        return {
            success: true,
            orders,
            orderItems,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderCancelService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }


        const orderCancel = await OrderCancel.findAll({});
        if (orderCancel.length === 0) {
            return {
            success: true,
            orderCancel: []
            };
        }

        return {
            success: true,
            orderCancel
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}