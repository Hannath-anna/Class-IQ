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

