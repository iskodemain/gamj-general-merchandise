import { addProductService, fetchAllProductsService, fetchVariantNameService, addVariantNameService, fetchProductVariantValuesService, addProductVariantValuesService, fetchProductCategoryService, addProductCategoryService } from '../services/customerProductService.js';


// ALL PRODUCTS 
export const addProduct = async (req, res) => {
    try {
        // const { ID } = req.user;
        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];

        const {categoryId, productName, productDescription, productDetails, price, stockQuantity, isBestSeller, isActive, hasVariant, expirationDate} = req.body;

        const result = await addProductService(categoryId, productName, productDescription, productDetails, price, image1, image2, image3, image4, stockQuantity, isBestSeller, isActive, hasVariant, expirationDate);

        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

export const fetchAllProducts = async (req, res) => {
    try {
        const result = await fetchAllProductsService();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


// PRODUCT VARIANTS

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

// Variant Names (ADD)
export const addVariantName = async (req, res) => {
    try {
        // const { ID } = req.user;
        const { name } = req.body;
        const result = await addVariantNameService(name);
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

// Product Variant Values (ADD)
export const addProductVariantValues = async (req, res) => {
    try {
        // const { ID } = req.user;
        const { productId, variantNameId, value, price, stock, expirationDate } = req.body;
        const result = await addProductVariantValuesService(productId, variantNameId, value, price, stock, expirationDate);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


// PRODUCT CATEGORY

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
