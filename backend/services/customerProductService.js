import Products from "../models/products.js";
import Category from "../models/category.js";
import VariantName from "../models/variantName.js";
import ProductVariantValues from "../models/productVariantValues.js";
import ProductVariantCombination from "../models/productVariantCombination.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs/promises';

// ALL PRODUCTS 
// Add Product
export const addProductService = async (categoryId, productName, productDescription, productDetails, price, image1, image2, image3, image4, stockQuantity, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, expirationDate, variantNames, variantValues, variantCombination) => {
    try {

        if (typeof variantNames === 'string') {
            try { variantNames = JSON.parse(variantNames); } catch (e) { variantNames = []; }
        }
        if (typeof variantValues === 'string') {
            try { variantValues = JSON.parse(variantValues); } catch (e) { variantValues = []; }
        }
        if (typeof variantCombination === 'string') {
            try { variantCombination = JSON.parse(variantCombination); } catch (e) { variantCombination = []; }
        }

        // PRODUCTS WITHOUT VARIANTS
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

        const newProduct = await Products.create({
            categoryId, // or the correct field name
            productName,
            productDescription,
            productDetails: productDetails || '',
            price: Number(price),
            image1: imagesUrl[0]?.secure_url,
            image2: imagesUrl[1]?.secure_url || null,
            image3: imagesUrl[2]?.secure_url || null,
            image4: imagesUrl[3]?.secure_url || null,
            stockQuantity: Number(stockQuantity),
            isBestSeller,
            isActive,
            isOutOfStock,
            hasVariant,
            hasVariantCombination,
            expirationDate: hasVariant ? null : expirationDate || null
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
                'isOutOfStock',
                'hasVariant',
                'hasVariantCombination',
                'expirationDate'
            ]
        });

        if (!hasVariant && !hasVariantCombination) {
            return {
                success: true,
                message: 'Product added successfully.'
            };
        }

        // PRODUCTS WITH VARIANTS
        if (hasVariant && !hasVariantCombination) {
            if (!variantNames || !variantNames.length) {
                return {
                    success: false,
                    message: "Variant name is required."
                };
            }

            let variantNameRecord = await VariantName.findOne({
                where: { name: variantNames[0] }
            })

            if (!variantNameRecord) {
                variantNameRecord = await VariantName.create({ 
                    name: variantNames[0]
                }, {
                    fields: [
                        'name'
                    ]
                });
            }

            if (!variantValues || !variantValues.length) {
                console.log(variantValues);
                return { success: false, message: "Variant values are required. " + variantValues };
            }
            
            const variantValueRecords = [];
            for (const item of variantValues) {
                const record = await ProductVariantValues.create({
                    productId: newProduct.ID,
                    variantNameId: variantNameRecord.ID,
                    value: item.name,
                    price: item.price || null,
                    stock: item.stock || null,
                    expirationDate: item.expirationDate || null
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
                variantValueRecords.push(record);
            }

            return {
                success: true,
                message: "Product with variants added successfully.",
                product: newProduct,
                variantName: variantNameRecord,
                variantValues: variantValueRecords
            };
        }
        
        // PRODUCTS WITH VARIANTS AND COMBINATIONS
        if (hasVariant && hasVariantCombination) {
            if (!variantNames || !variantNames.length) {
                return {
                    success: false,
                    message: "Variant name is required."
                };
            }

            const existingVariantNames = await VariantName.findAll({
                where: { name: variantNames }
            });

            const existingNames = existingVariantNames.map(v => v.name);

            const newVariantNames = variantNames.filter(name => !existingNames.includes(name));

            const createdVariantNames  = await Promise.all(
                newVariantNames.map(async (name) => {
                    return await VariantName.create({ name }, { fields: ["name"] });
                })
            );

            const variantNameRecords = [...existingVariantNames, ...createdVariantNames];

            if (!variantValues || !variantValues.length) {
                return { success: false, message: "Variant values are required." };
            }

            const variantValueRecords = [];
            for (const item of variantValues) {
                const variantName = variantNameRecords.find(vn => vn.name === item.variantName);
                const record = await ProductVariantValues.create({
                    productId: newProduct.ID,
                    variantNameId: variantName.ID,
                    value: item.name,
                    price: item.price || null,
                    stock: item.stock || null,
                    expirationDate: item.expirationDate || null
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
                variantValueRecords.push(record);
            }

            if (!variantCombination || !variantCombination.length) {
                return { success: false, message: "Variant combination is required." };
            }

            // Helper function - Normalize spacing AND sort
            const normalizeVariants = (value) => {
            if (!value || value.trim() === '') return '';
            return value
                .split(',')                       // Split by comma
                .map(v => v.trim())               // Remove spaces from each part
                .filter(v => v.length > 0)        // Remove empty values
                .sort()                           // ✅ Sort alphabetically
                .join(', ');                      // Join with ", " (comma + space)
            };

            const combinationRecords = [];

            for (const combo of variantCombination) {
                const combinationsValue = normalizeVariants(combo.combinations);
                const record = await ProductVariantCombination.create({
                    productId: newProduct.ID,
                    combinations: combinationsValue,
                    price: combo.price || 0,
                    stock: combo.stock || 0,
                    availability: combo.availability ? 1 : 0
                }, {
                    fields: [
                        "productId", 
                        "combinations", 
                        "price", 
                        "stock", 
                        "availability"
                    ]
                });

                combinationRecords.push(record);
            }

            return {
                success: true,
                message: "Product with variant combinations added successfully.",
                product: newProduct,
                variantNames: variantNameRecords,
                variantValues: variantValueRecords.filter(Boolean),
                variantCombinations: combinationRecords
            };
        }

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