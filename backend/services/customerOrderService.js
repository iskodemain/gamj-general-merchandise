import Orders from "../models/orders.js";
import OrderItems from "../models/orderItems.js";
import Products from "../models/products.js";
import ProductVariantValues from "../models/productVariantValues.js";
import ProductVariantCombination from "../models/productVariantCombination.js";
import Customer from "../models/customer.js";
import OrderCancel from "../models/orderCancel.js"
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


export const cancelOrderService = async (customerId, orderItemId, reasonForCancellation, cancelComments, cancelPaypalEmail, cancelledBy) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const orderItem = await OrderItems.findByPk(orderItemId);
      if (!orderItem) {
        return {
          success: false,
          message: "Order item not found",
        };
      }

      // ✅ 3. Fetch product info
      const product = await Products.findByPk(orderItem.productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found.",
        };
      }

      // ✅ 4. Determine variant structure
      const { hasVariant, hasVariantCombination } = product;

      // --- Important variables ---
      const quantityToRestore = Number(orderItem.quantity || 0);
      let updatedStock;

      const productStock = Number(product.stockQuantity || 0);

      // ✅ 5. Update stock logic
      if (hasVariant && !hasVariantCombination) {
        // 👉 Product has individual variant values (e.g., size = "Small", "Medium") but no combined sets
        const variantValue = await ProductVariantValues.findOne({
          where: { productId: product.ID, value: orderItem.value },
        });

        if (variantValue) {
          const variantStock = Number(variantValue.stock || 0);
          updatedStock = variantStock + quantityToRestore;
          await variantValue.update({ stock: updatedStock });
        }

        // Also update main product stock
        await product.update({ stockQuantity: productStock + quantityToRestore });
      }

      else if (hasVariant && hasVariantCombination) {
        // 👉 Product uses combination variants (e.g., size + color)
        const variantCombination = await ProductVariantCombination.findOne({
          where: { productId: product.ID, combinations: orderItem.value },
        });

        if (variantCombination) {
          const comboStock = Number(variantCombination.stock || 0);
          updatedStock = comboStock + quantityToRestore;
          await variantCombination.update({ stock: updatedStock });
        }

        // Also update main product stock
        await product.update({ stockQuantity: productStock + quantityToRestore });
      }

      else {
        // 👉 Product has no variants — just update its main stock
        updatedStock = productStock + quantityToRestore;
        await product.update({ stockQuantity: updatedStock });
      }
      
      // ✅ 6. Update order item status to Cancelled
      await orderItem.update({ orderStatus: "Cancelled" });

      await OrderCancel.create({
        orderItemId,
        customerId,
        reasonForCancellation,
        cancelComments: cancelComments || null,
        cancelPaypalEmail: cancelPaypalEmail || null,
        cancelledBy,
      }, {
        fields: [
          'orderItemId',
          'customerId',
          'reasonForCancellation',
          'cancelComments',
          'cancelPaypalEmail',
          'cancelledBy'
        ]
      });
      

      return {
          success: true,
          message: "Cancelled Order Successfully.",
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const fetchOrderCancelService = async (customerId) => {
    try {
      const user = await Customer.findByPk(customerId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }


      const orderCancel = await OrderCancel.findAll({ where: { customerId: user.ID } });
      if (orderCancel.length === 0) {
        return {
          success: false,
          message: "Cancelled orders not found.",
          orderCancel: []
        };
      }

      return {
          success: true,
          message: "Cancelled orders fetched successfully.",
          orderCancel
      };

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

