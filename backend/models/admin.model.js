const mysql = require('mysql2');
const config = require('../config');
const bcrypt = require('bcrypt');

const sql = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const Admin = function(admin) {
  this.fullname = admin.fullname;
  this.email = admin.email;
  this.phone = admin.phone;
  this.password = admin.password;
  this.course = admin.course;
  this.role_id = admin.role_id;
  this.isVerified = admin.isVerified;
  this.otpExpiresAt = admin.otpExpiresAt;
  this.otp = admin.otp;
  this.is_active = admin.is_active;
  this.isApproved = admin.isApproved;
};

Admin.create = async (adminData, result) => {
    try {
        // First, check if an admin already exists with this email or phone
        sql.query("SELECT * FROM admins WHERE email = ? OR phone = ?", [adminData.email, adminData.phone], async (err, admins) => {
            if (err) {
              console.log("Database query error: ", err);
              return result(err, null);
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
            adminData.password = hashedPassword;

            if (admins.length > 0) {
                const existingAdmin = admins[0];

                if (existingAdmin.isVerified) {
                    return result({ kind: "duplicate_entry", message: "A verified user with this email or phone already exists." }, null);
                }

                // User exists but is not verified, so UPDATE their OTP and details
                sql.query(
                    "UPDATE admins SET fullname = ?, email = ?, phone = ?, password = ?, course = ?, role_id = ?, otp = ?, otpExpiresAt = ? WHERE id = ?",
                    [adminData.fullname, adminData.email, adminData.phone, adminData.password, adminData.course, adminData.role_id, adminData.otp, adminData.otpExpiresAt, existingAdmin.id],
                    (updateErr, updateRes) => {
                        if (updateErr) return result(updateErr, null);
                        return result(null, { id: existingAdmin.id, ...adminData });
                    }
                );
            } else {
                // No user found, so INSERT a new one.
                sql.query("INSERT INTO admins SET ?", adminData, (insertErr, insertRes) => {
                    if (insertErr) {
                      console.log("error: ", insertErr);
                      return result(insertErr, null);
                    }
                    return result(null, { id: insertRes.insertId, ...adminData });
                });
            }
        });
    } catch (hashError) {
      console.log("Password Hashing Error: ", hashError);
      result(hashError, null);
    }
};

Admin.findByEmail = (email, result) => {
    // This function specifically queries the 'admins' table
    sql.query("SELECT * FROM admins WHERE email = ?", [email], (err, res) => {
        if (err) {
            console.log("Database query error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        // No user found with that email
        result({ kind: "not_found" }, null);
    });
};

// This function handles the OTP verification for admins/faculty.
Admin.verifyOtp = (email, otp, result) => {
    sql.query("SELECT * FROM admins WHERE email = ?", [email], (err, admins) => {
        if (err) {
          console.log("Database query error: ", err);
          return result(err, null);
        }
        if (admins.length === 0) {
            return result({ kind: "not_found", message: "No pending verification found for this email." }, null);
        }

        const admin = admins[0];

        // Check for OTP expiration
        if (new Date(admin.otpExpiresAt) < new Date()) {
            return result({ kind: "otp_expired", message: "The OTP has expired. Please try again." }, null);
        }

        // Check if the OTP matches
        if (admin.otp != parseInt(otp)) {
            return result({ kind: "invalid_otp", message: "The OTP you entered is incorrect." }, null);
        }

        // OTP is correct! Update the admin record.
        sql.query(
            "UPDATE admins SET isVerified = true, otp = NULL, otpExpiresAt = NULL WHERE id = ?",
            [admin.id],
            (updateErr, updateRes) => {
                if (updateErr) {
                  console.log("Database update error: ", updateErr);
                  return result(updateErr, null);
                }
                result(null, { id: admin.id, fullname: admin.fullname, email: admin.email, role_id: admin.role_id });
            }
        );
    });
};

module.exports = Admin;