'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.hasOne(models.StudentProfile, { foreignKey: 'student_id', as: 'profile' });
      Student.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    }
  }
  Student.init({
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
      unique: true, // Email must be unique
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true, // Phone must be unique
      allowNull: false // Assuming phone is also required and unique
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
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true // Can be null when not needed
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true // Can be null when not needed
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
    underscored: false 
  });
  return Student;
};