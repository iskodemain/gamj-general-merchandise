import {  fetchAllProductsService, fetchVariantNameService, fetchProductVariantValuesService, fetchProductCategoryService, addProductCategoryService, fetchProductVariantCombinationService, fetchInventoryStockService } from '../services/customerProductService.js';

export const fetchAllProducts = async (req, res) => {
    try {
        const result = await fetchAllProductsService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Variant Names (FETCH)
export const fetchVariantName = async (req, res) => {
    try {
        // const { ID } = req.user;
        const result = await fetchVariantNameService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Variant Values (FETCH)
export const fetchProductVariantValues = async (req, res) => {
    try {
        // const { ID } = req.user;
        const result = await fetchProductVariantValuesService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Variant Values (FETCH)
export const fetchProductVariantCombination = async (req, res) => {
    try {
        // const { ID } = req.user;
        const result = await fetchProductVariantCombinationService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Category (FETCH)
export const fetchProductCategory = async (req, res) => {
    try {
        // const { ID } = req.user;
        const result = await fetchProductCategoryService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Category (ADD)
export const addProductCategory = async (req, res) => {
    try {
        // const { ID } = req.user;
        const { categoryName } = req.body;
        const result = await addProductCategoryService(categoryName);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


export const fetchInventoryStock = async (req, res) => {
    try {
        const result = await fetchInventoryStockService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


