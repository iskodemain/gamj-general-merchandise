import { fetchAllProductsService, fetchProductCategoryService, addProductService, fetchVariantNameService, fetchProductVariantValuesService, fetchProductVariantCombinationService } from "../../services/admin/adminProductService.js";


// ALL PRODUCTS 
export const addProduct = async (req, res) => {
    try {
        const { ID } = req.admin;
        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];

        const {categoryId, productName, productDescription, productDetails, price, stockQuantity, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, expirationDate, variantNames, variantValues, variantCombination} = req.body;

        const result = await addProductService(ID, categoryId, productName, productDescription, productDetails, price, image1, image2, image3, image4, stockQuantity, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, expirationDate, variantNames, variantValues, variantCombination);

        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


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

// Variant Names (FETCH)
export const fetchVariantName = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchVariantNameService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Variant Values (FETCH)
export const fetchProductVariantValues = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchProductVariantValuesService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Product Variant Values (FETCH)
export const fetchProductVariantCombination = async (req, res) => {
    try {
        const { ID } = req.admin;
        const result = await fetchProductVariantCombinationService(ID);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}