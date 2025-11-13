import { fetchAllProductsService, fetchProductCategoryService } from "../../services/admin/adminProductService.js";


export const fetchAllProducts = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchAllProductsService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Category (FETCH)
export const fetchProductCategory = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchProductCategoryService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}