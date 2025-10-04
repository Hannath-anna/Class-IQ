'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      Admin.hasOne(models.AdminProfile, { foreignKey: 'admin_id', as: 'profile' });
      Admin.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    }
  }

  Admin.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    fullname: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true 
    },
    phone: { 
      type: DataTypes.STRING, 
      allowNull: true,
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'courses', 
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    role_id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      defaultValue: 2 
    },
    isVerified: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    otp: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    otpExpiresAt: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    is_active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    isApproved: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    }
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: true,
    underscored: false 
  });

  return Admin;
};
