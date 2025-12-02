import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const OrderRefund = sequelize.define(
  'OrderRefund',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    refundId: {
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
    reasonForRefund: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    refundComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageProof1: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageProof2: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refundResolution: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otherReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refundMethod: {
      type: DataTypes.ENUM(
        'PayPal Refund — Refund will be processed to your PayPal account.',
        'Cash Refund — Receive your refund in cash.',
        'No Refund Needed — I don\'t need a refund'
      ),
      allowNull: true,
    },
    refundPaypalEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refundStatus: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Successfully Processed', 'Rejected', 'Refunded'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    rejectedReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dateRequest: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dateApproved: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'orderRefund',
    timestamps: false,
  }
);

// Associations
OrderRefund.associate = (models) => {
  OrderRefund.belongsTo(models.OrderItems, {
    foreignKey: 'orderItemId',
    as: 'orderItem',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  OrderRefund.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default OrderRefund;