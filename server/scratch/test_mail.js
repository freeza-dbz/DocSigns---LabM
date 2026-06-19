import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply the global DNS resolution preference (IPv4 first)
dns.setDefaultResultOrder('ipv4first');

// Load environment variables from the project root .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function main() {
  const recipientEmail = 'anmol2006.chauhan@gmail.com';
  const title = 'DocSigns - Live SMTP Verification Test';
  const body = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;">
      <h2 style="color: #2563eb;">DocSigns Verification</h2>
      <p>Hello,</p>
      <p>This is a live test email sent to verify that the SMTP configuration for <strong>DocSigns</strong> is fully operational.</p>
      <p>If you received this email, the connection, TLS authentication, and IPv4 DNS settings are working perfectly!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <small style="color: #666;">DocSigns Testing Suite</small>
    </div>
  `;

  console.log('--- Starting SMTP Delivery Test ---');
  console.log('Host:', process.env.MAIL_HOST);
  console.log('Port:', process.env.MAIL_PORT);
  console.log('Sender (From):', process.env.MAIL_FROM);
  console.log('Recipient (To):', recipientEmail);

  const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';

  const transporterConfig = {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport(transporterConfig);

    console.log('Verifying SMTP connection settings...');
    await transporter.verify();
    console.log('✅ SMTP Handshake successful!');

    console.log('Sending email...');
    const mailOptions = {
      from: process.env.MAIL_FROM || 'DocSigns <no-reply@docsigns.com>',
      to: recipientEmail,
      subject: title,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);

  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
  }
}

main();
