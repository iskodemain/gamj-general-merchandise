import express from 'express';
import adminAuth from "../../middleware/adminAuth.js";

import { fetchAllProducts, fetchProductCategory, addProduct, fetchVariantName } from '../../controllers/admin/adminProductController.js'

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


// FETCH ALL PRODUCTS
adminProductRouter.get('/list', adminAuth, fetchAllProducts);

// FETCH PRODUCTS CATEGORIES
adminProductRouter.get('/category', adminAuth, fetchProductCategory);

// FETCH VARIANT NAME
adminProductRouter.get('/variant-name', adminAuth, fetchVariantName);



export default adminProductRouter;
