import express from 'express';
import { fetchAllProducts, fetchVariantName, fetchProductVariantValues, fetchProductCategory, fetchProductVariantCombination, fetchInventoryStock } from '../controllers/customerProductController.js';

import upload from '../middleware/multer.js';

const productRouter = express.Router();

// FETCH ALL PRODUCTS
productRouter.get('/list', fetchAllProducts);



// PRODUCT VARIANTS
productRouter.get('/variant-name', fetchVariantName);
productRouter.get('/product-variant-values', fetchProductVariantValues);
productRouter.get('/product-variant-combination', fetchProductVariantCombination);


// PRODUCT CATEGORY
productRouter.get('/category', fetchProductCategory);


// FETCH STOCKS
productRouter.get('/stock', fetchInventoryStock);

export default productRouter;