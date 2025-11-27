import express from 'express';

import { fetchAllCustomer, fetchDeliveryInfo, fetchLocationData, fetchAllStaff, fetchAllAdmin, approvedUser, rejectUser, deleteUser } from '../../controllers/admin/adminUsersController.js';

import adminAuth from "../../middleware/adminAuth.js";


const adminUsersRouter = express.Router();

// FETCH
adminUsersRouter.get('/customer', adminAuth, fetchAllCustomer);
adminUsersRouter.get('/staff', adminAuth, fetchAllStaff);
adminUsersRouter.get('/admin', adminAuth, fetchAllAdmin);
adminUsersRouter.get('/delivery-info', adminAuth, fetchDeliveryInfo);
adminUsersRouter.get('/locations', adminAuth, fetchLocationData);

// UPDATE
adminUsersRouter.patch('/approval', adminAuth, approvedUser);
adminUsersRouter.patch('/reject', adminAuth, rejectUser);
adminUsersRouter.post('/delete', adminAuth, deleteUser);



export default adminUsersRouter;
