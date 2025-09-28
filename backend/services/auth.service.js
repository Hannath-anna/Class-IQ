const bcrypt = require('bcrypt');
const db = require('../models/sequelize');
const { Op } = db.Sequelize;
const Student = db.Student;

const User = function(user) {
    this.fullname = user.fullname;
    this.email = user.email;
    this.phone = user.phone;
    this.password = user.password;
    this.courseId = user.courseId;
    this.isVerified = user.isVerified;
    this.otpExpiresAt = user.otpExpiresAt;
    this.otp = user.otp;
    this.isBlocked = user.isBlocked;
    this.isApproved = user.isApproved;
};

// Create or update a student
User.create = async (userData, result) => {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        const [student, created] = await Student.findOrCreate({
            where: {
                [Op.or]: [{ email: userData.email }, { phone: userData.phone }]
            },
            defaults: {
                fullname: userData.fullname,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                courseId: userData.courseId,
                isVerified: false,
                otp: userData.otp,
                otpExpiresAt: userData.otpExpiresAt,
                isBlocked: false,
                isApproved: false
            }
        });

        if (!created) {
            // Existing but not verified, update record
            if (student.isVerified) {
                return result({ kind: "duplicate_entry", message: "A verified user with this email or phone already exists." }, null);
            }

            await student.update({
                fullname: userData.fullname,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                courseId: userData.courseId,
                otp: userData.otp,
                otpExpiresAt: userData.otpExpiresAt,
                isVerified: false,
                isApproved: false
            });

            return result(null, student.toJSON());
        }

        return result(null, student.toJSON());

    } catch (error) {
        console.error("Error in User.create:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return result({ kind: "duplicate_entry", message: "A user with this email or phone already exists." }, null);
        }
        result(error, null);
    }
};

// Verify OTP
User.verifyOtp = async (email, otp, result) => {
    try {
        const student = await Student.findOne({ where: { email } });

        if (!student) return result({ kind: "not_found", message: "No pending verification found for this email." }, null);

        if (!student.otpExpiresAt || new Date(student.otpExpiresAt) < new Date()) {
            return result({ kind: "otp_expired", message: "The OTP you entered is expired." }, null);
        }

        if (student.otp != otp) {
            return result({ kind: "invalid_otp", message: "The OTP you entered is incorrect." }, null);
        }

        await student.update({ isVerified: true, otp: null, otpExpiresAt: null });

        result(null, { id: student.id, fullname: student.fullname, email: student.email });

    } catch (error) {
        result(error, null);
    }
};

// Login
User.login = async (email, password, result) => {
    try {
        const student = await Student.findOne({ where: { email } });
        if (!student) return result({ kind: "not_found", message: "Invalid email or password." }, null);

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return result({ kind: "invalid_credentials", message: "Invalid email or password." }, null);
        if (!student.isVerified) return result({ kind: "not_verified", message: "Please verify your email before logging in." }, null);
        if (student.isBlocked) return result({ kind: "blocked", message: "Your account has been blocked." }, null);

        const { password: pw, otp, ...userWithoutSensitive } = student.toJSON();
        result(null, userWithoutSensitive);

    } catch (error) {
        result(error, null);
    }
};

// Set reset OTP
User.setResetOtp = async (email, otp, otpExpiresAt, result) => {
    try {
        const student = await Student.findOne({ where: { email, isVerified: true } });
        if (!student) return result({ kind: "not_found" }, null);

        await student.update({ otp, otpExpiresAt });
        result(null, { otp });

    } catch (error) {
        result(error, null);
    }
};

// Reset password with OTP
User.resetPasswordWithOtp = async (email, otp, newPassword, result) => {
    try {
        const student = await Student.findOne({ where: { email, otpExpiresAt: { [Op.gt]: new Date() } } });
        if (!student) return result({ kind: "expired_or_invalid", message: "OTP is invalid or has expired." }, null);

        if (student.otp != otp) return result({ kind: "invalid_otp", message: "OTP is incorrect." }, null);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await student.update({ password: hashedPassword, otp: null, otpExpiresAt: null });

        result(null, { message: "Password has been reset successfully." });

    } catch (error) {
        result(error, null);
    }
};

// Block / unblock user
User.setBlockStatus = async (id, isBlocked, result) => {
    try {
        const student = await Student.findByPk(id);
        if (!student) return result({ kind: "not_found" }, null);

        await student.update({ isBlocked });
        result(null, { id, isBlocked });

    } catch (error) {
        result(error, null);
    }
};

// Approve / disapprove user
User.setApprovalStatus = async (id, isApproved) => {
  const student = await Student.findByPk(id);
  if (!student) {
    const err = { kind: "not_found" };
    throw err;
  }

  student.isApproved = isApproved;
  await student.save();

  return student;
};

// Get all students
User.getAll = async (result) => {
  try {
    const students = await Student.findAll({
      attributes: ['id', 'fullname', 'email', 'phone', 'isVerified', 'isBlocked', 'isApproved', 'createdAt'],
      include: [
        {
          model: db.Course,
          attributes: ['course_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    result(null, students);
  } catch (error) {
    result(error, null);
  }
};

module.exports = User;