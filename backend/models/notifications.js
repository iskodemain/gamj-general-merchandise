import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';  // Adjust the path as needed

const Notifications = sequelize.define(
  'Notifications',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    notificationId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    senderId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    receiverType: {
      type: DataTypes.ENUM('Customer', 'Staff', 'Admin'),
      allowNull: false,
    },
    senderType: {
      type: DataTypes.ENUM('Admin', 'System'),
      allowNull: false,
    },
    notificationType: {
      type: DataTypes.ENUM('Transaction', 'User Activity', 'Product Update', 'Security', 'General'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    createAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'notifications',
    timestamps: false,
  }
);

export default Notifications;