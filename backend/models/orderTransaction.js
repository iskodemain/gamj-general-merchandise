import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const OrderTransaction = sequelize.define(
  'OrderTransaction',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    transactionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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

    orderItemId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'orderItems',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    customerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'customer',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    transactionType: {
      type: DataTypes.ENUM(
        'Order Placed',
        'Payment Received',
        'Order Processing',
        'Out for Delivery',
        'Order Delivered',
        'Order Cancelled',
        'Order Refund Requested',
        'Order Refund Approved',
        'Order Refund Completed',
        'Order Cancellation Request',
        'Order Cancellation Processed',
        'Cancellation Request Cancelled'
      ),
      allowNull: false,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    paymentMethod: {
      type: DataTypes.ENUM('Cash On Delivery', 'Paypal'),
      allowNull: true,
    },

    transactionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: 'orderTransaction',
    timestamps: false,
  }
);

// Associations
OrderTransaction.associate = (models) => {
  OrderTransaction.belongsTo(models.Orders, {
    foreignKey: 'orderId',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  OrderTransaction.belongsTo(models.OrderItems, {
    foreignKey: 'orderItemId',
    as: 'orderItem',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  OrderTransaction.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default OrderTransaction;