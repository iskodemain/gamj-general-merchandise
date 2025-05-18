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
        model: 'customer', // match your actual table name
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    productId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products', // match your actual table name
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    variantId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'variants', // match your actual table name
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    timestamps: false,
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

  Cart.belongsTo(models.Variants, {
    foreignKey: 'variantId',
    as: 'variant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default Cart;