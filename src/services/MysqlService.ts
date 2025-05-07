import { envManager } from '../utils/envManager';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface EmailConfig {
  host: string;  // Changed from smtpHost
  port: number;
  user: string;  // Changed from smtpUser
  password: string;  // Changed from smtpPassword
  from: string;  // Changed from fromEmail
  secure: boolean;
  secureType: string;
}

export interface UserAuth {
  email: string;
  password: string;
  name?: string;
  verificationToken?: string;
  verified?: boolean;
}

class MysqlService {
  /**
   * Test a database connection with the provided configuration
   */
  async testConnection(config: DbConfig): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/mysql/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Connection successful' : 'Connection failed') 
      };
    } catch (error) {
      console.error('Error testing MySQL connection:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create necessary tables for routines database
   */
  async initializeRoutinesDb(config: DbConfig): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/mysql/initialize-routines-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // If successful, save configuration to local storage for persistence
      if (result.success) {
        localStorage.setItem('routinesDbConfig', JSON.stringify(config));
      }
      
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Database initialized' : 'Initialization failed') 
      };
    } catch (error) {
      console.error('Error initializing routines database:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Initialize authentication database
   */
  async initializeAuthDb(config: DbConfig): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/mysql/initialize-auth-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // If successful, save configuration to local storage for persistence
      if (result.success) {
        localStorage.setItem('authDbConfig', JSON.stringify(config));
      }
      
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Auth database initialized' : 'Initialization failed') 
      };
    } catch (error) {
      console.error('Error initializing auth database:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Load environment variables from server
   */
  async loadEnvironmentVariables(): Promise<any> {
    try {
      const response = await fetch('/api/env', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.env) {
        // Update local environment manager
        await envManager.setVariables(result.env);
        
        // Store in localStorage for persistence across refreshes
        localStorage.setItem('envVariables', JSON.stringify(result.env));
        
        return result.env;
      } else {
        throw new Error('Could not load environment variables');
      }
    } catch (error) {
      console.error('Error loading environment variables:', error);
      throw error;
    }
  }

  /**
   * Generate PDF routine from routine data
   */
  async generateRoutinePDF(routineData: any): Promise<void> {
    // Use jsPDF directly
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get the HTML element to convert
      const element = document.getElementById('routine-pdf-content');
      if (!element) {
        throw new Error('Could not find element to convert to PDF');
      }

      // Use html2canvas to capture the element
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: true,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm (portrait)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      doc.save(`${routineData.name || 'Routine'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      return;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
  
  /**
   * Save configuration to localStorage for persistence
   */
  saveConfigToLocalStorage(config: DbConfig, configType: 'main' | 'routines' | 'auth' = 'main'): void {
    let key;
    switch(configType) {
      case 'routines':
        key = 'routinesDbConfig';
        break;
      case 'auth':
        key = 'authDbConfig';
        break;
      default:
        key = 'mainDbConfig';
    }
    localStorage.setItem(key, JSON.stringify(config));
  }
  
  /**
   * Get configuration from localStorage
   */
  getConfigFromLocalStorage(configType: 'main' | 'routines' | 'auth'): DbConfig | null {
    let key;
    switch(configType) {
      case 'routines':
        key = 'routinesDbConfig';
        break;
      case 'auth':
        key = 'authDbConfig';
        break;
      default:
        key = 'mainDbConfig';
    }
    
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error(`Error parsing stored ${configType} database config:`, error);
      }
    }
    return null;
  }

  /**
   * Register a new user
   */
  async registerUser(config: DbConfig, userData: UserAuth): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, user: userData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Registration successful' : 'Registration failed') 
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Login user
   */
  async loginUser(config: DbConfig, email: string, password: string): Promise<{success: boolean, message: string, user?: any}> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, email, password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // If login successful, store the user in localStorage
      if (result.success && result.user) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
      }
      
      return { 
        success: result.success,
        user: result.user,
        message: result.message || (result.success ? 'Login successful' : 'Login failed') 
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(config: DbConfig, token: string): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, token }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Email verified' : 'Verification failed') 
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(config: DbConfig, email: string): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/auth/send-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, email }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Reset email sent' : 'Failed to send reset email') 
      };
    } catch (error) {
      console.error('Error sending password reset:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(config: DbConfig, token: string, newPassword: string): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, token, newPassword }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Password reset successful' : 'Password reset failed') 
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get current logged in user from localStorage
   */
  getCurrentUser(): any | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    return null;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Save email config
   */
  async saveEmailConfig(config: EmailConfig): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/email/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // If successful, save configuration to localStorage as well
      if (result.success) {
        localStorage.setItem('emailConfig', JSON.stringify(config));
      }
      
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Email configuration saved' : 'Failed to save email configuration') 
      };
    } catch (error) {
      console.error('Error saving email configuration:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get email config from localStorage
   */
  getEmailConfig(): EmailConfig | null {
    const stored = localStorage.getItem('emailConfig');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored email config:', error);
      }
    }
    return null;
  }

  /**
   * Send email
   */
  async sendEmail(to: string, subject: string, html: string): Promise<{success: boolean, message: string}> {
    try {
      const emailConfig = this.getEmailConfig();
      
      if (!emailConfig) {
        throw new Error('Email configuration not found');
      }
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: emailConfig,
          to,
          subject,
          body: html
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Email sent' : 'Failed to send email') 
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(config: EmailConfig): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Email configuration tested successfully' : 'Email configuration test failed') 
      };
    } catch (error) {
      console.error('Error testing email configuration:', error);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export default new MysqlService();
