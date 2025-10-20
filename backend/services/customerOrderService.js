import Orders from "../models/orders.js";
import OrderItems from "../models/orderItems.js";
import Products from "../models/products.js";
import ProductVariantValues from "../models/productVariantValues.js";
import ProductVariantCombination from "../models/productVariantCombination.js";
import Customer from "../models/customer.js";
import { Op } from "sequelize";


// CUSTOMER SIDE
export const addOrderService = async (customerId, paymentMethod, orderItems) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Validate input
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return { success: false, message: "Order items are required" };
    }

    if (!paymentMethod) {
      return { success: false, message: "Payment method is required" };
    }

    // ✅ PHASE 1: VALIDATE ALL BEFORE CREATING ORDER
    for (const item of orderItems) {
      const { productId, productVariantValueId, productVariantCombinationId } = item;

      const product = await Products.findByPk(productId);
      if (!product) {
        return { success: false, message: `Product ID ${productId} not found` };
      }

      if (productVariantCombinationId) {
        const variantCombo = await ProductVariantCombination.findByPk(productVariantCombinationId);
        if (!variantCombo) {
          return { success: false, message: `Product Variant Combination ID ${productVariantCombinationId} not found` };
        }
      }

      if (productVariantValueId) {
        const variantValue = await ProductVariantValues.findByPk(productVariantValueId);
        if (!variantValue) {
          return { success: false, message: `Product Variant Value ID ${productVariantValueId} not found` };
        }
      }
    }

    // Create main order
    const order = await Orders.create(
      {
        customerId,
        paymentMethod,
      }, {
        fields: [
          'customerId',
          'paymentMethod'
        ]
    });

    for (const item of orderItems) {
      const {productId, productVariantValueId, productVariantCombinationId, value, quantity, subTotal} = item;

      // ✅ Create Order Item
      await OrderItems.create(
        {
          orderId: order.ID,
          productId,
          productVariantValueId: productVariantValueId || null,
          productVariantCombinationId: productVariantCombinationId || null,
          value: value || "",
          quantity: Number(quantity) || 0,
          subTotal: Number(subTotal) || 0,
        },
        {
          fields: [
            "orderId",
            "productId",
            "productVariantValueId",
            "productVariantCombinationId",
            "value",
            "quantity",
            "subTotal",
          ],
        }
      );

       // ✅ Update stock
      if (productVariantCombinationId) {
        const variantCombo = await ProductVariantCombination.findByPk(productVariantCombinationId);
        const newStock = Math.max((variantCombo.stock || 0) - quantity, 0);
        await variantCombo.update({ stock: newStock });

        const product = await Products.findByPk(productId);
        const allVariantCombos = await ProductVariantCombination.findAll({ where: { productId } });
        const hasStock = allVariantCombos.some(v => v.stock > 0);
        await product.update({ isOutOfStock: !hasStock });
      } 
      else if (productVariantValueId) {
        const variantValue = await ProductVariantValues.findByPk(productVariantValueId);
        const newStock = Math.max((variantValue.stock || 0) - quantity, 0);
        await variantValue.update({ stock: newStock });

        const product = await Products.findByPk(productId);
        const allVariantValues = await ProductVariantValues.findAll({ where: { productId } });
        const hasStock = allVariantValues.some(v => v.stock > 0);
        await product.update({ isOutOfStock: !hasStock });
      } 
      else {
        const product = await Products.findByPk(productId);
        const newStock = Math.max((product.stockQuantity || 0) - quantity, 0);
        await product.update({
          stockQuantity: newStock,
          isOutOfStock: newStock <= 0 ? true : false,
        });
      }

    }

    return {
      success: true,
      message: "Order placed successfully",
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const fetchOrdersService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }


      const orders = await Orders.findAll({ where: { customerId: user.ID } });
      if (orders.length === 0) {
        return {
          success: false,
          message: "No orders found.",
          orders: [],
          orderItems: [],
        };
      }

      const orderItems = await OrderItems.findAll({
        where: {
          orderId: {
            [Op.in]: orders.map((order) => order.ID),
          },
        },
      });
      if (orderItems.length === 0) {
          return {
            success: false,
            message: "No order items found.",
            orders,
            orderItems: [],
          };
      }

      return {
          success: true,
          message: "Orders and order items fetched successfully.",
          orders,
          orderItems,
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}