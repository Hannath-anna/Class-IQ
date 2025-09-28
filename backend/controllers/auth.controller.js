const User = require("../services/auth.service.js");
const { sendOtpEmail } = require("../services/email.service.ts");
const jwt = require('jsonwebtoken');
const config = require('../config');

// Send OTP and create user
exports.sendOtp = async (req, res) => {
    try {
        const { fullname, email, phone, password, courseId } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const userData = { fullname, email, phone, password, courseId, otp, otpExpiresAt };

        await new Promise((resolve, reject) => {
            User.create(userData, (err, data) => err ? reject(err) : resolve(data));
        });

        const emailSent = await sendOtpEmail(email, otp);
        if (!emailSent) return res.status(500).json({ message: "OTP email failed. Try again later." });

        res.status(200).json({ message: "OTP sent to your email." });

    } catch (error) {
        if (error.kind === "duplicate_entry") return res.status(409).json({ message: error.message });
        res.status(500).json({ message: error.message || "Error creating user." });
    }
};

// Verify OTP
exports.verifyOtpAndSignup = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

        const user = await new Promise((resolve, reject) => {
            User.verifyOtp(email, otp, (err, data) => err ? reject(err) : resolve(data));
        });

        res.status(200).json({ message: "Account verified successfully!", user });

    } catch (error) {
        if (error.kind === "not_found" || error.kind === "otp_expired" || error.kind === "invalid_otp") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Error during verification." });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

        const user = await new Promise((resolve, reject) => {
            User.login(email, password, (err, data) => err ? reject(err) : resolve(data));
        });

        const token = jwt.sign({ id: user.id, email: user.email, fullname: user.fullname }, config.JWT_SECRET, { expiresIn: '4h' });

        res.status(200).json({
            message: "Logged in successfully!",
            token,
            studentId: user.id,
            role: "student",
            roleId: 3
        });

    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// Forgot password request
exports.forgotPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required." });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await new Promise((resolve, reject) => {
            User.setResetOtp(email, otp, otpExpiresAt, (err, data) => err ? reject(err) : resolve(data));
        });

        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });

    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP email." });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) return res.status(400).json({ message: "Email, OTP, and new password are required." });

        const result = await new Promise((resolve, reject) => {
            User.resetPasswordWithOtp(email, otp, password, (err, data) => err ? reject(err) : resolve(data));
        });

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};