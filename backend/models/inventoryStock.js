import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const InventoryStock = sequelize.define(
  "InventoryStock",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    inventoryStockId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false, // it's auto-generated 
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
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    variantCombinationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: "productVariantCombination",
        key: "ID",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    totalQuantity: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    lowStockThreshold: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "InventoryStock",
    timestamps: false,
  }
);

// Associations
InventoryStock.associate = (models) => {
  InventoryStock.belongsTo(models.Products, {
    foreignKey: "productId",
    targetKey: "ID",
  });

  InventoryStock.belongsTo(models.ProductVariantValues, {
    foreignKey: "variantValueId",
    targetKey: "ID",
  });

  InventoryStock.belongsTo(models.ProductVariantCombination, {
    foreignKey: "variantCombinationId",
    targetKey: "ID",
  });
};

export default InventoryStock;
