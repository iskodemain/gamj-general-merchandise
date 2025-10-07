import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const ProductVariantCombination = sequelize.define(
  "ProductVariantCombination",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    productVariantCombinationId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "products", // Must match the table name in your Products model
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    combinations: {
      type: DataTypes.JSON, // e.g. ["M", "Blue"]
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    availability: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "productVariantCombination",
    timestamps: false,
  }
);

// Associations
ProductVariantCombination.associate = (models) => {
  ProductVariantCombination.belongsTo(models.Products, {
    foreignKey: "productId",
    targetKey: "ID",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

export default ProductVariantCombination;
