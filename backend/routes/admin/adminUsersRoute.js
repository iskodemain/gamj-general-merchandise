import express from 'express';

import { fetchAllCustomer, fetchDeliveryInfo, fetchLocationData } from '../../controllers/admin/adminUsersController.js';

import adminAuth from "../../middleware/adminAuth.js";


const adminUsersRouter = express.Router();

// FETCH
adminUsersRouter.get('/list', adminAuth, fetchAllCustomer);
adminUsersRouter.get('/delivery-info', adminAuth, fetchDeliveryInfo);
adminUsersRouter.get('/locations', adminAuth, fetchLocationData);



export default adminUsersRouter;
