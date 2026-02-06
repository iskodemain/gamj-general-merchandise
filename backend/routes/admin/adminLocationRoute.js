import express from 'express';
import adminAuth from '../../middleware/adminAuth.js';

import { addProvince, updateProvince, deleteProvince, fetchProvinces, fetchCities, fetchBarangays } from "../../controllers/admin/adminLocationController.js";

const adminLocationRouter = express.Router();

// PROVINCES
adminLocationRouter.get('/provinces/fetch', adminAuth, fetchProvinces);
adminLocationRouter.post('/provinces/add', adminAuth, addProvince);
adminLocationRouter.put('/provinces/update', adminAuth, updateProvince);
adminLocationRouter.delete('/provinces/delete', adminAuth, deleteProvince);

// CITIES
adminLocationRouter.get('/cities/fetch', adminAuth, fetchCities);

// BARANGAYS
adminLocationRouter.get('/barangays/fetch', adminAuth, fetchBarangays);



export default adminLocationRouter;