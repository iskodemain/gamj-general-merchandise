import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Cart = sequelize.define(
  'Cart',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cartId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'customer', // must match your actual table name
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products', // must match your actual table name
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    value: {
      type: DataTypes.JSON, // ✅ matches your CREATE TABLE value JSON
      allowNull: true,
    },
    quantity: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    dateAdded: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'cart',
    timestamps: false, // you're handling dateAdded manually
  }
);

// Define model associations
Cart.associate = (models) => {
  Cart.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Cart.belongsTo(models.Products, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default Cart;
