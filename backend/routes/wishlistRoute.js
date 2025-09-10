import express from 'express';
import customerAuth from '../middleware/customerAuth.js'

import { addWishlistItem, fetchWishlistItem, deleteWishlistItem } from '../controllers/customerWishlistController.js';

const wishlistRouter = express.Router();


// FETCH WISHLIST ITEM
wishlistRouter.get('/', customerAuth, fetchWishlistItem);

// ADD WISHLIST ITEM
wishlistRouter.post('/add', customerAuth, addWishlistItem);

// DELETE WISHLIST ITEM
wishlistRouter.delete('/delete', customerAuth, deleteWishlistItem);

export default wishlistRouter;