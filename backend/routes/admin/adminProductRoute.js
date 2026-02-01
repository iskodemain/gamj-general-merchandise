import express from 'express';
import adminAuth from "../../middleware/adminAuth.js";

import { fetchAllProducts, fetchProductCategory, addProduct, fetchVariantName, fetchProductVariantValues, fetchProductVariantCombination, updateProduct, addProductCategory, updateProductCategory, deleteProductCategory, deleteAllProductCategories, deleteProduct } from '../../controllers/admin/adminProductController.js'

import upload from '../../middleware/multer.js';

const adminProductRouter = express.Router();

// ADD PRODUCT
adminProductRouter.post(
    '/add',
    adminAuth,
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
    ]),
    addProduct
);

// UPDATE PRODUCT
adminProductRouter.put(
    '/update',
    adminAuth,
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
    ]),
    updateProduct
);

// DELETE PRODUCTS
adminProductRouter.delete('/delete', adminAuth, deleteProduct);

// FETCH ALL PRODUCTS
adminProductRouter.get('/list', adminAuth, fetchAllProducts);

// FETCH PRODUCTS CATEGORIES
adminProductRouter.get('/category', adminAuth, fetchProductCategory);

// FETCH VARIANT NAME
adminProductRouter.get('/variant-name', adminAuth, fetchVariantName);

// FETCH PRODUCT VARIANT VALUES
adminProductRouter.get('/product-variant-values', adminAuth, fetchProductVariantValues);

// FETCH PRODUCT VARIANT COMBINATION
adminProductRouter.get('/product-variant-combination', fetchProductVariantCombination);


// ADD PRODUCTS CATEGORIES
adminProductRouter.post('/category/add', adminAuth, addProductCategory);


// UPDATE PRODUCTS CATEGORIES
adminProductRouter.put('/category/update', adminAuth, updateProductCategory);


// DELETE PRODUCTS CATEGORIES
adminProductRouter.delete('/category/delete', adminAuth, deleteProductCategory);

// DELETE ALL PRODUCTS CATEGORIES
adminProductRouter.delete('/category/delete-all', adminAuth, deleteAllProductCategories);


export default adminProductRouter;
