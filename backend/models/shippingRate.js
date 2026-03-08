import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ShippingRate = sequelize.define(
  'ShippingRate',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    shippingRateId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },

    // ── REQUIRED ──────────────────────────────────────────
    provinceId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,           // always required
      references: { 
        model: 'provinces', 
        key: 'ID' 
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // ── OPTIONAL — makes the rate more specific ────────────
    cityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      references: { 
        model: 'cities', 
        key: 'ID' 
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    barangayId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      references: { 
        model: 'barangays', 
        key: 'ID' 
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'shippingRates',
    timestamps: true,
  }
);

ShippingRate.associate = (models) => {
  ShippingRate.belongsTo(models.Provinces, {
    foreignKey: 'provinceId',
    as: 'province',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ShippingRate.belongsTo(models.Cities, {
    foreignKey: 'cityId',
    as: 'city',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ShippingRate.belongsTo(models.Barangays, {
    foreignKey: 'barangayId',
    as: 'barangay',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default ShippingRate;