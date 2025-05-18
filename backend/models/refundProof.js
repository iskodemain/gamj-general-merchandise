import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const RefundProof = sequelize.define(
  'RefundProof',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    refundProofId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    cancelId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'orderCancel',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    refundId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'orderRefund',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    receiptImage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    transactionID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    refundProofDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'refundProof',
    timestamps: false,
  }
);

// Associations
RefundProof.associate = (models) => {
  RefundProof.belongsTo(models.OrderCancel, {
    foreignKey: 'cancelId',
    as: 'orderCancel',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  RefundProof.belongsTo(models.OrderRefund, {
    foreignKey: 'refundId',
    as: 'orderRefund',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default RefundProof;