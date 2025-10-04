const db = require('../models/sequelize');
const Admin = db.Admin;
const AdminProfile = db.AdminProfile; // Assuming you have AdminProfile in db.js
const sequelize = db.sequelize; // Import sequelize instance for transactions

const AdminProfileService = {};

// Helper function to create an error object
const createError = (kind, message) => {
  const error = new Error(message);
  error.kind = kind;
  return error;
};

// Finds an admin and ensures they have an associated profile, creating one if not.
AdminProfileService.findAdminWithProfile = async (adminId) => {
  const admin = await Admin.findByPk(adminId, {
    include: { model: AdminProfile, as: 'profile' }
  });

  if (!admin) {
    throw createError("not_found", "Admin not found.");
  }

  // If no profile exists, create a default one
  if (!admin.profile) {
    const newProfile = await AdminProfile.create({ admin_id: adminId });
    // Re-fetch to include the new profile in the admin object
    return await Admin.findByPk(adminId, { include: { model: AdminProfile, as: 'profile' } });
  }

  return admin;
};

// Finds only the profile for a given adminId
AdminProfileService.findProfileByAdminId = async (adminId) => {
  const profile = await AdminProfile.findOne({ where: { admin_id: adminId } });
  return profile; // Returns null if not found, which is fine for checking existence
};


// Updates both admin's basic data and their profile data in a transaction
AdminProfileService.updateAdminAndProfile = async (adminId, adminData, profileData) => {
  // First, get the admin and ensure profile exists
  const admin = await AdminProfileService.findAdminWithProfile(adminId);

  return await sequelize.transaction(async (t) => {
    // Update Admin model data if provided
    if (adminData && Object.keys(adminData).length > 0) {
      await admin.update(adminData, { transaction: t });
    }

    // Update AdminProfile model data if provided
    if (profileData && Object.keys(profileData).length > 0) {
        // Ensure qualifications are stored as JSON (array of strings)
        if (profileData.qualifications && Array.isArray(profileData.qualifications)) {
            profileData.qualifications = profileData.qualifications; // Sequelize's JSON type handles this
        }
        // Ensure address is stored as JSON (object)
        if (profileData.address && typeof profileData.address === 'object' && profileData.address !== null) {
            profileData.address = profileData.address; // Sequelize's JSON type handles this
        }

      await admin.profile.update(profileData, { transaction: t });
    }

    // Return the updated admin with their profile
    return await AdminProfileService.findAdminWithProfile(adminId);
  });
};

module.exports = AdminProfileService;