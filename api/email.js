
const nodemailer = require('nodemailer');
const { createLogger } = require('./logger');

const logger = createLogger('email');

async function testEmailConnection(config) {
  try {
    // Create transporter
    const transporter = createTransporter(config);
    
    // Verify connection
    await transporter.verify();
    
    logger.info(`SMTP connection test successful for ${config.smtpUser}@${config.smtpHost}:${config.smtpPort}`);
    return { success: true };
  } catch (error) {
    logger.error('SMTP connection test failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmail(config, to, subject, body) {
  try {
    // Create transporter
    const transporter = createTransporter(config);
    
    // Setup email data
    const mailOptions = {
      from: `"GymFlow App" <${config.fromEmail}>`,
      to: to,
      subject: subject,
      text: body,
      // Could also include HTML version
      html: body.replace(/\n/g, '<br>')
    };
    
    // Send mail
    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent to ${to}, message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

function createTransporter(config) {
  // Determine security settings
  let secure = false;
  let secureConnection = false;
  let tls = {};
  
  if (config.secure) {
    if (config.secureType === 'SSL') {
      secureConnection = true;
      tls = {
        rejectUnauthorized: true
      };
    } else { // TLS
      secure = true;
    }
  }
  
  // Create transporter
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: secure, // true for 465, false for other ports
    secureConnection: secureConnection, // SSL
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword
    },
    tls: tls
  });
}

module.exports = {
  testEmailConnection,
  sendEmail
};
