import Customer from "../models/customer.js";
import Products from "../models/products.js";
import Wishlist from "../models/wishlist.js";

// 🔹 ID GENERATOR
const withTimestamp = (prefix, number) => {
  return `${prefix}-${number.toString().padStart(5, "0")}-${Date.now()}`;
};

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

    // 🔹 Get last wishlist record
    const lastWishlist = await Wishlist.findOne({
      order: [['ID', 'DESC']],
    });

    // 🔹 Generate next wishlist number
    const nextWishlistNo = lastWishlist ? Number(lastWishlist.ID) + 1 : 1;
    const wishlistId = withTimestamp("WLST", nextWishlistNo);

    const addedWishlistItem = await Wishlist.create({
        wishlistId,
        customerId, 
        productId
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