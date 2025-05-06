
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
        await envManager.updateVariables(result.env);
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
  async generateRoutinePDF(routineData: any): Promise<Blob> {
    try {
      const response = await fetch('/api/pdf/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routineData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Return the PDF blob
      return await response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export default new MysqlService();
