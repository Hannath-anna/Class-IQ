'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminProfile extends Model {
    static associate(models) {
      AdminProfile.belongsTo(models.Admin, { foreignKey: 'admin_id', as: 'admin' });
    }
  }

  AdminProfile.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    profile_picture_url: { type: DataTypes.STRING(255), allowNull: true },
    qualifications: {
      type: DataTypes.JSON, 
      allowNull: true,
    },
    address: { type: DataTypes.JSON, allowNull: true },
  }, {
    sequelize,
    modelName: 'AdminProfile',
    tableName: 'admin_profiles',
    timestamps: true,
  });

  return AdminProfile;
};