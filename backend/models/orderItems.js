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
    variantId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'variants',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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

  OrderItems.belongsTo(models.Variants, {
    foreignKey: 'variantId',
    as: 'variant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default OrderItems;