const fs = require('fs');
const path = require('path');
const db = require('../models/sequelize');
const Course = db.Course;

// Utility to delete images
const deleteImage = (imageUrl) => {
    if (!imageUrl) return;
    const filename = path.basename(imageUrl);
    const imagePath = path.join(process.cwd(), 'uploads', filename);
    fs.unlink(imagePath, (err) => {
        if (err) console.error(`Failed to delete image: ${imagePath}`, err);
    });
};

const CourseModel = function(course) {
    this.course_name = course.course_name;
    this.description = course.description;
    this.sub_description = course.sub_description;
    this.duration_text = course.duration_text;
    this.fee = course.fee;
    this.batch_strength = course.batch_strength;
    this.course_steps = course.course_steps;
    this.image_url = course.image_url;
    this.isBlocked = course.isBlocked;
};

// Create a new course
CourseModel.create = async (data, file, result) => {
    try {
        const image_url = file ? `/uploads/${file.filename}` : null;

        const course = await Course.create({
            course_name: data.course_name,
            description: data.description,
            sub_description: data.sub_description,
            duration_text: data.duration_text,
            fee: data.fee,
            batch_strength: data.batch_strength || 0,
            course_steps: data.course_steps,
            image_url,
            isBlocked: false
        });

        result(null, course.toJSON());
    } catch (error) {
        console.error("Error in CourseModel.create:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return result({ kind: "duplicate_entry", message: "Course name already exists." }, null);
        }
        result(error, null);
    }
};

// Find course by ID
CourseModel.findById = async (id, result) => {
    try {
        const course = await Course.findByPk(id);
        if (!course) return result({ kind: "not_found", message: `Course not found with id ${id}` }, null);

        result(null, course.toJSON());
    } catch (error) {
        result(error, null);
    }
};

// Update course
CourseModel.updateById = async (id, data, file, result) => {
    try {
        const course = await Course.findByPk(id);
        if (!course) return result({ kind: "not_found" }, null);

        if (file && course.image_url) deleteImage(course.image_url);

        const image_url = file ? `/uploads/${file.filename}` : course.image_url;

        await course.update({
            course_name: data.course_name,
            description: data.description,
            sub_description: data.sub_description,
            duration_text: data.duration_text,
            fee: data.fee,
            batch_strength: data.batch_strength,
            course_steps: data.course_steps,
            image_url
        });

        result(null, course.toJSON());
    } catch (error) {
        result(error, null);
    }
};

// Update block status
CourseModel.setBlockStatus = async (id, isBlocked, result) => {
    try {
        const course = await Course.findByPk(id);
        if (!course) return result({ kind: "not_found" }, null);

        await course.update({ isBlocked });
        result(null, { id, isBlocked });
    } catch (error) {
        result(error, null);
    }
};

// Delete course
CourseModel.remove = async (id, result) => {
    try {
        const course = await Course.findByPk(id);
        if (!course) return result({ kind: "not_found" }, null);

        if (course.image_url) deleteImage(course.image_url);
        await course.destroy();

        result(null, { message: "Course deleted successfully." });
    } catch (error) {
        result(error, null);
    }
};

// Get all courses
CourseModel.getAll = async (result) => {
    try {
        const courses = await Course.findAll({
            attributes: [
                'id',
                'course_name',
                'description',
                'sub_description',
                'duration_text',
                'fee',
                'batch_strength',
                'course_steps',
                'image_url',
                'isBlocked',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });
        result(null, courses);
    } catch (error) {
        result(error, null);
    }
};

module.exports = CourseModel;