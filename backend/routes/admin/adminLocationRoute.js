import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

import { addProvince, updateProvince, deleteProvince, fetchProvinces, fetchCities, fetchBarangays, addCities, updateCities, deleteCities } from "../../controllers/admin/adminLocationController.js";

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



export default adminLocationRouter;