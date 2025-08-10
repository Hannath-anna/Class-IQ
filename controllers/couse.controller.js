const Course = require("../models/course.model.js");

exports.findAll = (req, res) => {
    Course.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "An error occurred while retrieving courses."
            });
        else res.send(data);
    });
};
