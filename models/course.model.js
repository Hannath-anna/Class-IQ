const mysql = require('mysql2');
const config = require('../config');

const sql = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const Course = function(course) {
    this.course_name = course.course_name;
    this.image_url = course.image_url;
    this.description = course.description;
    this.sub_description = course.sub_description;
    this.duration_text = course.duration_text;
    this.fee = course.fee;
    this.course_steps = JSON.stringify(course.course_steps);
    this.isBlocked = course.isBlocked === undefined ? false : course.isBlocked;
};

Course.create = (newCourse, result) => {
    sql.query("INSERT INTO courses SET ?", newCourse, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { id: res.insertId, ...newCourse });
    });
};

Course.getAll = (result) => {
    sql.query("SELECT * FROM courses", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

Course.findById = (id, result) => {
    sql.query(`SELECT * FROM courses WHERE id = ${id}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }
        // not found Course with the id
        result({ kind: "not_found" }, null);
    });
};

Course.updateById = (id, course, result) => {
    sql.query(
        "UPDATE courses SET course_name = ?, image_url = ?, description = ?, sub_description = ?, duration_text = ?, fee = ?, course_steps = ?, isBlocked = ? WHERE id = ?",
        [course.course_name, course.image_url, course.description, course.sub_description, course.duration_text, course.fee, JSON.stringify(course.course_steps), course.isBlocked, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                // not found Course with the id
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { id: id, ...course });
        }
    );
};

module.exports = Course;