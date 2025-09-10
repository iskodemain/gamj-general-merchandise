import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const DeliveryInfo = sequelize.define(
  'DeliveryInfo',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    deliveryId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    provinceId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'provinces',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    cityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    barangayId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'barangays',
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    medicalInstitutionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(11),
      allowNull: false,
      defaultValue: 'Philippines',
    },
    detailedAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING(4),
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    updateAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'deliveryInfo',
    timestamps: false,
  }
);

// Associations
DeliveryInfo.associate = (models) => {
  DeliveryInfo.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  DeliveryInfo.belongsTo(models.Province, {
    foreignKey: 'provinceId',
    as: 'province',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  DeliveryInfo.belongsTo(models.City, {
    foreignKey: 'cityId',
    as: 'city',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  DeliveryInfo.belongsTo(models.Barangay, {
    foreignKey: 'barangayId',
    as: 'barangay',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default DeliveryInfo;