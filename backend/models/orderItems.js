import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const OrderItems = sequelize.define(
  'OrderItems',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    orderItemId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productVariantValueId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'productVariantValues',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productVariantCombinationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'productVariantCombination',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    orderStatus: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return/Refund'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    value: {
      type: DataTypes.TEXT, // e.g. "M, Blue"
      allowNull: true,
    },
    quantity: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'orderItems',
    timestamps: false,
  }
);

// Associations
OrderItems.associate = (models) => {
  OrderItems.belongsTo(models.Orders, {
    foreignKey: 'orderId',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  OrderItems.belongsTo(models.Products, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

    OrderItems.belongsTo(models.ProductVariantValues, {
    foreignKey: 'productVariantValueId',
    as: 'variantValue',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  OrderItems.belongsTo(models.ProductVariantCombination, {
    foreignKey: 'productVariantCombinationId',
    as: 'variantCombination',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default OrderItems;