import express from 'express';
import customerAuth from '../middleware/customerAuth.js'

const orderRouter = express.Router();


// FETCH CART ITEM
orderRouter.get('/', customerAuth);



export default orderRouter;