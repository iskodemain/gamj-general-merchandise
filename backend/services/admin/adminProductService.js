import Admin from "../../models/admin.js";
import Category from "../../models/category.js";
import Products from "../../models/products.js";
import VariantName from "../../models/variantName.js";
import ProductVariantValues from "../../models/productVariantValues.js";
import ProductVariantCombination from "../../models/productVariantCombination.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs/promises';


export const addProductService = async (adminId, categoryId, productName, productDescription, productDetails, price, image1, image2, image3, image4, stockQuantity, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, expirationDate, variantNames, variantValues, variantCombination) => {
    try {
        // CONVERTION OF PROPER DATA
        const toBool = (v) => v === "true" || v === true || v === 1 || v === "1";
        
        categoryId = Number(categoryId);
        price = Number(price);
        stockQuantity = Number(stockQuantity);

        isBestSeller = toBool(isBestSeller);
        isActive = toBool(isActive);
        isOutOfStock = toBool(isOutOfStock);
        hasVariant = toBool(hasVariant);
        hasVariantCombination = toBool(hasVariantCombination);

        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

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

export const updateProductService = async (adminId, productID, categoryId, productName, productDescription, productDetails, price, image1File, image2File, image3File, image4File, image1Body, image2Body, image3Body, image4Body, stockQuantity, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, expirationDate, variantNames, variantValues, variantCombination) => {
    try {
        // ---------- helpers ----------
    const toBool = (v) => v === "true" || v === true || v === 1 || v === "1";

    // Normalize booleans and numbers
    categoryId = categoryId !== undefined && categoryId !== null ? Number(categoryId) : null;
    price = (price === '' || price === undefined || price === null) ? null : Number(price);
    stockQuantity = (stockQuantity === '' || stockQuantity === undefined || stockQuantity === null) ? null : Number(stockQuantity);

    isBestSeller = toBool(isBestSeller);
    isActive = toBool(isActive);
    isOutOfStock = toBool(isOutOfStock);
    hasVariant = toBool(hasVariant);
    hasVariantCombination = toBool(hasVariantCombination);

    if (expirationDate === "" || expirationDate === "null" || expirationDate === undefined) {
      expirationDate = null;
    }

    // Parse JSON strings if provided
    if (typeof variantNames === 'string') {
      try { variantNames = JSON.parse(variantNames); } catch (e) { variantNames = []; }
    }
    if (typeof variantValues === 'string') {
      try { variantValues = JSON.parse(variantValues); } catch (e) { variantValues = []; }
    }
    if (typeof variantCombination === 'string') {
      try { variantCombination = JSON.parse(variantCombination); } catch (e) { variantCombination = []; }
    }

    // ---------- validations (prevent DB writes) ----------
    if (!adminId) {
      return { success: false, message: 'Admin id is required' };
    }

    if (!productID) {
      return { success: false, message: 'productID (numeric) is required' };
    }

    if (!productName || !String(productName).trim()) {
      return { success: false, message: 'Product name is required' };
    }

    if (!productDescription || !String(productDescription).trim()) {
      return { success: false, message: 'Product description is required' };
    }

    if (!categoryId || Number.isNaN(categoryId)) {
      return { success: false, message: 'Valid category is required' };
    }

    // no-variant products require price & stock
    if (!hasVariant) {
      if (price === null || Number.isNaN(price) || price < 0) {
        return { success: false, message: 'Price is required for non-variant product' };
      }
      if (stockQuantity === null || Number.isNaN(stockQuantity) || stockQuantity < 0) {
        return { success: false, message: 'Stock quantity is required for non-variant product' };
      }
    }

    // variants but no combination require variantNames & variantValues
    if (hasVariant && !hasVariantCombination) {
      if (!Array.isArray(variantNames) || variantNames.length === 0) {
        return { success: false, message: 'Variant name is required.' };
      }
      if (!Array.isArray(variantValues) || variantValues.length === 0) {
        return { success: false, message: 'Variant values are required.' };
      }
      const missing = variantValues.some(v => !v || !v.name || v.name.toString().trim() === "" || v.price === '' || v.price === null || v.price === undefined || v.stock === '' || v.stock === null || v.stock === undefined);
      if (missing) {
        return { success: false, message: 'Each variant value must include name, price, and stock.' };
      }
    }

    // combination mode requires names, values, combos
    if (hasVariant && hasVariantCombination) {
      if (!Array.isArray(variantNames) || variantNames.length === 0) {
        return { success: false, message: 'Variant names are required for combination mode.' };
      }
      if (!Array.isArray(variantValues) || variantValues.length === 0) {
        return { success: false, message: 'Variant values are required for combination mode.' };
      }
      if (!Array.isArray(variantCombination) || variantCombination.length === 0) {
        return { success: false, message: 'Variant combinations are required for combination mode.' };
      }
      const missingCombo = variantCombination.some(c => !c || !String(c.combinations || '').trim());
      if (missingCombo) {
        return { success: false, message: 'Each variant combination must have a combinations string.' };
      }
    }

    // ---------- verify admin user ----------
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return { success: false, message: 'User not found' };
    }

    // ---------- find existing product by numeric PK ----------
    const existingProduct = await Products.findByPk(productID);
    if (!existingProduct) {
      return { success: false, message: 'Product not found' };
    }

    // ---------- validate category ----------
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return { success: false, message: 'Invalid category' };
    }

    // ---------- IMAGE UPLOAD, KEEP, OR REMOVE ----------
    const imageFields = [
      { key: "image1", file: image1File, body: image1Body },
      { key: "image2", file: image2File, body: image2Body },
      { key: "image3", file: image3File, body: image3Body },
      { key: "image4", file: image4File, body: image4Body },
    ];

    const currentImages = [
      existingProduct.image1,
      existingProduct.image2,
      existingProduct.image3,
      existingProduct.image4,
    ];

    const imagesToUpdate = {};

    for (let i = 0; i < imageFields.length; i++) {
      const { key, file, body } = imageFields[i];
      const existing = currentImages[i];

      // CASE A — DELETE REQUESTED ("", "null")
      if (body === "" || body === "null" || body === null) {
        imagesToUpdate[key] = null;
        continue;
      }

      // CASE B — KEEP EXISTING (frontend sends URL)
      if (typeof body === "string" && body.startsWith("http")) {
        imagesToUpdate[key] = body;
        continue;
      }

      // CASE C — NEW FILE UPLOAD
      if (file && file.path) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "gamj/products",
          resource_type: "image",
        });
        imagesToUpdate[key] = upload.secure_url;
        continue;
      }

      // CASE D — NO CHANGES
      imagesToUpdate[key] = existing;
    }


    // ---------- compute stock depending on mode ----------
    let computedStock = stockQuantity;
    if (hasVariant && !hasVariantCombination) {
      computedStock = (variantValues || []).reduce((acc, v) => acc + (Number.isFinite(Number(v.stock)) ? Number(v.stock) : 0), 0);
    } else if (hasVariant && hasVariantCombination) {
      computedStock = (variantCombination || []).reduce((acc, c) => acc + (Number.isFinite(Number(c.stock)) ? Number(c.stock) : 0), 0);
    } else {
      computedStock = stockQuantity;
    }

    // ---------- update product main row ----------
    try {
      await Products.update({
        categoryId,
        productName,
        productDescription,
        productDetails: productDetails || '',
        price: price === null ? null : Number(price),
        image1: imagesToUpdate.image1,
        image2: imagesToUpdate.image2,
        image3: imagesToUpdate.image3,
        image4: imagesToUpdate.image4,
        stockQuantity: computedStock === null ? null : Number(computedStock),
        isBestSeller: isBestSeller ? 1 : 0,
        isActive: isActive ? 1 : 0,
        isOutOfStock: isOutOfStock ? 1 : 0,
        hasVariant: hasVariant ? 1 : 0,
        hasVariantCombination: hasVariantCombination ? 1 : 0,
        expirationDate: hasVariant ? null : (expirationDate || null)
      }, {
        where: { ID: existingProduct.ID }
      });
    } catch (updateErr) {
      return { success: false, message: 'Failed to update product main record', error: updateErr.message };
    }

    // ---------- remove old product-specific variant rows (we will recreate according to mode) ----------
    try {
      await ProductVariantValues.destroy({ where: { productId: existingProduct.ID } });
      await ProductVariantCombination.destroy({ where: { productId: existingProduct.ID } });
    } catch (delErr) {
      return { success: false, message: 'Failed to clear previous variant data', error: delErr.message };
    }

    // Helper: find or create VariantName (keeps same style as addProductService)
    const findOrCreateVariantName = async (name) => {
      let rec = await VariantName.findOne({ where: { name } });
      if (!rec) {
        rec = await VariantName.create({ name }, { fields: ['name'] });
      }
      return rec;
    };

    // ---------- mode branches (multiple returns like addProductService) ----------

    // NO VARIANTS
    if (!hasVariant && !hasVariantCombination) {
      return { success: true, message: 'Product updated successfully.' };
    }

    // VARIANTS WITHOUT COMBINATIONS
    if (hasVariant && !hasVariantCombination) {
      // use the first variant name
      const firstVariantName = Array.isArray(variantNames) && variantNames.length ? variantNames[0] : null;
      if (!firstVariantName) {
        return { success: false, message: 'Variant name missing' };
      }

      let variantNameRecord = await VariantName.findOne({ where: { name: firstVariantName } });
      if (!variantNameRecord) {
        variantNameRecord = await VariantName.create({ name: firstVariantName }, { fields: ['name'] });
      }

      const createdVariantValues = [];
      for (const item of (variantValues || [])) {
        const rv = await ProductVariantValues.create({
          productId: existingProduct.ID,
          variantNameId: variantNameRecord.ID,
          value: item.name,
          price: item.price === '' ? null : item.price === null || item.price === undefined ? null : Number(item.price),
          stock: item.stock === '' ? null : item.stock === null || item.stock === undefined ? null : Number(item.stock),
          expirationDate: item.expirationDate || null
        }, {
          fields: ['productId', 'variantNameId', 'value', 'price', 'stock', 'expirationDate']
        });
        createdVariantValues.push(rv);
      }

      return {
        success: true,
        message: "Product with variants updated successfully.",
        product: existingProduct,
        variantName: variantNameRecord,
        variantValues: createdVariantValues
      };
    }

    // VARIANTS WITH COMBINATIONS
    if (hasVariant && hasVariantCombination) {
      // create/find variant names
      const existingVariantNames = await VariantName.findAll({ where: { name: variantNames || [] } });
      const existingNames = existingVariantNames.map(v => v.name);
      const newNames = (variantNames || []).filter(n => !existingNames.includes(n));

      const createdNames = [];
      for (const n of newNames) {
        const rec = await VariantName.create({ name: n }, { fields: ['name'] });
        createdNames.push(rec);
      }

      const variantNameRecords = [...existingVariantNames, ...createdNames];

      // create product variant values (flat list)
      const variantValueRecs = [];
      for (const item of (variantValues || [])) {
        let vn = variantNameRecords.find(v => v.name === item.variantName);
        if (!vn) {
          vn = await VariantName.create({ name: item.variantName }, { fields: ['name'] });
        }
        const rec = await ProductVariantValues.create({
          productId: existingProduct.ID,
          variantNameId: vn.ID,
          value: item.name,
          price: item.price === '' ? null : item.price === null || item.price === undefined ? null : Number(item.price),
          stock: item.stock === '' ? null : item.stock === null || item.stock === undefined ? null : Number(item.stock),
          expirationDate: item.expirationDate || null
        }, {
          fields: ['productId', 'variantNameId', 'value', 'price', 'stock', 'expirationDate']
        });
        variantValueRecs.push(rec);
      }

      // create combinations
      const combinationRecords = [];
      for (const combo of (variantCombination || [])) {
        const normalized = combo.combinations ? String(combo.combinations).split(',').map(s => s.trim()).filter(Boolean).sort().join(', ') : '';
        const rec = await ProductVariantCombination.create({
          productId: existingProduct.ID,
          combinations: normalized,
          price: combo.price === '' ? 0 : combo.price === null || combo.price === undefined ? 0 : Number(combo.price),
          stock: combo.stock === '' ? 0 : combo.stock === null || combo.stock === undefined ? 0 : Number(combo.stock),
          availability: combo.availability ? 1 : 0
        }, {
          fields: ['productId', 'combinations', 'price', 'stock', 'availability']
        });
        combinationRecords.push(rec);
      }

      return {
        success: true,
        message: "Product with variant combinations updated successfully.",
        product: existingProduct,
        variantNames: variantNameRecords,
        variantValues: variantValueRecs,
        variantCombinations: combinationRecords
      };
    }

    // fallback
    return { success: true, message: 'Product updated.' };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}















// Fetch All Product
export const fetchAllProductsService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

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

// Product Category (FETCH)
export const fetchProductCategoryService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }
        
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

// Variant Names (FETCH)
export const fetchVariantNameService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

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
export const fetchProductVariantValuesService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }

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
export const fetchProductVariantCombinationService = async (adminId) => {
    try {
        const adminUser = await Admin.findByPk(adminId);
        if (!adminUser) {
            return {
                success: false,
                message: 'User not found'
            }
        }
        
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