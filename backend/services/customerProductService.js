import Products from "../models/products.js";
import Category from "../models/category.js";
import VariantName from "../models/variantName.js";
import ProductVariantValues from "../models/productVariantValues.js";
import ProductVariantCombination from "../models/productVariantCombination.js";
import InventoryStock from "../models/inventoryStock.js";

// Fetch All Product 
export const fetchAllProductsService = async () => {
    try {
        const products = await Products.findAll({});
        if (products.length === 0) {
            return { 
                success: true, 
                message: "No products found.", 
                products: [] 
            };
        }

        return {
            success: true,
            products
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// Variant Names (FETCH)
export const fetchVariantNameService = async () => {
    try {
        const variantName = await VariantName.findAll({});
        if (variantName.length === 0) {
            return {
                success: true, 
                message: "No variant name found.", 
                variantName: [] 
            };
        }

        return {
            success: true,
            variantName
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// Product Variant Values (FETCH)
export const fetchProductVariantValuesService = async () => {
    try {
        const productVariantValues = await ProductVariantValues.findAll({});
        if (productVariantValues.length === 0) {
            return {
                success: true, 
                message: "No product variant values found.", 
                productVariantValues: [] 
            };
        }

        return {
            success: true,
            productVariantValues
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// Product Variant Combination (FETCH)
export const fetchProductVariantCombinationService = async () => {
    try {
        const productVariantCombination = await ProductVariantCombination.findAll({});
        if (productVariantCombination.length === 0) {
            return {
                success: true,
                message: "No product variant combinations found.",
                productVariantCombination: []
            };
        }

        return {
            success: true,
            productVariantCombination
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

// Product Category (FETCH)
export const fetchProductCategoryService = async () => {
    try {
        const productCategory = await Category.findAll({});
        if (productCategory.length === 0) {
            return {
                success: true, 
                message: "No product categories found.", 
                productCategory: [] 
            };
        }

        return {
            success: true,
            productCategory
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


export const fetchInventoryStockService = async () => {
    try {
        const inventoryStock = await InventoryStock.findAll({});
        if (inventoryStock.length === 0) {
            return {
                success: true,
                inventoryStock: [],
            };
        }


        return {
            success: true,
            inventoryStock,
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

