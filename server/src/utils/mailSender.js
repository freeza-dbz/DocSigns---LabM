import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
    try {
        // Ensure you have these environment variables set up
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        const mailOptions = {
            from: 'DocSigns <no-reply@docsigns.com>',
            to: email,
            subject: title,
            html: body,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email: ", error.message);
        // Not throwing an error to avoid crashing the main process (e.g., signature request)
    }
};

export { mailSender };