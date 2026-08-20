const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using SMTP (can use ethereal for testing or Gmail/SendGrid in production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

/**
 * Send an email alert for evidence uploads or security events
 */
const sendAlertEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: '"ForensicChain Alerts" <alerts@forensicchain.com>',
      to,
      subject,
      html: htmlContent
    });
    console.log(`Alert email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email alert:', error);
    // We don't throw here to avoid breaking the main application flow if email fails
  }
};

module.exports = {
  sendAlertEmail
};
