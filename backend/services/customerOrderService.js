import Orders from "../models/orders";
import OrderItems from "../models/orderItems";
import Products from "../models/products";
import ProductVariantValues from "../models/productVariantValues";
import Customer from "../models/customer";

// CUSTOMER SIDE
export const addOrderService = async (customerId, paymentMethod, productId, value, quantity, subTotal) => {
  try {
    const user = await Customer.findByPk(customerId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const product = await Products.findByPk(productId, { transaction: t });
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Create order
    const order = await Orders.create(
      {
        customerId,
        paymentMethod,
      },
      { transaction: t }
    );

    // Create order item
    const orderItem = await OrderItems.create(
      {
        orderId: order.ID,
        productId,
        value,
        quantity,
        subTotal,
      },
      { transaction: t }
    );

    // ✅ Handle stock deduction
    if (product.hasVariant) {
      if (Array.isArray(value) && value.length > 0) {
        for (const val of value) {
          const variant = await ProductVariantValues.findOne({
            where: { productId, value: val },
            transaction: t,
          });

          if (!variant) {
            throw new Error(`Variant value '${val}' not found for product ${productId}`);
          }

          if (variant.stock <= 0) {
            throw new Error(`Variant '${val}' is out of stock`);
          }

          // Subtract stock
          variant.stock -= quantity;
          if (variant.stock < 0) variant.stock = 0;
          await variant.save({ transaction: t });
        }
      }

      // ✅ Only minus product stockQuantity if it has > 0
      if (product.stockQuantity > 0) {
        product.stockQuantity -= quantity;
        if (product.stockQuantity < 0) product.stockQuantity = 0;
        await product.save({ transaction: t });
      }
    } else {
      // ✅ No variants → only update product stockQuantity
      if (product.stockQuantity <= 0) {
        throw new Error(`Product '${product.productName}' is out of stock`);
      }
      product.stockQuantity -= quantity;
      if (product.stockQuantity < 0) product.stockQuantity = 0;
      await product.save({ transaction: t });
    }

    await t.commit();

    return {
      success: true,
      message: "Order placed successfully",
      order,
      orderItem,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};