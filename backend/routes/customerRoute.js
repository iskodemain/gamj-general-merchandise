import express from 'express';
import { loginCustomer, loginCodeVerify, registerCustomer, registerCodeVerify, requestPasswordResetCustomer, verifyPasswordResetCustomer, confirmPasswordResetCustomer } from '../controllers/customerAuthController.js';
import upload from '../middleware/multer.js';

const customerRouter = express.Router();

// LOGIN PROCESS
customerRouter.post('/login', loginCustomer);
customerRouter.post('/login/verify', loginCodeVerify);
customerRouter.post('/register', upload.single('imageProof'), registerCustomer);
customerRouter.post('/register/verify', registerCodeVerify);
customerRouter.post('/forgot-password', requestPasswordResetCustomer);
customerRouter.post('/forgot-password/verify', verifyPasswordResetCustomer);
customerRouter.post('/forgot-password/confirm', confirmPasswordResetCustomer);

export default customerRouter;