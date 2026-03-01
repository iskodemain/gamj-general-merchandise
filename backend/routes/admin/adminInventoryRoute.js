import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

import { fetchInventoryStock, addStock, fetchInventoryBatch, fetchInventoryHistory, fetchInventorySettings, addInventorySettings, updateInventorySettings, deleteInventorySettings } from '../../controllers/admin/adminInventoryController.js';

const adminInventoryRouter = express.Router();

// FETCH
adminInventoryRouter.get('/stock', adminAuth, fetchInventoryStock);
adminInventoryRouter.get('/batch', adminAuth, fetchInventoryBatch);
adminInventoryRouter.get('/history', adminAuth, fetchInventoryHistory);
adminInventoryRouter.get('/settings/fetch', adminAuth, fetchInventorySettings);

// ADD
adminInventoryRouter.post('/add-stock', adminAuth, addStock);
adminInventoryRouter.post('/settings/add', adminAuth, addInventorySettings);

// UPDATE
adminInventoryRouter.patch('/settings/update', adminAuth, updateInventorySettings);

// DELETE
adminInventoryRouter.delete('/settings/delete', adminAuth, deleteInventorySettings);

export default adminInventoryRouter;
