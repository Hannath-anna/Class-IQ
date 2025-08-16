const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.MAIL, 
        pass: config.MAIL_PASSWORD
    }
});

const sendOtpEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: `ClassIQ <${config.MAIL}>`,
        to: toEmail,
        subject: 'Your Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #333; line-height: 1.6;">
                <h2 style="color: #0056b3;">Email Verification Required</h2>
                <p>Thank you for starting the registration process. Please use the following code to verify your account.</p>
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 5px; background-color: #f2f2f2; padding: 15px 20px; border-radius: 8px; display: inline-block;">
                    ${otp}
                </p>
                <p>This code is valid for 10 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = sendOtpEmail;