import express from 'express';
import { loginCustomer, loginCodeVerify, registerCustomer, registerCodeVerify, requestPasswordResetCustomer, verifyPasswordResetCustomer, confirmPasswordResetCustomer,fetchVerifiedCustomer } from '../controllers/customerAuthController.js';
import { fetchCustomerEditProfile, updateCustomerEditProfile, fetchCustomerDeliveryInfo, updateCustomerDeliveryInfo, fetchCustomerAccountSecurity, updateCustomerAccountSecurity, verifyCustomerAccountSecurity, deleteCustomerAccount } from '../controllers/customerProfileController.js'

import { getLocationData } from '../controllers/customerLocationController.js'

import customerAuth from '../middleware/customerAuth.js'
import upload from '../middleware/multer.js';

const customerRouter = express.Router();

// LOGIN PROCESS
customerRouter.post('/login', loginCustomer);
customerRouter.post('/login/verify', loginCodeVerify);
// REGISTRATION PROCESS
customerRouter.post('/register', upload.single('imageProof'), registerCustomer);
customerRouter.post('/register/verify', registerCodeVerify);
// FORGOT PASSWORD PROCESS
customerRouter.post('/forgot-password', requestPasswordResetCustomer);
customerRouter.post('/forgot-password/verify', verifyPasswordResetCustomer);
customerRouter.post('/forgot-password/confirm', confirmPasswordResetCustomer);
// VERIFIED CUSTOMER
customerRouter.get('/verified-customer', customerAuth, fetchVerifiedCustomer);
// GET LOCATION DATA
customerRouter.get('/location', customerAuth, getLocationData);
// CUSTOMER EDIT PROFILE PROCESS
customerRouter.get('/profile/edit-profile', customerAuth, fetchCustomerEditProfile);
customerRouter.put(
    '/profile/edit-profile/update', 
    customerAuth, 
    upload.fields([
        { name: 'imageProof', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 }
    ]), 
    updateCustomerEditProfile
);

// CUSTOMER DELIVERY INFORMATION
customerRouter.get('/profile/delivery-info', customerAuth, fetchCustomerDeliveryInfo);
customerRouter.put('/profile/delivery-info/edit', customerAuth, updateCustomerDeliveryInfo);

// CUSTOMER ACCOUNT SECURITY
customerRouter.get('/profile/account-security', customerAuth, fetchCustomerAccountSecurity);
customerRouter.post('/profile/account-security/verify', customerAuth, verifyCustomerAccountSecurity);
customerRouter.put('/profile/account-security/update', customerAuth, updateCustomerAccountSecurity);

customerRouter.delete('/profile/account-security/delete', customerAuth, deleteCustomerAccount);

export default customerRouter;