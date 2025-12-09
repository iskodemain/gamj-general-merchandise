import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const InventoryBatch = sequelize.define(
  "InventoryBatch",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    inventoryBatchId: {
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

    batchNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    quantityReceived: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    remainingQuantity: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    dateReceived: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    supplier: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "InventoryBatch",
    timestamps: false,
  }
);

// Associations
InventoryBatch.associate = (models) => {
  InventoryBatch.belongsTo(models.Products, {
    foreignKey: "productId",
    targetKey: "ID",
  });

  InventoryBatch.belongsTo(models.ProductVariantValues, {
    foreignKey: "variantValueId",
    targetKey: "ID",
  });

  InventoryBatch.belongsTo(models.ProductVariantCombination, {
    foreignKey: "variantCombinationId",
    targetKey: "ID",
  });
};

export default InventoryBatch;
