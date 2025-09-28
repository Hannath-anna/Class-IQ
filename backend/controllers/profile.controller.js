const profileService = require('../services/profile.service');
const fs = require('fs');
const path = require('path');

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

  try {
    const student = await profileService.findOrCreateByStudentId(studentId);
    res.send(student);
  } catch (error) {
    if (error.kind === "not_found") res.status(404).send({ message: "Student not found." });
    else res.status(500).send({ message: "Error retrieving profile." });
  }
};

exports.update = async (req, res) => {
  const studentId = req.query.studentid;
    if (!studentId || ['undefined', 'null', ''].includes(studentId)) return res.status(400).send({ message: "Failed finding details, try again later!" });
    
    if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

  if (!req.body) return res.status(400).send({ message: "Request body cannot be empty." });

  try {
    const studentData = { fullname: req.body.fullname };
    const profileData = {
      qualifications: req.body.qualifications,
      address: req.body.address ? req.body.address : null
    };

    if (req.file) {
      const existing = await profileService.findOrCreateByStudentId(studentId);
      if (existing.profile.profile_picture_url) deleteImage(existing.profile.profile_picture_url);
      profileData.profile_picture_url = `/uploads/profiles/${req.file.filename}`;
    }
    
    const updated = await profileService.updateProfile(studentId, studentData, profileData);
    res.send(updated);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).send({ message: "Error updating profile." });
  }
};