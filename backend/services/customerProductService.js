import Products from "../models/products.js";
import Category from "../models/category.js";
import VariantName from "../models/variantName.js";
import ProductVariantValues from "../models/productVariantValues.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs/promises';

// ALL PRODUCTS 
// Add Product
export const addProductService = async (categoryId, productName, productDescription, productDetails, price, image1, image2, image3, image4, stockQuantity, isBestSeller, isActive, hasVariant, expirationDate) => {
    try {
        price = Number(price); // PROCESS MO ITO SA FROTEND KUNIN MO YUNG PINAKA MABABANG TOTAL NG PRICE NG VARIANT NA PINAG SUM SA DALAWA OR ISANG VARIANT VALUE. KUNG ISANG VARIANT LANG KUNIN MO NA YUNG PINAKA MABABANG PRICE DOON. PERO KUNG DALAWA IPAG PLUS MO YUNG DALAWANG KIND OF PRODUCT VARIANT THEN KUNIN MO YUNG PINAKAMABABA.
        stockQuantity = Number(stockQuantity);

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return {
                success: false,
                message: 'Invalid category'
            }
        }

        if (!productName) {
            return {
                success: false,
                message: 'Product name is required'
            }
        }

        if (!productDescription) {
            return {
                success: false,
                message: 'Product description is required'
            }
        }

        
        if (price === undefined || price === null || price < 0) {
            return {
                success: false,
                message: 'Price is required'
            }
        }

        if (stockQuantity === undefined || stockQuantity === null || stockQuantity < 0) {
            return {
                success: false,
                message: 'Product stocks is required and must be have proper value'
            }
        }
        


        // const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        const images = [image1, image2, image3, image4].filter(item => item && item.path);
        let imagesUrl = [];
        
        // Upload to cloudinary 
        try {
            imagesUrl = await Promise.all(
                images.map(async (item) => {
                    return await cloudinary.uploader.upload(item.path, {
                        folder: 'gamj/products',
                        resource_type: 'image'
                    });
                })
            );
        } catch (cloudError) {
            return {
                success: false,
                message: "Image upload to Cloudinary failed.",
                error: cloudError.message
            };
        }

        if (!imagesUrl[0]) {
            return {
                success: false,
                message: 'Upload atleast 1 image.'
            }
        }


        // Delete local file
        for (const item of images) {
            try {
                await fs.unlink(item.path);
            } catch (unlinkError) {
                console.error("Failed to delete local image: ", unlinkError.message);
            }
        }

        await Products.create({
            categoryId, // or the correct field name
            productName,
            productDescription,
            productDetails: productDetails || '',
            price,
            image1: imagesUrl[0]?.secure_url,
            image2: imagesUrl[1]?.secure_url || null,
            image3: imagesUrl[2]?.secure_url || null,
            image4: imagesUrl[3]?.secure_url || null,
            stockQuantity,
            isBestSeller,
            isActive,
            hasVariant,
            expirationDate: hasVariant ? null : expirationDate || ''
        }, 
        {
            fields: [
                'categoryId',
                'productName',
                'productDescription',
                'productDetails',
                'price',
                'image1',
                'image2',
                'image3',
                'image4',
                'stockQuantity',
                'isBestSeller',
                'isActive',
                'hasVariant',
                'expirationDate'
            ]
        });

        

        return {
            success: true,
            message: 'Product added successfully.'
        };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

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


// PRODUCT VARIANTS

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

// Variant Names (ADD)
export const addVariantNameService = async (name) => {
    try {
        if (!name) {
            return {
                success: false,
                message: "Variant name is required."
            };
        }
        const newVariantName = await VariantName.create({ 
            name 
        }, {
            fields: [
                'name'
            ]
        });
        return {
            success: true,
            message: "Variant name added successfully.",
            variantName: newVariantName
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

// Product Variant Values (ADD)
export const addProductVariantValuesService = async (productId, variantNameId, value, price, stock, expirationDate) => {
    try {
        const findProduct = await Products.findByPk(productId);
        const findVariantName = await VariantName.findByPk(variantNameId);

        if (!findProduct) {
            return {
                success: false,
                message: "Product not found."
            };
        }

        if (!findVariantName) {
            return {
                success: false,
                message: "Variant name not found."
            };
        }

        if (!value) {
            return {
                success: false,
                message: "Variant value is required."
            };
        }

        if (price === undefined || price === null || price < 0) {
            return {
                success: false,
                message: "Variant price is required."
            }
        }

        if (stock === undefined || stock === null || stock < 0) {
            return {
                success: false,
                message: "Variant stock is required."
            }
        }

        const newProductVariantValues = await ProductVariantValues.create({
            productId,
            variantNameId, 
            value, 
            price, 
            stock, 
            expirationDate
        }, {
            fields: [
                'productId',
                'variantNameId',
                'value',
                'price',
                'stock',
                'expirationDate'
            ]
        });

        return {
            success: true,
            message: "Product variant values added successfully.",
            productVariantValues: newProductVariantValues
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


// PRODUCT CATEGORY

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

// Product Category (ADD)
export const addProductCategoryService = async (categoryName) => {
    try {
        if (!categoryName) {
            return {
                success: false,
                message: "Category name is required."
            };
        }
        const newCategory = await Category.create({ 
                categoryName 
            }, {
                fields: [
                    'categoryName'
                ]
            });
        return {
            success: true,
            message: "Category added successfully.",
            category: newCategory
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}