import Customer from "../models/customer.js";
import Products from "../models/products.js";
import Wishlist from "../models/wishlist.js";

export const fetchWishlistItemService = async (customerId) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    const wishlistItems = await Wishlist.findAll({
        where: {
            customerId
        }
    });

    if (!wishlistItems) {
        return {
            message: 'No items in wishlist',
            success: false,
        }
    }

    return {
        success: true,
        message: "Fetch Wishlist Item.",
        wishlistItems
    };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};


export const addWishlistItemService = async (customerId, productId) => {
  try {
    const user = await Customer.findByPk(customerId);
    const product = await Products.findByPk(productId);
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    if (!product) {
        return {
            success: false,
            message: 'Product not found'
        }
    }

    const addedWishlistItem = await Wishlist.create({
        customerId, 
        productId
    }, {
        fields: [
            'customerId',
            'productId'
        ]
    });

    return {
        success: true,
        message: "Added to wishlist.",
        addedWishlistItem
    };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const deleteWishlistItemService = async (customerId, productId) => {
  try {
    const user = await Customer.findByPk(customerId);
    const product = await Products.findByPk(productId);
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    if (!product) {
        return {
            success: false,
            message: 'Product not found'
        }
    }

    await Wishlist.destroy({
        where: {
            customerId,
            productId
        }
    });
    

    return {
        success: true,
        message: "Removed to wishlist.",
    };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};