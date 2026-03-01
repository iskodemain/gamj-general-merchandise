import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const ProductInventorySettings = sequelize.define(
  "ProductInventorySettings",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    productInventorySettingsId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false, // Auto-generated like your other IDs
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false, 
      references: {
        model: "products",
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    variantValueId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: "productVariantValues",
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    variantCombinationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: "productVariantCombination",
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },   
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ProductInventorySettings",
    timestamps: false,
  }
);

// Associations
ProductInventorySettings.associate = (models) => {
  ProductInventorySettings.belongsTo(models.Products, {
    foreignKey: "productId",
    targetKey: "ID",
  });

  ProductInventorySettings.belongsTo(models.ProductVariantValues, {
    foreignKey: "variantValueId",
    targetKey: "ID",
  });

  ProductInventorySettings.belongsTo(models.ProductVariantCombination, {
    foreignKey: "variantCombinationId",
    targetKey: "ID",
  });
};

export default ProductInventorySettings;