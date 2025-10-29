import { sequelize } from "../config/sequelize.js";
import Provinces from "./provinces.js";
import Cities from "./cities.js";
import Barangays from "./barangays.js";
import Customer from "./customer.js";
import Products from "./products.js";
import OrderItems from "./orderItems.js";
import Orders from "./orders.js";
import ProductVariantValues from "./productVariantValues.js";
import ProductVariantCombination from "./productVariantCombination.js";
import VariantName from "./variantName.js";
import OrderCancel from "./orderCancel.js";
import OrderRefund from "./orderRefund.js";


const models = {
    Provinces,
    Cities,
    Barangays,
    Customer,
    Products,
    OrderItems,
    Orders,
    ProductVariantValues,
    ProductVariantCombination,
    VariantName,
    OrderCancel,
    OrderRefund
} 

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;