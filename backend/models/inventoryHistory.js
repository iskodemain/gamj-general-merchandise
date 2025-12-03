import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const InventoryHistory = sequelize.define(
  "InventoryHistory",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
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

    type: {
      type: DataTypes.ENUM("IN", "OUT", "RETURN", "DAMAGED", "ADJUST"),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    referenceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "InventoryHistory",
    timestamps: false,
  }
);

// Associations
InventoryHistory.associate = (models) => {
  InventoryHistory.belongsTo(models.Products, {
    foreignKey: "productId",
    targetKey: "ID",
  });

  InventoryHistory.belongsTo(models.ProductVariantValues, {
    foreignKey: "variantValueId",
    targetKey: "ID",
  });

  InventoryHistory.belongsTo(models.ProductVariantCombination, {
    foreignKey: "variantCombinationId",
    targetKey: "ID",
  });
};

export default InventoryHistory;
