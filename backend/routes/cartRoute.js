import express from 'express';
import customerAuth from '../middleware/customerAuth.js'

import { fetchCartItem, addCartItem, updateCartItem, deleteCartItem, deleteMultipleCartItem } from '../controllers/customerCartController.js';

const cartRouter = express.Router();


// FETCH CART ITEM
cartRouter.get('/', customerAuth, fetchCartItem);

// ADD CART ITEM
cartRouter.post('/add', customerAuth, addCartItem);

// UPDATE CART ITEM
cartRouter.put('/update', customerAuth, updateCartItem);

// DELETE CART ITEM
cartRouter.delete('/delete', customerAuth, deleteCartItem);

// DELETE MULTIPLE CART ITEM
cartRouter.delete('/delete-multiple', customerAuth, deleteMultipleCartItem);

export default cartRouter;