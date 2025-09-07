const Profile = require("../models/profile.model.js");
const fs = require('fs');
const path = require('path');

// Helper function remains the same
const deleteImage = (imageUrl) => {
    if (!imageUrl) return;
    const filename = path.basename(imageUrl);
    const imagePath = path.join(process.cwd(), 'uploads/profiles', filename);
    fs.unlink(imagePath, (err) => {
        if (err) console.error(`Failed to delete image: ${imagePath}`, err);
    });
};

exports.get = async (req, res) => {
    const studentId = req.query.studentid;
    if (!studentId || ['undefined', 'null', ''].includes(studentId)) return res.status(400).send({ message: "Failed finding details, try again later!" });
    
    if (!studentId) {
        return res.status(401).send({ message: "Authentication Error: User ID not found." });
    }

    try {
        const data = await Profile.findOrCreateByStudentId(studentId);
        res.send(data);
    } catch (error) {
        if (error.kind === "not_found") {
            res.status(404).send({ message: `Student with id ${studentId} not found.` });
        } else {
            res.status(500).send({ message: "Error retrieving profile." });
        }
    }
};

exports.update = async (req, res) => {
    const studentId = req.query.studentid;
    if (!studentId || ['undefined', 'null', ''].includes(studentId)) return res.status(400).send({ message: "Failed finding details, try again later!" });
    
    if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    try {
        // Prepare data for the tables
        const studentData = {
            fullname: req.body.fullname,
        };
        const profileData = {
            qualifications: req.body.qualifications,
            address: req.body.address ? JSON.stringify(req.body.address) : null
        };

        // Handle file upload logic
        if (req.file) {
            // Find the existing profile to get the old image URL
            const existingProfile = await Profile.findOrCreateByStudentId(studentId);
            if (existingProfile && existingProfile.profile_picture_url) {
                deleteImage(existingProfile.profile_picture_url);
            }
            // Set the new image URL
            profileData.profile_picture_url = `/uploads/profiles/${req.file.filename}`;
        }

        // Call the single update function in the model
        await Profile.updateByStudentId(studentId, studentData, profileData);

        // Fetch the fully updated profile to send back to the frontend
        const updatedProfile = await Profile.findOrCreateByStudentId(studentId);
        res.send(updatedProfile);

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).send({ message: "Error updating profile." });
    }
};