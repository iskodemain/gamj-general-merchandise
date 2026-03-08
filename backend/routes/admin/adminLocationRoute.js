import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

import { addProvince, updateProvince, deleteProvince, fetchProvinces, fetchCities, fetchBarangays, addCities, updateCities, deleteCities, addBarangays, updateBarangays, deleteBarangays, fetchShippingRates, addShippingRates, updateShippingRates, deleteShippingRates } from "../../controllers/admin/adminLocationController.js";

const adminLocationRouter = express.Router();

// PROVINCES
adminLocationRouter.get('/provinces/fetch', adminAuth, fetchProvinces);
adminLocationRouter.post('/provinces/add', adminAuth, addProvince);
adminLocationRouter.put('/provinces/update', adminAuth, updateProvince);
adminLocationRouter.delete('/provinces/delete', adminAuth, deleteProvince);

// CITIES
adminLocationRouter.get('/cities/fetch', adminAuth, fetchCities);
adminLocationRouter.post('/cities/add', adminAuth, addCities);
adminLocationRouter.put('/cities/update', adminAuth, updateCities);
adminLocationRouter.delete('/cities/delete', adminAuth, deleteCities);

// BARANGAYS
adminLocationRouter.get('/barangays/fetch', adminAuth, fetchBarangays);
adminLocationRouter.post('/barangays/add', adminAuth, addBarangays);
adminLocationRouter.put('/barangays/update', adminAuth, updateBarangays);
adminLocationRouter.delete('/barangays/delete', adminAuth, deleteBarangays);


// SHIPPING RATES
adminLocationRouter.get('/shipping-rates/fetch', adminAuth, fetchShippingRates);
adminLocationRouter.post('/shipping-rates/add', adminAuth, addShippingRates);
adminLocationRouter.put('/shipping-rates/update', adminAuth, updateShippingRates);
adminLocationRouter.delete('/shipping-rates/delete', adminAuth, deleteShippingRates);


export default adminLocationRouter;