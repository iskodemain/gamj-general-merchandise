import express from 'express';
import { loginAdmin, loginCodeVerify, fetchAdminProfile, saveAdminProfile, resendAdminLoginCode } from "../../controllers/admin/adminAuthController.js";

import adminAuth from "../../middleware/adminAuth.js";


const adminRouter = express.Router();

// LOGIN PROCESS
adminRouter.post('/login', loginAdmin);
adminRouter.post('/login/verify', loginCodeVerify);
adminRouter.post('/login/resend', resendAdminLoginCode);

// FETCH
adminRouter.get('/profile', adminAuth, fetchAdminProfile);

// UPDATE
adminRouter.patch('/profile/update', adminAuth, saveAdminProfile);


export default adminRouter;
