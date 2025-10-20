import Customer from "../models/customer.js";
import Products from "../models/products.js";
import Cart from "../models/cart.js";

export const fetchCartItemService = async (customerId) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    const cartItems = await Cart.findAll({
        where: {
            customerId
        }
    });

    if (cartItems.length === 0) {
        return { 
            success: false, 
            message: 'No items in cart', 
            cartItems: [] 
        };
    }

    return {
        success: true,
        message: "Fetch Cart Items.",
        cartItems
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addCartItemService = async (customerId, productId, value, quantity) => {
  try {
    quantity = Number(quantity);

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

    if (quantity === undefined || quantity === null || quantity <= 0) {
        return {
            success: false,
            message: "Product quantity is required."
        }
    }

    const normalizeValue = (value) => {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return "";
      };
      return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0).sort().join(", ");
    };

    const normalizedValue = normalizeValue(value);

    const existingCartItems = await Cart.findAll({ 
        where: { customerId, productId }
    });

    const existingCartItem = existingCartItems.find((item) => {
      const itemValue = normalizeValue(item.value);
      return itemValue === normalizedValue;
    }); 

    if (existingCartItem) {
        existingCartItem.quantity += quantity;
        await existingCartItem.save();
        return { 
            success: true, 
            message: "Added to cart.", 
            cartItem: existingCartItem 
        };
    }

    const addedCartItem = await Cart.create({
        customerId,
        productId,
        value: normalizedValue,
        quantity
    }, {
        fields: [
            'customerId',
            'productId',
            'value',
            'quantity'
        ]
    });

    return {
        success: true,
        message: "Added to cart.",
        cartItem: addedCartItem
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const updateCartItemService = async (customerId, productId, value, quantity) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    if (quantity === undefined || quantity === null || quantity <= 0) {
        return {
            success: false,
            message: "Product quantity is required."
        }
    }

    const normalizeValue = (value) => {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return "";
      };
      return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0).sort().join(", ");
    };

    const normalizedValue = normalizeValue(value);

    const existingCartItems = await Cart.findAll({
      where: { customerId, productId },
    });

    const existingCartItem = existingCartItems.find((item) => {
      const itemValue = normalizeValue(item.value);
      return itemValue === normalizedValue;
    }); 

    if (!existingCartItem) {
      return {
        success: false,
        message: 'Cart item not found',
      };
    }

    // update quantity
    existingCartItem.quantity = quantity;
    await existingCartItem.save();

    return {
      success: true,
      message: 'Cart item updated.',
      cartItem: existingCartItem,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const deleteCartItemService = async (customerId, cartMainId) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
        return {
            success: false,
            message: 'User not found'
        }
    }

    const cartItem = await Cart.findOne({
      where: {
        ID: cartMainId,
        customerId: customerId
      }
    });

    if (!cartItem) return { 
        success: false, 
        message: "Cart item not found" 
    };

    await cartItem.destroy();

    return {
        success: true,
        message: "Removed from cart."
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const deleteMultipleCartItemService = async (customerId, cartIds) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Validate at least one cartId is passed
    if (!Array.isArray(cartIds) || cartIds.length === 0) {
      return {
        success: false,
        message: "No cart items selected",
      };
    }

    // Delete items belonging to the user only
    const deletedCount = await Cart.destroy({
      where: {
        ID: cartIds,
        customerId: customerId,
      },
    });

    if (deletedCount === 0) {
      return {
        success: false,
        message: "No matching cart items found for this user",
      };
    }

    return {
      success: true,
      message: `Removed ${deletedCount} item(s) from cart.`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};