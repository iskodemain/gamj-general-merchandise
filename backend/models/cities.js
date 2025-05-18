import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Cities = sequelize.define(
  'Cities',
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cityId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false, // Handled by MySQL trigger if applicable
    },
    provinceId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'provinces', // Make sure this matches your actual table name
        key: 'ID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    cityName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: 'cities',
    timestamps: false,
  }
);

// Optional: define association for Sequelize models (recommended for syncing relationships)
Cities.associate = function (models) {
  Cities.belongsTo(models.Provinces, {
    foreignKey: 'provinceId',
    as: 'province',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default Cities;