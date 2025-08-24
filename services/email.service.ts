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

const sendApprovalEmail = async (toEmail, studentName) => {
    // A friendly default if the name isn't provided
    const recipientName = studentName || 'Student';

    const mailOptions = {
        from: `ClassIQ <${config.MAIL}>`, // Your application's name and email
        to: toEmail,
        subject: 'Welcome to ClassIQ! Your Account has been Approved',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #28a745; text-align: center;">Account Approved!</h2>
                <p>Hello ${recipientName},</p>
                <p>We are thrilled to let you know that your account on <strong>ClassIQ</strong> has been reviewed and approved by our administration.</p>
                <p>You can now log in and access all the features available to you, including course materials, schedules, and more.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://your-website.com/login" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Login to Your Account
                    </a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Best regards,<br/>The ClassIQ Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Approval email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending approval email:', error);
        return false;
    }
};

module.exports = {sendOtpEmail, sendApprovalEmail};
