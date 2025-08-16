const User = require("../models/auth.model");
const sendOtpEmail = require("../services/email.service.ts");
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.sendOtp = (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = new User({
        fullname: req.body.fullname, 
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        course: req.body.course,
        isVerified: false,
        otp: otp,
        isBlocked: false
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