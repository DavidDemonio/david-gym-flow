
import nodemailer from 'nodemailer';
import { createLogger } from './logger.js';

const logger = createLogger('email');

async function testEmailConnection(config) {
  try {
    // Create transporter
    logger.info(`Testing SMTP connection to ${config.smtpHost}:${config.smtpPort}`);
    
    // Handle secure connection settings
    const secureType = (config.secureType || 'TLS').toUpperCase();
    const useSecure = config.secure === 'true' || config.secure === true;
    
    logger.info(`Email secure: ${useSecure}, type: ${secureType}`);
    
    const transporter = createTransporter(config);
    
    // Verify connection
    await transporter.verify();
    
    logger.info(`SMTP connection test successful for ${config.smtpUser}@${config.smtpHost}:${config.smtpPort}`);
    return { 
      success: true,
      message: `Conexión exitosa a ${config.smtpHost}:${config.smtpPort}`
    };
  } catch (error) {
    logger.error('SMTP connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      message: `Error al conectar: ${error.message}`,
      details: {
        host: config.smtpHost,
        port: config.smtpPort,
        user: config.smtpUser,
        secure: config.secure,
        secureType: config.secureType
      }
    };
  }
}

async function sendEmail(config, to, subject, body) {
  try {
    // Create transporter
    logger.info(`Sending email to ${to} via ${config.smtpHost}:${config.smtpPort}`);
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
    return { 
      success: true, 
      messageId: info.messageId,
      message: `Correo enviado exitosamente a ${to}`
    };
  } catch (error) {
    logger.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message,
      message: `Error al enviar: ${error.message}`
    };
  }
}

function createTransporter(config) {
  // Convert string 'true'/'false' to boolean if needed
  const secure = config.secure === 'true' || config.secure === true;
  const secureType = (config.secureType || 'TLS').toUpperCase();
  const isZoho = config.smtpHost && config.smtpHost.toLowerCase().includes('zoho');
  
  let transporterOptions = {
    host: config.smtpHost,
    port: parseInt(config.smtpPort || '587'),
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword
    },
    debug: true, // Enable debug output
    logger: true  // Log information to the console
  };
  
  // Especialización para Zoho Mail
  if (isZoho) {
    logger.info('Zoho Mail detected, using specialized configuration');
    transporterOptions.secure = false; // Para Zoho con puerto 587, debemos configurar secure:false
    transporterOptions.tls = {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    };
  } else if (secure) {
    if (secureType === 'SSL') {
      // SSL configuration (legacy)
      transporterOptions.secure = false;
      transporterOptions.tls = {
        rejectUnauthorized: false
      };
      transporterOptions.secureConnection = true;
    } else {
      // TLS configuration (modern)
      transporterOptions.secure = true;
      transporterOptions.tls = {
        rejectUnauthorized: false
      };
    }
  } else {
    // Non-secure configuration
    transporterOptions.secure = false;
    transporterOptions.tls = {
      rejectUnauthorized: false
    };
  }
  
  logger.info(`Creating email transporter with options: ${JSON.stringify({
    host: transporterOptions.host,
    port: transporterOptions.port,
    secure: transporterOptions.secure,
    secureConnection: transporterOptions.secureConnection,
    user: transporterOptions.auth.user,
    tls: transporterOptions.tls
  })}`);
  
  // Create transporter
  return nodemailer.createTransport(transporterOptions);
}

export { testEmailConnection, sendEmail };
