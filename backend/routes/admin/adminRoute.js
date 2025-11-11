import express from 'express';
import { loginAdmin, loginCodeVerify } from "../../controllers/admin/adminAuthController.js";

import adminAuth from "../../middleware/adminAuth.js";


const adminRouter = express.Router();

// LOGIN PROCESS
adminRouter.post('/login', loginAdmin);
adminRouter.post('/login/verify', loginCodeVerify);


export default adminRouter;
