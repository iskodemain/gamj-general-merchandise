import { fetchCartItemService, addCartItemService, updateCartItemService, deleteCartItemService, deleteMultipleCartItemService } from '../services/customerCartService.js';


export const fetchCartItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchCartItemService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const addCartItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const { productId, value, quantity } = req.body;
        const result = await addCartItemService(ID, productId, value, quantity);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const { productId, value, quantity } = req.body;
        const result = await updateCartItemService(ID, productId, value, quantity);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const deleteCartItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const { cartMainId } = req.body;
        const result = await deleteCartItemService(ID, cartMainId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const deleteMultipleCartItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const { cartIds } = req.body;
        const result = await deleteMultipleCartItemService(ID, cartIds);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


