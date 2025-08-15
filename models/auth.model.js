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
    this.isBlocked = user.isBlocked
};

User.create = async (userData, result) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        userData.password = hashedPassword

        sql.query("INSERT INTO students SET ?", userData, (err, res) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    if (err.message.includes("users.email")) { 
                        result({ kind: "duplicate_email", message: "A user with this email already exists." }, null);
                        return;
                    }
                    if (err.message.includes("users.phone")) { 
                        result({ kind: "duplicate_phone", message: "A user with this phone number already exists." }, null);
                        return;
                    }
                }
                console.log("error: ", err);
                result(err, null);
                return;
            }
            result(null, { id: res.insertId, userData });
        });
    } catch (hashError) {
        console.log("Password Hashing Error: ", hashError);
        result(hashError, null);
    }
};

module.exports = User;