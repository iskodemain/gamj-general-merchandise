import express from 'express';
import { addProduct, fetchAllProducts, fetchVariantName, addVariantName, fetchProductVariantValues, addProductVariantValues, fetchProductCategory, addProductCategory } from '../controllers/customerProductController.js';

import adminAuth from '../middleware/customerAuth.js'
import upload from '../middleware/multer.js';

const productRouter = express.Router();

// ADD PRODUCT
productRouter.post(
    '/add',
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
    ]), 
    addProduct
);

// FETCH ALL PRODUCTS
productRouter.get('/list', fetchAllProducts);



// PRODUCT VARIANTS
productRouter.get('/variant-name', fetchVariantName);
productRouter.post('/variant-name/add', addVariantName);
productRouter.get('/product-variant-values', fetchProductVariantValues);
productRouter.post('/product-variant-values/add', addProductVariantValues);


// PRODUCT CATEGORY
productRouter.get('/category', fetchProductCategory);
productRouter.post('/category/add', addProductCategory);

export default productRouter;