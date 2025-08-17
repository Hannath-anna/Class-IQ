const User = require("../models/auth.model");
const sendOtpEmail = require("../services/email.service.ts");
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.sendOtp = (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const userData = new User({
        fullname: req.body.fullname, 
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        course: req.body.course,
        isVerified: false,
        otp: otp,
        otpExpiresAt: otpExpiresAt,
        isBlocked: false,
        isApproved: false
    });    

    User.create(userData, (err, data) => {
        // Handle database errors immediately
        if (err) {
            if (err.kind === "duplicate_entry") {
                return res.status(409).send({ message: err.message });
            }
            // Handle any other potential database errors
            return res.status(500).send({
                message: err.message || "An error occurred while setting up your account."
            });
        }

        // Only if the database operation was successful, send the OTP email.
        sendOtpEmail(req.body.email, otp).then(emailSent => {
            if (!emailSent) {
                // The user is in the DB, but we couldn't email them. Let them know.
                return res.status(500).send({ message: "Your account is ready, but we failed to send the verification email. Please try again later." });
            }
            
            // If both DB and email are successful, send the final success response.
            res.status(200).send({ userData, message: "OTP has been sent to your email. Please check your inbox." });
        });
    });
};
 
exports.verifyOtpAndSignup = (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).send({ message: "Email and OTP are required." });
    }

    User.verifyOtp(email, otp, (err, data) => {
        if (err) {
            // Handle specific errors from the model
            if (err.kind === "not_found") {
                return res.status(404).send({ message: err.message });
            }
            if (err.kind === "otp_expired") {
                return res.status(404).send({ message: err.message });
            }
            if (err.kind === "invalid_otp") {
                return res.status(400).send({ message: err.message });
            }
            // Handle generic database errors
            return res.status(500).send({
                message: err.message || "An error occurred during verification."
            });
        }

        // If everything is successful, send back a success response
        res.status(200).send({
            message: "Account verified successfully!",
            user: data
        });
    });
};  

exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    User.login(email, password, (err, data) => {
        if (err) {
            // Handle specific errors from the model with a 401 Unauthorized status
            if (err.kind === "not_found" || err.kind === "invalid_credentials" || err.kind === "not_verified" || err.kind === "blocked") {
                return res.status(401).send({ message: err.message });
            }
            // Handle generic server errors
            return res.status(500).send({ message: "An error occurred during login." });
        }

        // User is authenticated, create a JWT
        const payload = { id: data.id, email: data.email, fullname: data.fullname };
        const token = jwt.sign(
            payload,
            config.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.status(200).send({
            message: "Logged in successfully!",
            token: token,
        });
    });
};

exports.forgotPasswordRequest = (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    User.setResetOtp(email, otp, otpExpiresAt, (err, data) => {
        if (err || !data) {
            console.error("Forgot Password Error:", err);
            return res.status(200).send({ message: "If an account with that email exists, an OTP has been sent." });
        }
        
        sendOtpEmail(email, otp).then(emailSent => {
            if (!emailSent) {
                return res.status(500).send({ message: "Your account is ready, but we failed to send the verification email. Please try again later." });
            }
            
            // If both DB and email are successful, send the final success response.
            res.status(200).send({ message: "If an account with that email exists, an OTP has been sent." });
        }).catch(err => {
            console.error("Email sending error:", err);
            res.status(500).send({ message: "Failed to send OTP email." });
        });
    });
};

exports.resetPassword = (req, res) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return res.status(400).send({ message: "Email, OTP, and a new password are required." });
    }

    User.resetPasswordWithOtp(email, otp, password, (err, data) => {
        if (err) {
            if (err.kind === "expired_or_invalid" || err.kind === "invalid_otp") {
                return res.status(400).send({ message: err.message });
            }
            return res.status(500).send({ message: "An error occurred while resetting the password." });
        }
        res.status(200).send(data);
    });
};

exports.getAllUsers = (req, res) => {
    User.getAll((err, data) => {
        if (err) {
            return res.status(500).send({ message: "An error occurred while retrieving users." });
        }
        res.status(200).send(data);
    });
};