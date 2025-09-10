import { addWishlistItemService, fetchWishlistItemService, deleteWishlistItemService } from '../services/customerWishlistService.js';



export const addWishlistItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const { productId } = req.body;
        const result = await addWishlistItemService(ID, productId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchWishlistItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const result = await fetchWishlistItemService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const deleteWishlistItem = async (req, res) => {
    try {
        const { ID } = req.user;
        const { productId } = req.body;
        const result = await deleteWishlistItemService(ID, productId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}