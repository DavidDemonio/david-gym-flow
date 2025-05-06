
import { DbConfig, EmailConfig, Equipment, Exercise, Routine, UserProfile } from '../utils/mysqlConnection';

/**
 * Service class for handling MySQL database operations through API endpoints.
 * This provides the actual implementation of backend calls for the mysqlConnection class.
 */
class MysqlService {
  /**
   * Tests the database connection
   */
  public static async testConnection(config: DbConfig): Promise<{success: boolean, message: string}> {
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
      
      return await response.json();
    } catch (err) {
      console.error('Error testing MySQL connection:', err);
      return { 
        success: false, 
        message: `Error de conexión: ${err}. Verifique los detalles y asegúrese de que el servidor esté en funcionamiento.` 
      };
    }
  }

  /**
   * Connects to the database
   */
  public static async connect(config: DbConfig): Promise<{success: boolean, message?: string}> {
    try {
      const response = await fetch('/api/mysql/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      return { 
        success: false, 
        message: `Error de conexión: ${err}` 
      };
    }
  }

  /**
   * Tests the email configuration
   */
  public static async testEmailConfig(config: EmailConfig): Promise<{success: boolean, message: string}> {
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
      
      return await response.json();
    } catch (err) {
      console.error('Error testing email configuration:', err);
      return { 
        success: false, 
        message: `Error de conexión SMTP: ${err}. Verifique los detalles del servidor.` 
      };
    }
  }

  /**
   * Sends an email
   */
  public static async sendEmail(
    config: EmailConfig, 
    to: string, 
    subject: string, 
    body: string
  ): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          to,
          subject,
          body
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error sending email:', err);
      return { 
        success: false, 
        message: `Error al enviar correo: ${err}. Por favor, intente de nuevo.` 
      };
    }
  }

  /**
   * Saves equipment to the database
   */
  public static async saveEquipment(config: DbConfig, equipment: Equipment[]): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/save-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          equipment
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error saving equipment:', err);
      return false;
    }
  }

  /**
   * Gets equipment from the database
   */
  public static async getEquipment(config: DbConfig): Promise<Equipment[]> {
    try {
      const response = await fetch('/api/mysql/get-equipment', {
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
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error getting equipment:', err);
      return [];
    }
  }

  /**
   * Saves exercises to the database
   */
  public static async saveExercises(config: DbConfig, exercises: Exercise[]): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/save-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          exercises
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error saving exercises:', err);
      return false;
    }
  }

  /**
   * Gets exercises from the database
   */
  public static async getExercises(config: DbConfig): Promise<Exercise[]> {
    try {
      const response = await fetch('/api/mysql/get-exercises', {
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
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error getting exercises:', err);
      return [];
    }
  }

  /**
   * Saves routines to the database
   */
  public static async saveRoutines(config: DbConfig, routines: Routine[]): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/save-routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          routines
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error saving routines:', err);
      return false;
    }
  }

  /**
   * Gets routines from the database
   */
  public static async getRoutines(config: DbConfig): Promise<Routine[]> {
    try {
      const response = await fetch('/api/mysql/get-routines', {
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
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error getting routines:', err);
      return [];
    }
  }

  /**
   * Saves a user profile to the database
   */
  public static async saveUserProfile(config: DbConfig, profile: UserProfile): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/save-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          profile
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error saving user profile:', err);
      return false;
    }
  }

  /**
   * Gets a user profile from the database
   */
  public static async getUserProfile(config: DbConfig, email: string): Promise<UserProfile | null> {
    try {
      const response = await fetch('/api/mysql/get-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          email
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success && result.data ? result.data : null;
    } catch (err) {
      console.error('Error getting user profile:', err);
      return null;
    }
  }
}

export default MysqlService;
