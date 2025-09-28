'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.hasMany(models.Student, { foreignKey: 'courseId', as: 'students' });
    }
  }

  Course.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    course_name: { 
      type: DataTypes.STRING, 
      allowNull: false, unique: true 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    sub_description: { 
      type: DataTypes.STRING(500), 
      allowNull: true 
    },
    duration_text: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    fee: { 
      type: DataTypes.DECIMAL(10,2), 
      allowNull: false
    },
    batch_strength: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    course_steps: { 
      type: DataTypes.JSON, 
      allowNull: true 
    },
    image_url: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    isBlocked: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    }
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
    timestamps: true,
    underscored: false
  });

  return Course;
};


















// 'use strict';
// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define(
//     'Course',
//     {
//       id: {
//         type: DataTypes.INTEGER.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       course_name: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         unique: true,
//       },
//       image_url: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       sub_description: {
//         type: DataTypes.STRING(500),
//         allowNull: true,
//       },
//       duration_text: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//       },
//       fee: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       batch_strength: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//       },
//       course_steps: {
//         type: DataTypes.JSON,
//         allowNull: true,
//       },
//       isBlocked: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         field: 'created_at',
//       },
//       updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         field: 'updated_at',
//       },
//     },
//     {
//       tableName: 'courses',
//       timestamps: true,
//       underscored: true, 
//       freezeTableName: true, 
//     }
//   );

//   return Course;
// };