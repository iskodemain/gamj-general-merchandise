import Admin from "../../models/admin.js";
import Category from "../../models/category.js";
import Products from "../../models/products.js";
import VariantName from "../../models/variantName.js";
import ProductVariantValues from "../../models/productVariantValues.js";
import ProductVariantCombination from "../../models/productVariantCombination.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs/promises';


export const addProductService = async ( adminId, categoryId, productName, productDescription, productDetails, price, image1, image2, image3, image4, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, variantNames, variantValues, variantCombination) => {
  try {
      // Convert types
      const toBool = (v) => v === "true" || v === true || v === 1 || v === "1";

      categoryId = Number(categoryId);
      price = Number(price);

      isBestSeller = toBool(isBestSeller);
      isActive = toBool(isActive);
      isOutOfStock = toBool(isOutOfStock);
      hasVariant = toBool(hasVariant);
      hasVariantCombination = toBool(hasVariantCombination);

      const adminUser = await Admin.findByPk(adminId);
      if (!adminUser) {
          return { success: false, message: "User not found" };
      }

      // Parse JSON strings if needed
      if (typeof variantNames === "string") {
          try { variantNames = JSON.parse(variantNames); } catch { variantNames = []; }
      }
      if (typeof variantValues === "string") {
          try { variantValues = JSON.parse(variantValues); } catch { variantValues = []; }
      }
      if (typeof variantCombination === "string") {
          try { variantCombination = JSON.parse(variantCombination); } catch { variantCombination = []; }
      }

      // Product validations
      const category = await Category.findByPk(categoryId);
      if (!category) return { success: false, message: "Invalid category" };

      if (!productName) return { success: false, message: "Product name is required" };
      if (!productDescription) return { success: false, message: "Product description is required" };
      if (price === undefined || price === null || Number(price) < 0)
          return { success: false, message: "Price is required" };

      // Handle images
      const images = [image1, image2, image3, image4].filter(i => i && i.path);
      let imagesUrl = [];

      try {
          imagesUrl = await Promise.all(
              images.map(item =>
                  cloudinary.uploader.upload(item.path, {
                      folder: "gamj/products",
                      resource_type: "image"
                  })
              )
          );
      } catch (cloudErr) {
          return {
              success: false,
              message: "Image upload to Cloudinary failed.",
              error: cloudErr.message
          };
      }

      if (!imagesUrl[0]) {
          return { success: false, message: "Upload at least 1 image." };
      }

      // Delete local temp files
      for (const img of images) {
          try { await fs.unlink(img.path); } catch {}
      }

      // CREATE PRODUCT — removed stock + expiration
      const newProduct = await Products.create(
        {
          categoryId,
          productName,
          productDescription,
          productDetails: productDetails || "",
          price: Number(price),
          image1: imagesUrl[0]?.secure_url,
          image2: imagesUrl[1]?.secure_url || null,
          image3: imagesUrl[2]?.secure_url || null,
          image4: imagesUrl[3]?.secure_url || null,
          isBestSeller,
          isActive,
          isOutOfStock,
          hasVariant,
          hasVariantCombination
        },
        {
            fields: [
              "categoryId",
              "productName",
              "productDescription",
              "productDetails",
              "price",
              "image1",
              "image2",
              "image3",
              "image4",
              "isBestSeller",
              "isActive",
              "isOutOfStock",
              "hasVariant",
              "hasVariantCombination"
            ]
        }
      );

      // ------------------------------
      //  NO VARIANTS
      // ------------------------------
      if (!hasVariant && !hasVariantCombination) {
          return { success: true, message: "Product added successfully." };
      }

      // ------------------------------
      //  VARIANTS (NO COMBO)
      // ------------------------------
      if (hasVariant && !hasVariantCombination) {

          if (!variantNames?.length)
              return { success: false, message: "Variant name is required." };

          let variantNameRecord = await VariantName.findOne({
              where: { name: variantNames[0] }
          });

          if (!variantNameRecord) {
              variantNameRecord = await VariantName.create(
                  { name: variantNames[0] },
                  { fields: ["name"] }
              );
          }

          if (!variantValues?.length)
              return { success: false, message: "Variant values are required." };

          const createdValues = [];

          for (const v of variantValues) {
              const record = await ProductVariantValues.create(
                  {
                      productId: newProduct.ID,
                      variantNameId: variantNameRecord.ID,
                      value: v.name,
                      price: v.price || null
                  },
                  {
                      fields: [
                          "productId",
                          "variantNameId",
                          "value",
                          "price"
                      ]
                  }
              );
              createdValues.push(record);
          }

          return {
              success: true,
              message: "Product with variants added successfully.",
              product: newProduct,
              variantName: variantNameRecord,
              variantValues: createdValues
          };
      }

      // ------------------------------
      //  VARIANTS + COMBINATIONS
      // ------------------------------
      if (hasVariant && hasVariantCombination) {

          if (!variantNames?.length)
              return { success: false, message: "Variant name is required." };

          const existingNames = await VariantName.findAll({
              where: { name: variantNames }
          });

          const existing = existingNames.map(v => v.name);
          const newNames = variantNames.filter(n => !existing.includes(n));

          const createdNames = await Promise.all(
              newNames.map(name => VariantName.create({ name }, { fields: ["name"] }))
          );

          const allVariantNameRecords = [...existingNames, ...createdNames];

          if (!variantValues?.length)
              return { success: false, message: "Variant values are required." };

          const createdVariantValues = [];

          for (const val of variantValues) {
              const vn = allVariantNameRecords.find(x => x.name === val.variantName);

              const record = await ProductVariantValues.create(
                  {
                      productId: newProduct.ID,
                      variantNameId: vn.ID,
                      value: val.name,
                      price: val.price || null
                  },
                  {
                      fields: [
                          "productId",
                          "variantNameId",
                          "value",
                          "price"
                      ]
                  }
              );

              createdVariantValues.push(record);
          }

          if (!variantCombination?.length)
              return { success: false, message: "Variant combination is required." };

          const normalize = (value) => {
              if (!value?.trim()) return "";
              return value
                  .split(",")
                  .map(v => v.trim())
                  .filter(v => v.length)
                  .sort()
                  .join(", ");
          };

          const createdCombinations = [];

          for (const combo of variantCombination) {
              const formatted = normalize(combo.combinations);

              const record = await ProductVariantCombination.create(
                  {
                      productId: newProduct.ID,
                      combinations: formatted,
                      price: combo.price || 0,
                      availability: combo.availability ? 1 : 0
                  },
                  {
                      fields: [
                          "productId",
                          "combinations",
                          "price",
                          "availability"
                      ]
                  }
              );

              createdCombinations.push(record);
          }

          return {
              success: true,
              message: "Product with variant combinations added successfully.",
              product: newProduct,
              variantNames: allVariantNameRecords,
              variantValues: createdVariantValues,
              variantCombinations: createdCombinations
          };
      }
  } catch (error) {
      console.log(error);
      throw new Error(error.message);
  }
};


export const updateProductService = async (adminId, productID, categoryId, productName, productDescription, productDetails, price, image1File, image2File, image3File, image4File, image1Body, image2Body, image3Body, image4Body, isBestSeller, isActive, isOutOfStock, hasVariant, hasVariantCombination, variantNames, variantValues, variantCombination) => {
  try {
      // ---------- helpers ----------
      const toBool = (v) => v === "true" || v === true || v === 1 || v === "1";

      // Normalize booleans and numbers
      categoryId = categoryId !== undefined && categoryId !== null ? Number(categoryId) : null;
      price = (price === '' || price === undefined || price === null) ? null : Number(price);

      isBestSeller = toBool(isBestSeller);
      isActive = toBool(isActive);
      isOutOfStock = toBool(isOutOfStock);
      hasVariant = toBool(hasVariant);
      hasVariantCombination = toBool(hasVariantCombination);

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

      // no-variant products require price
      if (!hasVariant) {
          if (price === null || Number.isNaN(price) || price < 0) {
              return { success: false, message: 'Price is required for non-variant product' };
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
          const missing = variantValues.some(v => 
              !v || 
              !v.name || 
              v.name.toString().trim() === "" || 
              v.price === '' || 
              v.price === null || 
              v.price === undefined
          );
          if (missing) {
              return { success: false, message: 'Each variant value must include name and price.' };
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
              isBestSeller: isBestSeller ? 1 : 0,
              isActive: isActive ? 1 : 0,
              isOutOfStock: isOutOfStock ? 1 : 0,
              hasVariant: hasVariant ? 1 : 0,
              hasVariantCombination: hasVariantCombination ? 1 : 0
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

      // Helper: find or create VariantName
      const findOrCreateVariantName = async (name) => {
          let rec = await VariantName.findOne({ where: { name } });
          if (!rec) {
              rec = await VariantName.create({ name }, { fields: ['name'] });
          }
          return rec;
      };

      // ---------- mode branches ----------

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
                  price: item.price === '' ? null : item.price === null || item.price === undefined ? null : Number(item.price)
              }, {
                  fields: ['productId', 'variantNameId', 'value', 'price']
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
                  price: item.price === '' ? null : item.price === null || item.price === undefined ? null : Number(item.price)
              }, {
                  fields: ['productId', 'variantNameId', 'value', 'price']
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
                  availability: combo.availability ? 1 : 0
              }, {
                  fields: ['productId', 'combinations', 'price', 'availability']
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


export const addProductCategoryService = async (adminId, categoryName) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    // Validate category name
    if (!categoryName || !categoryName.trim()) {
      return { success: false, message: "Category name is required" };
    }

    const cleanName = categoryName.trim();

    // Auto-generate categoryId
    const lastCategory = await Category.findOne({
      order: [["ID", "DESC"]],
    });

    const nextNumber = lastCategory ? lastCategory.ID + 1 : 1;
    const categoryId = "CAT-" + nextNumber.toString().padStart(5, "0");

    // Create Category Record
    const created = await Category.create({
      categoryId,
      categoryName: cleanName,
      createdBy: adminId,
    });

    return {
      success: true,
      data: created,
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const updateProductCategoryService = async (adminId, categoryID, categoryName) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const category = await Category.findByPk(categoryID);
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    category.categoryName = categoryName.trim();
    await category.save();

    return { 
      success: true, 
      data: category 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};


export const deleteProductCategoryService = async (adminId, categoryID) => {
  try {
    // Validate Admin Exists
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    const category = await Category.findByPk(categoryID);
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    await category.destroy();

    return { 
      success: true, 
      data: category 
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const deleteAllProductCategoriesService = async (adminId) => {
  try {
    // Validate admin
    const adminUser = await Admin.findByPk(adminId);
    if (!adminUser) {
      return { success: false, message: "Admin user not found" };
    }

    // Delete all categories
    await Category.destroy({ where: {} });

    return {
      success: true,
      message: "All categories deleted successfully"
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
