import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const PaymentProof = sequelize.define(
  'PaymentProof',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    paymentProofId: {
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

    referenceId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    receiptImage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    paymentProofDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'paymentProof',
    timestamps: false,
  }
);

// Associations
PaymentProof.associate = (models) => {
  PaymentProof.belongsTo(models.Orders, {
    foreignKey: 'orderId',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  PaymentProof.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default PaymentProof;
