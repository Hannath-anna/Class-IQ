const User = require("../models/auth.model");
const {sendApprovalEmail} = require("../services/email.service.ts");

exports.getAllUsers = (req, res) => {
    User.getAll((err, data) => {
        if (err) {
            return res.status(500).send({ message: "An error occurred while retrieving users." });
        }
        res.status(200).send(data);
    });
};

exports.blockUser = (req, res) => {
    const id = req.query.id; 
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
        return res.status(400).send({ message: "The 'isBlocked' field must be a boolean." });
    }
    if (!id) {
        return res.status(400).send({ message: "User ID must be provided." });
    }

    // Call the model function with the validated data
    User.setBlockStatus(id, isBlocked, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({ message: `User with id ${id} not found.` });
            }
            return res.status(500).send({ message: "Error updating user block status." });
        }

        // Send a clear success message back to the admin frontend
        const action = isBlocked ? 'unblocked' : 'blocked';
        res.send({ message: `User was successfully ${action}.` });
    });
};

exports.approveStudent = (req, res) => {
    const userId = req.query.id;
    if (!userId) {
        return res.status(400).send({ message: "User ID is required." });
    }

    User.findById(userId, (err, user) => {
        if (err || !user) {
            return res.status(404).send({ message: `User with id ${userId} not found.` });
        }
        
        // Now, approve the user
        User.setApprovalStatus(userId, true, async (approveErr, data) => {
            if (approveErr) {
                return res.status(500).send({ message: "Error approving user." });
            }

            await sendApprovalEmail(user.email, user.fullname);

            res.send({data, message: `User was successfully approved.` });
        });
    });
};