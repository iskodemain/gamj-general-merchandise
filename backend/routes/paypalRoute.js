import express from 'express';
import customerAuth from '../middleware/customerAuth.js'
import { createPayPalOrder, capturePayPalOrder } from '../controllers/paypalController.js';

const paypalRouter = express.Router();

// CREATE ORDER
paypalRouter.post('/create-order', customerAuth, createPayPalOrder);

// CAPTURE ORDER
paypalRouter.post('/capture-order', customerAuth, capturePayPalOrder);

export default paypalRouter;