import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const ProductVariantValues = sequelize.define(
  "ProductVariantValues",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    productVariantValueId: {
      type: DataTypes.STRING(50),
      allowNull: false, // Auto-generated (e.g., by trigger or manually in service)
      unique: true,
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "products", // Must match table name
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    variantNameId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "variantName", // Must match table name
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "productVariantValues",
    timestamps: false,
  }
);

// Associations
ProductVariantValues.associate = (models) => {
  ProductVariantValues.belongsTo(models.Products, {
    foreignKey: "productId",
    targetKey: "ID",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  ProductVariantValues.belongsTo(models.VariantName, {
    foreignKey: "variantNameId",
    targetKey: "ID",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

export default ProductVariantValues;
