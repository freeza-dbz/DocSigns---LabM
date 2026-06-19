import nodemailer from 'nodemailer';
import dns from 'dns';


const createTransporter = (cleanPass) => {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: cleanPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false
        },
        dnsLookup: (hostname, options, callback) => {
            dns.lookup(hostname, { ...options, family: 4 }, callback);
        }
    });
};

const mailSender = async (email, title, body) => {
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
        console.log(`  MAIL_HOST  : ${process.env.MAIL_HOST || '(not set)'}`);
        console.log(`  MAIL_USER  : ${process.env.MAIL_USER || '(not set)'}`);
        console.log(`  MAIL_PASS  : ${process.env.MAIL_PASS ? '(set, length=' + process.env.MAIL_PASS.length + ')' : '(not set)'}`);
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