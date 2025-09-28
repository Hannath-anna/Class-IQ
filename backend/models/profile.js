'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentProfile extends Model {
    static associate(models) {
      StudentProfile.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    }
  }

  StudentProfile.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    profile_picture_url: { type: DataTypes.STRING(255), allowNull: true },
    qualifications: { type: DataTypes.STRING(500), allowNull: true },
    address: { type: DataTypes.JSON, allowNull: true }, // e.g., { street, city, state, zip, country }
  }, {
    sequelize,
    modelName: 'StudentProfile',
    tableName: 'student_profiles',
    timestamps: true,
  });

  return StudentProfile;
};