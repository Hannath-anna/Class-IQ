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
    this.otp = user.otp,
    this.isBlocked = user.isBlocked;
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
                    "UPDATE students SET fullname = ?, email = ?, phone = ?, password = ?, course = ?, otp = ?, isVerified = false WHERE id = ?",
                    [userData.fullname, userData.email, userData.phone, userData.password, userData.course, userData.otp, existingUser.id],
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

        // Check if the OTP matches
        if (user.otp !== parseInt(otp)) {
            console.log(user.otp, otp);
            
            return result({ kind: "invalid_otp", message: "The OTP you entered is incorrect." }, null);
        }

        // OTP is correct! Update the user record.
        sql.query(
            "UPDATE students SET isVerified = true, otp = NULL WHERE id = ?",
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

module.exports = User;