import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

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
    senderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true, // Admin, staff, or system(null)
    },
    receiverId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true, // null means "for all users of that type"
    },
    receiverType: {
      type: DataTypes.ENUM('Customer', 'Staff', 'Admin', 'All'),
      allowNull: false,
    },
    senderType: {
      type: DataTypes.ENUM('Admin', 'System'),
      allowNull: false,
    },
    notificationType: {
      type: DataTypes.ENUM('Transaction', 'Product Update', 'Order Cancellation', 'Order Return/Refund', 'Account'),
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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