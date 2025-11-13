import express from 'express';
import adminAuth from "../../middleware/adminAuth.js";

import { fetchAllProducts, fetchProductCategory } from '../../controllers/admin/adminProductController.js'


const adminProductRouter = express.Router();

// FETCH ALL PRODUCTS
adminProductRouter.get('/list', adminAuth, fetchAllProducts);

// FETCH PRODUCTS CATEGORIES
adminProductRouter.get('/category', adminAuth, fetchProductCategory);



export default adminProductRouter;
