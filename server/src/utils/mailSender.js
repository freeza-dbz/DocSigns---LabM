import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dns from 'dns';

/**
 * mailSender — sends transactional emails via:
 *
 * 1. Resend HTTP API  (primary — works on Render/Vercel/any cloud host)
 *    Requires: RESEND_API_KEY env var
 *    → Uses HTTPS port 443, never blocked by cloud firewalls
 *
 * 2. Nodemailer SMTP  (local dev fallback — when RESEND_API_KEY is absent)
 *    Requires: MAIL_HOST, MAIL_USER, MAIL_PASS env vars
 *    → Blocked by Render's firewall; only works locally
 *
 * WHY: Render (and most cloud platforms) block outbound SMTP ports 25/465/587
 * at the network level to prevent spam. SMTP causes ETIMEDOUT on Render.
 * Resend uses HTTPS (port 443) which is never blocked.
 */

// ─── Helper: extract links for dev logging ────────────────────────────────────
const extractLinks = (html) => {
    const links = [];
    const hrefRegex = /href="([^"]+)"/g;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) links.push(match[1]);
    return links;
};

// ─── Strategy 1: Resend HTTP API ─────────────────────────────────────────────
const sendViaResend = async (email, title, body) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.RESEND_FROM || 'DocSigns <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: title,
        html: body,
    });

    if (error) {
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    console.log(`✅ [EMAIL SENT VIA RESEND] ID: ${data.id}`);
    return { messageId: data.id };
};

// ─── Strategy 2: Nodemailer SMTP (local dev only) ────────────────────────────
const sendViaSmtp = async (email, title, body) => {
    dns.setDefaultResultOrder('ipv4first');
    const cleanPass = process.env.MAIL_PASS.replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
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
        tls: { rejectUnauthorized: false },
        // Force IPv4 DNS — fixes ENETUNREACH; connectionOptions.family is silently ignored by Nodemailer
        dnsLookup: (hostname, options, callback) => {
            dns.lookup(hostname, { ...options, family: 4 }, callback);
        }
    });

    await transporter.verify();
    console.log('✅ [SMTP CONNECTION VERIFIED]');

    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || `DocSigns <${process.env.MAIL_USER}>`,
        to: email,
        subject: title,
        html: body,
    });

    console.log(`✅ [EMAIL SENT VIA SMTP] Message ID: ${info.messageId}`);
    return info;
};

// ─── Main exported function ───────────────────────────────────────────────────
const mailSender = async (email, title, body) => {
    const links = extractLinks(body);

    console.log('\n==================================================');
    console.log(`📧 [SENDING EMAIL] To: ${email}`);
    console.log(`Subject: ${title}`);
    if (links.length > 0) {
        console.log('Links found:');
        links.forEach(link => console.log(`  🔗 ${link}`));
    }

    const hasResend = !!process.env.RESEND_API_KEY;
    const hasSmtp   = !!(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS);

    if (!hasResend && !hasSmtp) {
        console.log('\n⚠️  WARNING: No email provider configured.');
        console.log('   Set RESEND_API_KEY (recommended for cloud) or MAIL_* vars (local dev).');
        console.log('   Use the sign link above in your browser to test signing.');
        console.log('==================================================\n');
        return { messageId: 'mocked-email-id-' + Date.now() };
    }

    try {
        if (hasResend) {
            console.log(`  Provider : Resend HTTP API`);
            console.log(`  From     : ${process.env.RESEND_FROM || 'DocSigns <onboarding@resend.dev>'}`);
            const result = await sendViaResend(email, title, body);
            console.log('==================================================\n');
            return result;
        }

        // SMTP fallback (local dev only — blocked on Render/cloud)
        console.log(`  Provider : Nodemailer SMTP (local dev fallback)`);
        console.log(`  MAIL_HOST: ${process.env.MAIL_HOST}`);
        console.log(`  MAIL_USER: ${process.env.MAIL_USER}`);
        console.log(`  MAIL_PASS: (length=${process.env.MAIL_PASS.replace(/\s+/g,'').length})`);
        const result = await sendViaSmtp(email, title, body);
        console.log('==================================================\n');
        return result;

    } catch (error) {
        console.error('❌ [EMAIL SENDING FAILED]');
        console.error(`   Message : ${error.message}`);
        console.error(`   Code    : ${error.code || 'N/A'}`);
        console.error(`   Full err: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        console.log('==================================================\n');
        // Do not throw — signature request is already saved; email is best-effort
    }
};

export { mailSender };