import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const StorePolicy = sequelize.define(
  'StorePolicy',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storePolicyId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false, 
    },
    content: {
      type: DataTypes.TEXT('long'), 
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'storePolicy',
    timestamps: true,
  }
);

export default StorePolicy;