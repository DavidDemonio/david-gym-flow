
import { envManager } from '../utils/envManager';

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
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
        await envManager.setAll(result.env);
        
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
   * This method now uses the client-side PdfService directly
   */
  async generateRoutinePDF(routineData: any): Promise<void> {
    const PdfService = (await import('../services/PdfService')).default;
    try {
      return await PdfService.generateRoutinePDF(routineData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
  
  /**
   * Save configuration to localStorage for persistence
   */
  saveConfigToLocalStorage(config: DbConfig, isRoutinesDb: boolean = false): void {
    const key = isRoutinesDb ? 'routinesDbConfig' : 'mainDbConfig';
    localStorage.setItem(key, JSON.stringify(config));
  }
  
  /**
   * Get configuration from localStorage
   */
  getConfigFromLocalStorage(isRoutinesDb: boolean = false): DbConfig | null {
    const key = isRoutinesDb ? 'routinesDbConfig' : 'mainDbConfig';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored database config:', error);
      }
    }
    return null;
  }
}

export default new MysqlService();
