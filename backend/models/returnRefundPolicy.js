import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ReturnRefundPolicy = sequelize.define(
  'ReturnRefundPolicy',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    policyId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    returnRefundDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: 'returnRefundPolicy',
    timestamps: false, // using manual createdAt/updatedAt
  }
);

export default ReturnRefundPolicy;