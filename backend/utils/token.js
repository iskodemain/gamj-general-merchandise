import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Admin token creation
export const createAdminToken = (ID) => {
  return jwt.sign({ ID, role: 'Admin' }, process.env.JWT_SECRET_ADMIN, { expiresIn: '7d' });
};

// Customer token creation
export const createCustomerToken = (ID) => {
  return jwt.sign({ ID, role: 'Customer' }, process.env.JWT_SECRET_CUSTOMER, { expiresIn: '7d' });
};

// Staff token creation
export const createStaffToken = (ID) => {
  return jwt.sign({ ID, role: 'Staff' }, process.env.JWT_SECRET_STAFF, { expiresIn: '7d' });
};

// BOTH FOR ADMIN, STAFF, AND CUSTOMER
export const generateLoginToken = () => {
    return crypto.randomBytes(32).toString('hex'); // loginToken
} 

// BOTH FOR ADMIN, STAFF, AND CUSTOMER
export const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString('hex'); // passwordResetToken
} 

