// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,       // e.g. support@yourdomain.com
    pass: process.env.SMTP_PASSWORD,   // your GoDaddy email password
  },
  tls: {
    ciphers: "SSLv3",
  },
});

module.exports = transporter;