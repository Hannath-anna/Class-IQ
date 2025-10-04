const db = require('../models/sequelize');
const Admin = db.Admin;
const bcrypt = require('bcrypt');

const Faculty = function(admin) {
    this.fullname = admin.fullname;
    this.email = admin.email;
    this.phone = admin.phone;
    this.password = admin.password;
    this.courseId = user.courseId;
    this.isVerified = admin.isVerified;
    this.otpExpiresAt = admin.otpExpiresAt;
    this.otp = admin.otp;
    this.is_active = admin.is_active;
    this.isApproved = admin.isApproved;
};

// Signup / Create or Update OTP
Faculty.createOrUpdate = async (adminData) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
  adminData.password = hashedPassword;

  const [admin, created] = await Admin.findOrCreate({
    where: { email: adminData.email },
    defaults: adminData
  });

  if (!created) {
    if (admin.isVerified) {
      throw { kind: 'duplicate_entry', message: 'A verified admin with this email already exists.' };
    }

    // Update OTP and details for unverified admin
    await admin.update({ ...adminData, isVerified: false, is_active: false });
  }

  return admin;
};

// Verify OTP
Faculty.verifyOtp = async (email, otp) => {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) throw { kind: 'not_found', message: 'No pending verification found for this email.' };
  if (!admin.otpExpiresAt || new Date(admin.otpExpiresAt) < new Date()) throw { kind: 'otp_expired', message: 'OTP has expired.' };
  if (admin.otp != otp) throw { kind: 'invalid_otp', message: 'Invalid OTP.' };

  await admin.update({ isVerified: true, otp: null, otpExpiresAt: null });
  return admin;
};

// Login
Faculty.login = async (email, password) => {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) throw { kind: 'not_found', message: 'Invalid credentials.' };
  if (!admin.isVerified) throw { kind: 'not_verified', message: 'Account not verified. Sign in again.' };
  if (admin.is_active) throw { kind: 'blocked', message: 'Account is blocked.' };

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw { kind: 'invalid_credentials', message: 'Invalid credentials.' };

  return admin;
};

Faculty.getAllAdmins = async (result) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'fullname', 'email', 'phone', 'isVerified', 'isBlocked', 'isApproved', 'createdAt'],
      include: [
        {
          model: db.Course,
          attributes: ['course_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    result(null, admins);
  } catch (error) {
    result(error, null);
  }
};
module.exports = Faculty;