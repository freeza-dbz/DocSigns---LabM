import nodemailer from 'nodemailer';

const mailSender = async (email, title, body) => {
    // Check if SMTP environment variables are defined
    const hasSmtpConfig = process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS;
    
    // Extract any links from the email body for easy debugging/clicking in local dev
    const links = [];
    const hrefRegex = /href="([^"]+)"/g;
    let match;
    while ((match = hrefRegex.exec(body)) !== null) {
        links.push(match[1]);
    }

    console.log("\n==================================================");
    console.log(`📧 [EMAIL SENT] To: ${email}`);
    console.log(`Subject: ${title}`);
    if (links.length > 0) {
        console.log(`Links found:`);
        links.forEach(link => console.log(`  🔗 ${link}`));
    }
    
    if (!hasSmtpConfig) {
        console.log("\n⚠️  WARNING: SMTP credentials (MAIL_HOST, MAIL_USER, MAIL_PASS) are not configured in your server/.env file.");
        console.log("Real emails cannot be delivered. Use the link(s) above in your browser to sign/view the document.");
        console.log("==================================================\n");
        // Return a mock response so the calling controller can proceed smoothly
        return { messageId: "mocked-email-id-" + Date.now() };
    }
    console.log("==================================================\n");

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.MAIL_FROM || 'DocSigns <no-reply@docsigns.com>',
            to: email,
            subject: title,
            html: body,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email via SMTP: ", error.message);
        // Not throwing an error to avoid crashing the main process (e.g., signature request)
    }
};

export { mailSender };