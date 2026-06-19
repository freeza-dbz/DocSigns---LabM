import nodemailer from 'nodemailer';
import dns from 'dns';

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
        
        // Determine port and secure setting
        // Port 465 -> secure: true (SSL) — more reliable on cloud/Render
        // Port 587 -> secure: false (STARTTLS)
        const port = process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 465;
        const isSecure = process.env.MAIL_SECURE === 'true' || port === 465;

        const transporterConfig = {
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port,
            secure: isSecure,
            auth: {
                user: process.env.MAIL_USER,
                pass: cleanPass,
            },
            // Connection timeout settings to avoid hanging on Render/cloud envs
            connectionTimeout: 10000,  // 10 seconds
            greetingTimeout: 10000,    // 10 seconds
            socketTimeout: 15000,      // 15 seconds
            tls: {
                rejectUnauthorized: false // Bypass SSL/TLS errors in cloud containers
            },
            // Force IPv4 to avoid ENETUNREACH on Render (IPv6 is often blocked)
            dnsLookup: (hostname, options, callback) => {
                dns.lookup(hostname, { ...options, family: 4 }, callback);
            }
        };

        const transporter = nodemailer.createTransport(transporterConfig);

        // Verify SMTP connection before sending (helps catch config issues early)
        await transporter.verify();
        console.log("✅ [SMTP CONNECTION VERIFIED]");

        const mailOptions = {
            from: process.env.MAIL_FROM || `DocSigns <${process.env.MAIL_USER}>`,
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