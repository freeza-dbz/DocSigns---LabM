import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const email = process.env.MAIL_USER || 'chauhan.anmolsingh25@gmail.com';
  const title = 'Test Email from DocSigns';
  const body = '<p>This is a test email sent from the debug script.</p>';

  console.log('Using SMTP Configuration:');
  console.log('Host:', process.env.MAIL_HOST);
  console.log('Port:', process.env.MAIL_PORT);
  console.log('User:', process.env.MAIL_USER);
  console.log('Secure:', process.env.MAIL_SECURE);
  console.log('Raw Password:', process.env.MAIL_PASS);

  const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';
  console.log('Cleaned Password:', cleanPass);

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

  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport(transporterConfig);

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully!');

    console.log('Sending test email...');
    const mailOptions = {
      from: process.env.MAIL_FROM || 'DocSigns <no-reply@docsigns.com>',
      to: email,
      subject: title,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. Message ID:', info.messageId);

  } catch (error) {
    console.error('SMTP Error:', error);
  }
}

main();
