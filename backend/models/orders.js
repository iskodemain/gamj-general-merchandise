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
      type: DataTypes.ENUM('Cash On Delivery', 'Paypal'),
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