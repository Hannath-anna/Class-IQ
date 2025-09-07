const config = require("../config");
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Use the promise-wrapped pool

const Profile = {};

Profile.findOrCreateByStudentId = async (studentId) => {
    const findQuery = `
        SELECT 
            s.id as studentId, s.fullname, s.email, s.phone, s.course,
            sp.id as profileId, sp.profile_picture_url, sp.qualifications, sp.address
        FROM students s
        LEFT JOIN student_profiles sp ON s.id = sp.student_id
        WHERE s.id = ?
    `;

    const [rows] = await pool.query(findQuery, [studentId]);

    if (rows.length > 0) {
        if (rows[0].profileId) {
            return rows[0]; // Profile found
        } else {
            // Student exists, profile doesn't. Create one.
            await pool.query("INSERT INTO student_profiles SET student_id = ?", [studentId]);
            const [finalRows] = await pool.query(findQuery, [studentId]);
            return finalRows[0];
        }
    } else {
        const error = new Error("Student not found");
        error.kind = "not_found";
        throw error;
    }
};

Profile.updateByStudentId = async (studentId, studentData, profileData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Only update students table if there's data for it
        if (Object.keys(studentData).length > 0) {
            await connection.query("UPDATE students SET ? WHERE id = ?", [studentData, studentId]);
        }
        
        // Only update profiles table if there's data for it
        if (Object.keys(profileData).length > 0) {
            await connection.query("UPDATE student_profiles SET ? WHERE student_id = ?", [profileData, studentId]);
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error; // Let the controller handle the error
    } finally {
        connection.release();
    }
};

module.exports = Profile;