import express from 'express';

import { fetchReturnRefundPolicy, addReturnRefundPolicy, updateReturnRefundPolicy, addStorePolicy, fetchStorePolicy, updateStorePolicy } from '../../controllers/admin/adminPolicyController.js';

import adminAuth from "../../middleware/adminAuth.js";


const adminPolicyRoute = express.Router();

// FETCH
adminPolicyRoute.get('/return-and-refund/fetch', fetchReturnRefundPolicy);
adminPolicyRoute.get('/store/fetch', fetchStorePolicy);

// ADD
adminPolicyRoute.post('/return-and-refund/add', adminAuth, addReturnRefundPolicy);
adminPolicyRoute.post('/store/add', adminAuth, addStorePolicy);

// UPDATE
adminPolicyRoute.put('/return-and-refund/update', adminAuth, updateReturnRefundPolicy);
adminPolicyRoute.put('/store/update', adminAuth, updateStorePolicy);

export default adminPolicyRoute;
