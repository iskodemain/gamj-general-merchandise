import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

import { fetchInventoryStock, addStock, fetchInventoryBatch, fetchInventoryHistory } from '../../controllers/admin/adminInventoryController.js';

const adminInventoryRouter = express.Router();

// FETCH
adminInventoryRouter.get('/stock', adminAuth, fetchInventoryStock);
adminInventoryRouter.get('/batch', adminAuth, fetchInventoryBatch);
adminInventoryRouter.get('/history', adminAuth, fetchInventoryHistory);


// ADD
adminInventoryRouter.post('/add-stock', adminAuth, addStock);


export default adminInventoryRouter;
