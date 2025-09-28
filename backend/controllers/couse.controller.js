const Course = require('../services/course.service');

// Get all courses
exports.findAll = async (req, res) => {
    try {
        Course.getAll((err, courses) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(courses);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get course by ID
exports.findOne = async (req, res) => {
    try {
        Course.findById(req.query.id, (err, course) => {
            if (err) return res.status(err.kind === 'not_found' ? 404 : 500).json({ message: err.message });
            res.json(course);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create course
exports.create = async (req, res) => {
    try {
        Course.create(req.body, req.file, (err, course) => {
            if (err) return res.status(err.kind === 'duplicate_entry' ? 409 : 500).json({ message: err.message });
            res.status(201).json(course);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update course
exports.update = async (req, res) => {
    try {
        Course.updateById(req.query.id, req.body, req.file, (err, course) => {
            if (err) return res.status(err.kind === 'not_found' ? 404 : 500).json({ message: err.message });
            res.json(course);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Block / Unblock course
exports.updateBlockStatus = async (req, res) => {
    try {
        Course.setBlockStatus(req.query.id, req.body.isBlocked, (err, course) => {
            if (err) return res.status(err.kind === 'not_found' ? 404 : 500).json({ message: err.message });
            res.json({ message: `Course ${req.body.isBlocked ? 'blocked' : 'unblocked'} successfully`, course });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete course
exports.delete = async (req, res) => {
    try {
        Course.remove(req.query.id, (err, result) => {
            if (err) return res.status(err.kind === 'not_found' ? 404 : 500).json({ message: err.message });
            res.json({ message: 'Course deleted successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};