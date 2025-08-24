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

const User = function(user) {
    this.fullname = user.fullname;
    this.email = user.email;
    this.phone = user.phone;
    this.password = user.password;
    this.course = user.course;
    this.isVerified = user.isVerified;
    this.otpExpiresAt = user.otpExpiresAt;
    this.otp = user.otp,
    this.isBlocked = user.isBlocked;
    this.isApproved = user.isApproved;
};

User.create = async (userData, result) => {
    try {
        // First, find if a user already exists with this email or phone
        sql.query("SELECT * FROM students WHERE email = ? OR phone = ?", [userData.email, userData.phone], async (err, users) => {
            if (err) {
                console.log("Database query error: ", err);
                return result(err, null);
            }

            // Hash the new password regardless of insert or update
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            userData.password = hashedPassword;

            // A user with this email/phone was found
            if (users.length > 0) {
                const existingUser = users[0];

                // If the existing user is already verified, we can't do anything.
                if (existingUser.isVerified) {
                    return result({ kind: "duplicate_entry", message: "A verified user with this email or phone already exists." }, null);
                }

                // User exists but is not verified, so UPDATE them.
                sql.query(
                    "UPDATE students SET fullname = ?, email = ?, phone = ?, password = ?, course = ?, otp = ?, otpExpiresAt = ?, isVerified = false, isApproved = false WHERE id = ?",
                    [userData.fullname, userData.email, userData.phone, userData.password, userData.course, userData.otp, userData.otpExpiresAt, existingUser.id],
                    (updateErr, updateRes) => {
                        if (updateErr) {
                            console.log("error: ", updateErr);
                            return result(updateErr, null);
                        }
                        // Return the ID of the updated user
                        return result(null, { id: existingUser.id, ...userData });
                    }
                );

            } else {
                // No user found, so INSERT a new one.
                sql.query("INSERT INTO students SET ?", userData, (insertErr, insertRes) => {
                    if (insertErr) {
                        console.log("error: ", insertErr);
                        return result(insertErr, null);
                    }
                    return result(null, { id: insertRes.insertId, ...userData });
                });
            }
        });
    } catch (hashError) {
        console.log("Password Hashing Error: ", hashError);
        result(hashError, null);
    }
};

User.verifyOtp = (email, otp, result) => {
    sql.query("SELECT * FROM students WHERE email = ?", [email], (err, users) => {
        if (err) {
            console.log("Database query error: ", err);
            return result(err, null);
        }

        // If no user is found with that email
        if (users.length === 0) {
            return result({ kind: "not_found", message: "No pending verification found for this email." }, null);
        }

        const user = users[0];

        if (user.otpExpiresAt < Date.now()) {
            return result({ kind: "otp_expired", message: "The OTP you entered is expired, Please try again." }, null);
        }

        // Check if the OTP matches
        if (user.otp !== parseInt(otp)) {
            return result({ kind: "invalid_otp", message: "The OTP you entered is incorrect." }, null);
        }

        // OTP is correct! Update the user record.
        sql.query(
            "UPDATE students SET isVerified = true, otp = NULL, otpExpiresAt = NULL WHERE id = ?",
            [user.id],
            (updateErr, updateRes) => {
                if (updateErr) {
                    console.log("Database update error: ", updateErr);
                    return result(updateErr, null);
                }
                
                // Success! Return the user's essential data
                result(null, { id: user.id, fullname: user.fullname, email: user.email });
            }
        );
    });
};

User.login = (email, password, result) => {
    sql.query("SELECT * FROM students WHERE email = ?", [email], (err, users) => {
        if (err) {
            console.log("Database error: ", err);
            return result(err, null);
        }

        if (users.length === 0) {
            return result({ kind: "not_found", message: "Invalid email or password." }, null);
        }

        const user = users[0];

        // Compare the submitted password with the stored hash
        bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
            if (bcryptErr) {
                return result(bcryptErr, null);
            }
            if (!isMatch) {
                return result({ kind: "invalid_credentials", message: "Invalid email or password." }, null);
            }

            // Check if the account is verified
            if (!user.isVerified) {
                return result({ kind: "not_verified", message: "Please verify your email address before logging in." }, null);
            }

            // Check if the account is blocked
            if (user.isBlocked) {
                return result({ kind: "blocked", message: "Your account has been blocked. Please contact support." }, null);
            }

            // All checks passed! Return the user data (without the password).
            const { password, otp, ...userWithoutSensitiveData } = user;
            result(null, userWithoutSensitiveData);
        });
    });
};

User.setResetOtp = (email, otp, otpExpiresAt, result) => {
    sql.query("SELECT * FROM students WHERE email = ? AND isVerified = true", [email], (err, users) => {
        if (err) return result(err, null);

        // If no verified user is found, we don't proceed.
        if (users.length === 0) {
            return result({ kind: "not_found" }, null);
        }

        const user = users[0];

        // Update the user's record with the new OTP and its expiration
        sql.query(
            "UPDATE students SET otp = ?, otpExpiresAt = ? WHERE id = ?",
            [otp, otpExpiresAt, user.id],
            (updateErr, updateRes) => {
                if (updateErr) return result(updateErr, null);
                // Return the generated OTP so it can be emailed
                result(null, { otp });
            }
        );
    });
};

User.resetPasswordWithOtp = (email, otp, newPassword, result) => {
    // Find the user by email, ensuring the OTP is not expired
    sql.query(
        "SELECT * FROM students WHERE email = ? AND otpExpiresAt > NOW()",
        [email],
        async (err, users) => {
            if (err) return result(err, null);

            if (users.length === 0) {
                return result({ kind: "expired_or_invalid", message: "OTP is invalid or has expired." }, null);
            }

            const user = users[0];

            // Check if the OTP matches
            if (user.otp !== parseInt(otp)) {
                return result({ kind: "invalid_otp", message: "The OTP you entered is incorrect." }, null);
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the password and clear the OTP fields
            sql.query(
                "UPDATE students SET password = ?, otp = NULL, otpExpiresAt = NULL WHERE id = ?",
                [hashedPassword, user.id],
                (updateErr, updateRes) => {
                    if (updateErr) return result(updateErr, null);
                    result(null, { message: "Password has been reset successfully." });
                }
            );
        }
    );
};

User.getAll = (result) => {
    sql.query(
        "SELECT id, fullname, email, phone, course, isVerified, isBlocked, createdAt FROM students ORDER BY createdAt DESC",
        (err, res) => {
            if (err) {
                console.error("Error fetching all users:", err);
                return result(err, null);
            }
            result(null, res);
        }
    );
};

User.setBlockStatus = (id, isBlocked, result) => {
    // We update the 'is_active' column in the 'users' table.
    sql.query(
        "UPDATE students SET isBlocked = ? WHERE id = ?",
        [isBlocked, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            // Check if any row was actually updated.
            if (res.affectedRows == 0) {
                // No user found with that ID
                result({ kind: "not_found" }, null);
                return;
            }

            // Success
            result(null, { id: id, isBlocked: isBlocked });
        }
    );
};


module.exports = User;