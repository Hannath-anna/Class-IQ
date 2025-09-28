const { Student, StudentProfile, sequelize } = require('../models/sequelize');

const profileService = {};

profileService.findOrCreateByStudentId = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    include: { model: StudentProfile, as: 'profile' }
  });

  if (!student) {
    const error = new Error("Student not found");
    error.kind = "not_found";
    throw error;
  }

  // Create profile if not exists
  if (!student.profile) {
    await StudentProfile.create({ student_id: studentId });
    return await Student.findByPk(studentId, { include: { model: StudentProfile, as: 'profile' } });
  }

  return student;
};

profileService.updateProfile = async (studentId, studentData, profileData) => {
  const student = await profileService.findOrCreateByStudentId(studentId);

  // Use transaction for atomic updates
  return await sequelize.transaction(async (t) => {
    if (Object.keys(studentData).length > 0) await student.update(studentData, { transaction: t });
    if (Object.keys(profileData).length > 0) await student.profile.update(profileData, { transaction: t });

    return profileService.findOrCreateByStudentId(studentId);
  });
};

module.exports = profileService;