import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

const OrderDeliveryProof = sequelize.define(
  "OrderDeliveryProof",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    orderDeliveryProofId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },

    orderItemId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "orderItems",
        key: "ID",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    riderName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    proofImage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deliveredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: "orderDeliveryProof",
    timestamps: false,
  }
);

OrderDeliveryProof.associate = (models) => {
  OrderDeliveryProof.belongsTo(models.OrderItems, {
    foreignKey: "orderItemId",
    as: "orderItem",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

export default OrderDeliveryProof;
