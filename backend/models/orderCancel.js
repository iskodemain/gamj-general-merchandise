import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const OrderCancel = sequelize.define(
  'OrderCancel',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cancelId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    orderItemId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
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
    reasonForCancellation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cancelComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelPaypalEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cancellationStatus: {
      type: DataTypes.ENUM('Processing', 'Refunded', 'Completed'),
      allowNull: false,
      defaultValue: 'Processing',
    },
    cancelledBy: {
      type: DataTypes.ENUM('Customer', 'Admin'),
      allowNull: true,
    },
    dateCancelled: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'orderCancel',
    timestamps: false,
  }
);

// Associations
OrderCancel.associate = (models) => {
  OrderCancel.belongsTo(models.OrderItems, {
    foreignKey: 'orderItemId',
    as: 'orderItem',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  OrderCancel.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default OrderCancel;