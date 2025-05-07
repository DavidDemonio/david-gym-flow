
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { createLogger } from './logger.js';
import { sendEmail } from './email.js';

const logger = createLogger('auth');
const SALT_ROUNDS = 10;

// Initialize auth database
export async function initializeAuthDb(config) {
  try {
    // Create a connection to the auth database
    const authConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    logger.info(`Connected to auth database: ${config.database}@${config.host}:${config.port}`);
    
    // Create users table
    await authConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        verification_token VARCHAR(64),
        verified BOOLEAN DEFAULT false,
        reset_token VARCHAR(64),
        reset_token_expiry DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Ensured users table exists in auth database');
    
    // Close the auth connection
    await authConnection.end();
    
    return { success: true, message: 'Auth database initialized successfully' };
  } catch (error) {
    logger.error('Error initializing auth database:', error);
    return { success: false, error: error.message };
  }
}

// Register a new user
export async function registerUser(config, userData) {
  try {
    // Connect to auth database
    const authConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Check if user with this email already exists
    const [existingUsers] = await authConnection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );
    
    if (existingUsers.length > 0) {
      await authConnection.end();
      return { success: false, message: 'User with this email already exists' };
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    
    // Insert new user
    await authConnection.execute(
      'INSERT INTO users (email, password, name, verification_token) VALUES (?, ?, ?, ?)',
      [userData.email, hashedPassword, userData.name || '', verificationToken]
    );
    
    // Close connection
    await authConnection.end();
    
    // Send verification email
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/login?verify=${verificationToken}`;
    const emailHtml = `
      <h2>Welcome to GymFlow!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If you didn't register for GymFlow, please ignore this email.</p>
    `;
    
    try {
      await sendEmail({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.FROM_EMAIL,
        secure: process.env.SMTP_SECURE === 'true',
        secureType: process.env.SMTP_SECURE_TYPE
      }, userData.email, 'Verify your GymFlow account', emailHtml);
      
      logger.info(`Verification email sent to ${userData.email}`);
    } catch (emailError) {
      logger.error('Error sending verification email:', emailError);
      // Continue even if email fails
    }
    
    return { 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account.' 
    };
  } catch (error) {
    logger.error('Error registering user:', error);
    return { success: false, message: error.message };
  }
}

// Verify email
export async function verifyEmail(config, token) {
  try {
    // Connect to auth database
    const authConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Find user by verification token
    const [users] = await authConnection.execute(
      'SELECT id FROM users WHERE verification_token = ?',
      [token]
    );
    
    if (users.length === 0) {
      await authConnection.end();
      return { success: false, message: 'Invalid verification token' };
    }
    
    // Update user to verified
    await authConnection.execute(
      'UPDATE users SET verified = true, verification_token = NULL WHERE id = ?',
      [users[0].id]
    );
    
    // Close connection
    await authConnection.end();
    
    return { 
      success: true, 
      message: 'Email verified successfully! You can now log in.' 
    };
  } catch (error) {
    logger.error('Error verifying email:', error);
    return { success: false, message: error.message };
  }
}

// Login user
export async function loginUser(config, email, password) {
  try {
    // Connect to auth database
    const authConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Find user by email
    const [users] = await authConnection.execute(
      'SELECT id, email, password, name, verified FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      await authConnection.end();
      return { success: false, message: 'Invalid email or password' };
    }
    
    const user = users[0];
    
    // Check if email is verified
    if (!user.verified) {
      await authConnection.end();
      return { success: false, message: 'Please verify your email before logging in' };
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      await authConnection.end();
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Close connection
    await authConnection.end();
    
    // Return user info (excluding password)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    return { 
      success: true, 
      message: 'Login successful', 
      user: userInfo 
    };
  } catch (error) {
    logger.error('Error logging in:', error);
    return { success: false, message: error.message };
  }
}

// Send password reset
export async function sendPasswordReset(config, email) {
  try {
    // Connect to auth database
    const authConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Find user by email
    const [users] = await authConnection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      await authConnection.end();
      // Don't reveal if user exists for security reasons
      return { success: true, message: 'If your email is registered, you will receive reset instructions' };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // Token valid for 1 hour
    
    // Update user with reset token
    await authConnection.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetExpiry, users[0].id]
    );
    
    // Close connection
    await authConnection.end();
    
    // Send reset email
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your GymFlow account. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link is valid for 1 hour. If you didn't request a password reset, please ignore this email.</p>
    `;
    
    try {
      await sendEmail({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.FROM_EMAIL,
        secure: process.env.SMTP_SECURE === 'true',
        secureType: process.env.SMTP_SECURE_TYPE
      }, email, 'Reset your GymFlow password', emailHtml);
      
      logger.info(`Password reset email sent to ${email}`);
    } catch (emailError) {
      logger.error('Error sending password reset email:', emailError);
      // Continue even if email fails
    }
    
    return { 
      success: true, 
      message: 'Password reset instructions sent to your email' 
    };
  } catch (error) {
    logger.error('Error sending password reset:', error);
    return { success: false, message: error.message };
  }
}

// Reset password
export async function resetPassword(config, token, newPassword) {
  try {
    // Connect to auth database
    const authConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });
    
    // Find user by reset token and ensure it's not expired
    const [users] = await authConnection.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      await authConnection.end();
      return { success: false, message: 'Invalid or expired reset token' };
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update user password and clear reset token
    await authConnection.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );
    
    // Close connection
    await authConnection.end();
    
    return { 
      success: true, 
      message: 'Password reset successful' 
    };
  } catch (error) {
    logger.error('Error resetting password:', error);
    return { success: false, message: error.message };
  }
}
