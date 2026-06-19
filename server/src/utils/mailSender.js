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
    console.log(`📧 [SENDING EMAIL] To: ${email}`);
    console.log(`Subject: ${title}`);
    if (links.length > 0) {
        console.log(`Links found:`);
        links.forEach(link => console.log(`  🔗 ${link}`));
    }
    
    if (!hasSmtpConfig) {
        console.log("\n⚠️  WARNING: SMTP credentials (MAIL_HOST, MAIL_USER, MAIL_PASS) are not configured in your environment.");
        console.log("Real emails cannot be delivered. Use the link(s) above in your browser to sign/view the document.");
        console.log("==================================================\n");
        // Return a mock response so the calling controller can proceed smoothly
        return { messageId: "mocked-email-id-" + Date.now() };
    }

    try {
        const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';
        const transporterConfig = {
            auth: {
                user: process.env.MAIL_USER,
                pass: cleanPass,
            }
        };

        if (process.env.MAIL_HOST && process.env.MAIL_HOST.includes('gmail.com')) {
            transporterConfig.service = 'gmail';
        } else {
            transporterConfig.host = process.env.MAIL_HOST;
            transporterConfig.port = process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587;
            transporterConfig.secure = process.env.MAIL_SECURE === 'true';
            transporterConfig.tls = {
                rejectUnauthorized: false
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        const mailOptions = {
            from: process.env.MAIL_FROM || 'DocSigns <no-reply@docsigns.com>',
            to: email,
            subject: title,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [EMAIL SENT SUCCESSFULLY] Message ID: ${info.messageId}`);
        console.log("==================================================\n");
        return info;
    } catch (error) {
        console.error(`❌ [EMAIL SENDING FAILED] Error: ${error.message}`);
        console.log("==================================================\n");
        // Not throwing an error to avoid crashing the main process
    }
};

export { mailSender };