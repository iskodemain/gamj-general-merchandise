import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Orders = sequelize.define(
  'Orders',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
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
    paymentMethod: {
      type: DataTypes.ENUM('COD', 'Paypal'),
      allowNull: false,
    },
    orderStatus: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return/Refund'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dateOrdered: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'orders',
    timestamps: false,
  }
);

// Define model association
Orders.associate = (models) => {
  Orders.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default Orders;