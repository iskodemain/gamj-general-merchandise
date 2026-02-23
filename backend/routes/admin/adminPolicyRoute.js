import express from 'express';

import { fetchReturnRefundPolicy, addReturnRefundPolicy, updateReturnRefundPolicy } from '../../controllers/admin/adminPolicyController.js';

import adminAuth from "../../middleware/adminAuth.js";


const adminPolicyRoute = express.Router();

// FETCH
adminPolicyRoute.get('/fetch', adminAuth, fetchReturnRefundPolicy);

// ADD
adminPolicyRoute.post('/add', adminAuth, addReturnRefundPolicy);

// UPDATE
adminPolicyRoute.put('/update', adminAuth, updateReturnRefundPolicy);

export default adminPolicyRoute;
