const Course = require("../models/course.model.js");
const fs = require('fs');
const path = require('path');

const deleteImage = (imageUrl) => {
    if (!imageUrl) return;

    path.basename(imageUrl);
    const imagePath = path.join(process.cwd(), 'uploads', filename);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(`Failed to delete image: ${imagePath}`, err);
        } else {
            console.log(`Successfully deleted image: ${imagePath}`);
        }
    });
};

exports.findAll = (req, res) => {
    Course.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "An error occurred while retrieving courses."
            });
        else res.send(data);
    });
};

exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create a Course object from request body and file path
    const course = new Course({
        course_name: req.body.course_name,
        description: req.body.description,
        sub_description: req.body.sub_description,
        duration_text: req.body.duration_text,
        fee: req.body.fee,
        course_steps: JSON.parse(req.body.course_steps), 
        image_url: imageUrl,
        isBlocked: req.body.isBlocked
    });

    // Save Course in the database
    Course.create(course, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "An error occurred while creating the Course."
            });
        else res.status(201).send(data);
    });
};

exports.findOne = (req, res) => {
    const courseId = req.query.id;
    if (!courseId) {
        return res.status(400).send({ message: "Course ID must be provided in the query." });
    }

    Course.findById(courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Course with id ${courseId}.` });
            } else {
                res.status(500).send({ message: "Error retrieving Course with id " + courseId });
            }
        } else res.send(data);
    });
};