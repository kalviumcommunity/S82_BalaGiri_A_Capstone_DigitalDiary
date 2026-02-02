const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email', // Replace with valid Ethereal credentials if needed, or environment variables
        pass: 'ethereal.pass'
    }
});

// For development/demo, we will use a test account if env vars are not set
const getTransporter = async () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail', // or configured host
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Default to Ethereal for testing if no env provided
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
        console.log("Magic Link (Simulated):", link);
        return;
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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
