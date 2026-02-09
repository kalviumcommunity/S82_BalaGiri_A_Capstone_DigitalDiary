const nodemailer = require('nodemailer');

// Helper to get transporter based on environment
const getTransporter = async () => {
    // 1. Use Gmail/SMTP if configured in ENV (Preferred for Production/Real usage)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // 2. Fallback to Ethereal for development only if no env provided
    console.warn("No EMAIL_USER/EMAIL_PASS in .env. Attempting to use Ethereal (Test Account)...");
    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (err) {
        console.error("Failed to create test account", err);
        return null;
    }
};


exports.sendMagicLinkEmail = async (email, link) => {

    const transporter = await getTransporter();

    if (!transporter) {
        throw new Error("Email Configuration Error: Unable to create transport. Check server logs/env variables.");
    }

    const mailOptions = {
        from: '"Digital Diary" <no-reply@digitaldiary.com>',
        to: email,
        subject: 'Your Magic Login Link',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Digital Diary</h2>
        <p>Click the button below to log in. This link expires in 15 minutes.</p>
        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a>
        <p>Or copy this link: ${link}</p>
      </div>
    `
    };

    // Let errors bubble up to the controller
    const info = await transporter.sendMail(mailOptions);

    return info;
};
