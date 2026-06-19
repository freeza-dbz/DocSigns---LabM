import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dns from 'dns';

/**
 * mailSender — sends transactional emails.
 *
 * STRATEGY (in order of priority):
 *
 *  1. Resend HTTP API  → set RESEND_API_KEY  (cloud-safe, uses HTTPS/443)
 *  2. Nodemailer SMTP  → set MAIL_HOST/USER/PASS  (local dev only)
 *
 * WHY NOT SMTP ON RENDER:
 *   Render, Railway, Heroku, and most cloud platforms block outbound TCP on
 *   ports 25, 465, and 587 at the network firewall level to prevent spam.
 *   This causes ETIMEDOUT / ENETUNREACH regardless of Nodemailer config.
 *   Resend's HTTP API (port 443) is never blocked.
 *
 * SETUP:
 *   1. Sign up free at https://resend.com
 *   2. Create an API key (API Keys → Create API Key)
 *   3. Add to Render dashboard → Environment:
 *        RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxx
 *        RESEND_FROM    = DocSigns <onboarding@resend.dev>
 */

// ─── Detect if we're running in a cloud/production environment ────────────────
const IS_CLOUD = process.env.RENDER        // Render sets this automatically
    || process.env.RAILWAY_ENVIRONMENT     // Railway
    || process.env.VERCEL                  // Vercel
    || process.env.NODE_ENV === 'production';

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

    console.log(`  Provider : Resend HTTP API`);
    console.log(`  From     : ${fromAddress}`);

    const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: title,
        html: body,
    });

    if (error) {
        console.error(`  Resend error:`, JSON.stringify(error));
        throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
    }

    console.log(`✅ [EMAIL SENT VIA RESEND] ID: ${data.id}`);
    return { messageId: data.id };
};

// ─── Strategy 2: Nodemailer SMTP (local dev only) ────────────────────────────
const sendViaSmtp = async (email, title, body) => {
    dns.setDefaultResultOrder('ipv4first');
    const cleanPass = process.env.MAIL_PASS.replace(/\s+/g, '');

    console.log(`  Provider : Nodemailer SMTP`);
    console.log(`  Host     : ${process.env.MAIL_HOST || 'smtp.gmail.com'}`);
    console.log(`  Port     : 465 (SSL)`);
    console.log(`  User     : ${process.env.MAIL_USER}`);
    console.log(`  Pass len : ${cleanPass.length} chars (expected 16 for Gmail App Password)`);

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
        // Force IPv4 — 'connectionOptions.family' is silently ignored by Nodemailer
        dnsLookup: (hostname, options, callback) => {
            dns.lookup(hostname, { ...options, family: 4 }, callback);
        }
    });

    await transporter.verify();
    console.log('✅ [SMTP VERIFIED]');

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

    // ── No provider configured ────────────────────────────────────────────────
    if (!hasResend && !hasSmtp) {
        console.log('\n⚠️  WARNING: No email provider configured.');
        console.log('   Render/cloud: Set RESEND_API_KEY in your Render dashboard.');
        console.log('   Local dev   : Set MAIL_HOST, MAIL_USER, MAIL_PASS in .env');
        console.log('   Sign link above works in browser even without email.');
        console.log('==================================================\n');
        return { messageId: 'mocked-email-id-' + Date.now() };
    }

    // ── SMTP requested but running on cloud — refuse early ───────────────────
    if (!hasResend && hasSmtp && IS_CLOUD) {
        console.error('❌ [EMAIL SKIPPED] Running on cloud (Render/Railway/Vercel) without RESEND_API_KEY.');
        console.error('   SMTP is blocked by the cloud firewall on ports 25/465/587.');
        console.error('   ACTION REQUIRED: Add RESEND_API_KEY to your Render environment variables.');
        console.error('   Get a free API key at https://resend.com (3,000 emails/month free).');
        console.log('==================================================\n');
        return { messageId: 'skipped-smtp-blocked-' + Date.now() };
    }

    try {
        if (hasResend) {
            const result = await sendViaResend(email, title, body);
            console.log('==================================================\n');
            return result;
        }

        // Local dev SMTP fallback
        const result = await sendViaSmtp(email, title, body);
        console.log('==================================================\n');
        return result;

    } catch (error) {
        console.error('❌ [EMAIL SENDING FAILED]');
        console.error(`   Message  : ${error.message}`);
        console.error(`   Code     : ${error.code || 'N/A'}`);
        console.error(`   Response : ${error.response || 'N/A'}`);
        console.error(`   Full err : ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        if (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
            console.error('');
            console.error('   ⚠️  SMTP is being blocked by the cloud firewall.');
            console.error('   Fix: Add RESEND_API_KEY to Render environment variables.');
            console.error('   Get it free at https://resend.com');
        }
        console.log('==================================================\n');
        // Do not throw — signature request is saved; email is best-effort
    }
};

export { mailSender };