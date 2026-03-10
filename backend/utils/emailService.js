const nodemailer = require('nodemailer');

const getTransporter = async () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log(`[Email Service] Using configured SMTP (User: ${process.env.EMAIL_USER}, Service: ${process.env.EMAIL_SERVICE || 'gmail'})`);
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    try {
        console.log("[Email Service] No EMAIL_USER/EMAIL_PASS provided. Falling back to Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        console.log("[Email Service] Ethereal account created successfully.");
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
        console.error("[Email Service] Failed to create Ethereal test account:", err.message);
        return null;
    }
};

exports.sendMagicLinkEmail = async (email, link) => {
    try {
        const transporter = await getTransporter();

        if (!transporter) {
            throw new Error("Email Configuration Error: Unable to create transport (Check EMAIL_USER/EMAIL_PASS). Ethereal fallback might be blocked on the hosting environment.");
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

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Magic link email sent to ${email}`);

        // If using ethereal email, log the preview URL specifically
        if (info.messageId && !process.env.EMAIL_USER) {
            console.log("[Email Service] Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (err) {
        console.error("[Email Service] sendMail error:", err.message);
        throw new Error(err.message || 'Error occurred while sending email.');
    }
};
