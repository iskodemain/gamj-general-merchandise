import express from 'express';
import adminAuth from "../../middleware/adminAuth.js";

import { fetchAllProducts, fetchProductCategory, addProduct, fetchVariantName, fetchProductVariantValues, fetchProductVariantCombination, updateProduct, addProductCategory } from '../../controllers/admin/adminProductController.js'

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
// ADD PRODUCT
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




export default adminProductRouter;
