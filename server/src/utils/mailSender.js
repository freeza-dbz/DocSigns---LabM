import nodemailer from 'nodemailer';
import dns from 'dns';

/**
 * Creates a Nodemailer transporter configured for cloud environments (Render, etc.)
 * - Forces IPv4 via dnsLookup (avoids ENETUNREACH on IPv6-disabled hosts)
 * - Uses port 465 + SSL by default (more reliable than 587+STARTTLS on cloud)
 * - Adds connection timeouts to prevent hangs
 */
const createTransporter = (cleanPass) => {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: 465,       // SSL — hardcoded; overrides any bad env value
        secure: true,    // SSL — must be true for port 465
        auth: {
            user: process.env.MAIL_USER,
            pass: cleanPass,
        },
        connectionTimeout: 10000,   // 10 s — prevent indefinite hangs
        greetingTimeout: 10000,     // 10 s
        socketTimeout: 15000,       // 15 s
        tls: {
            rejectUnauthorized: false  // Allow self-signed certs in cloud containers
        },
        // Force IPv4 DNS resolution — fixes ENETUNREACH on Render/cloud where
        // IPv6 is unreachable. The old `connectionOptions: { family: 4 }` was
        // silently ignored by Nodemailer; this dnsLookup callback is the correct fix.
        dnsLookup: (hostname, options, callback) => {
            dns.lookup(hostname, { ...options, family: 4 }, callback);
        }
    });
};

const mailSender = async (email, title, body) => {
    // Check if SMTP environment variables are defined
    const hasSmtpConfig = process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS;

    // Extract links from the email body for dev debugging
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
        console.log("\n⚠️  WARNING: SMTP env vars missing.");
        console.log(`  MAIL_HOST  : ${process.env.MAIL_HOST  || '(not set)'}`);
        console.log(`  MAIL_USER  : ${process.env.MAIL_USER  || '(not set)'}`);
        console.log(`  MAIL_PASS  : ${process.env.MAIL_PASS  ? '(set, length=' + process.env.MAIL_PASS.length + ')' : '(not set)'}`);
        console.log("Real emails cannot be delivered. Use the sign link above in your browser.");
        console.log("==================================================\n");
        return { messageId: "mocked-email-id-" + Date.now() };
    }

    // Strip whitespace from App Password (Gmail shows it with spaces for readability)
    const cleanPass = process.env.MAIL_PASS.replace(/\s+/g, '');
    console.log(`  MAIL_HOST  : ${process.env.MAIL_HOST}`);
    console.log(`  MAIL_USER  : ${process.env.MAIL_USER}`);
    console.log(`  MAIL_PASS  : (length=${cleanPass.length}, expected 16 for Gmail App Password)`);
    console.log(`  MAIL_FROM  : ${process.env.MAIL_FROM || '(using MAIL_USER)'}`);
    console.log(`  SMTP config: host=smtp.gmail.com port=465 secure=true (IPv4 forced)`);

    try {
        const transporter = createTransporter(cleanPass);

        // Verify SMTP connection & auth before attempting to send
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
        console.error(`❌ [EMAIL SENDING FAILED]`);
        console.error(`   Message : ${error.message}`);
        console.error(`   Code    : ${error.code || 'N/A'}`);
        console.error(`   Response: ${error.response || 'N/A'}`);
        console.error(`   Full err: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        console.log("==================================================\n");
        // Do not throw — let the controller continue (signature request is already saved)
    }
};

export { mailSender };