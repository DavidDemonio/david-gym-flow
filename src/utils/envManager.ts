
/**
 * Environment variable manager for the application
 * Simulates .env file functionality using localStorage
 */

// Types for environment variables
export interface EnvVariables {
  // MySQL configuration
  MYSQL_HOST?: string;
  MYSQL_PORT?: string;
  MYSQL_USER?: string;
  MYSQL_PASSWORD?: string;
  MYSQL_DATABASE?: string;
  
  // SMTP configuration
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  FROM_EMAIL?: string;
  
  // Application settings
  APP_NAME?: string;
  DEBUG_MODE?: string;
}

class EnvManager {
  private static instance: EnvManager;
  private variables: EnvVariables = {};
  
  private constructor() {
    this.loadFromStorage();
  }
  
  public static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }
    return EnvManager.instance;
  }
  
  private loadFromStorage(): void {
    const storedVars = localStorage.getItem('env_variables');
    if (storedVars) {
      try {
        this.variables = JSON.parse(storedVars);
      } catch (err) {
        console.error('Error loading environment variables from storage:', err);
        this.variables = {};
      }
    }
  }
  
  public get(key: string): string | undefined {
    return this.variables[key as keyof EnvVariables];
  }
  
  public set(key: string, value: string): void {
    this.variables = { ...this.variables, [key]: value };
    this.saveToStorage();
  }
  
  public getAll(): EnvVariables {
    return { ...this.variables };
  }
  
  public setAll(variables: EnvVariables): void {
    this.variables = { ...variables };
    this.saveToStorage();
  }
  
  private saveToStorage(): void {
    localStorage.setItem('env_variables', JSON.stringify(this.variables));
  }
  
  // Export variables to a .env format string
  public exportToEnvFormat(): string {
    let envContent = '# Environment Variables for GymFlow\n\n';
    
    Object.entries(this.variables).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Escape any quotes in the value
        const escapedValue = value.replace(/"/g, '\\"');
        envContent += `${key}="${escapedValue}"\n`;
      }
    });
    
    return envContent;
  }
  
  // Import variables from a .env format string
  public importFromEnvFormat(content: string): boolean {
    try {
      const newVars: EnvVariables = {};
      
      // Split by lines and process each line
      content.split('\n').forEach(line => {
        // Ignore comments and empty lines
        if (line.trim() === '' || line.trim().startsWith('#')) {
          return;
        }
        
        // Look for KEY="VALUE" or KEY=VALUE format
        const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
        if (match) {
          const [, key, value] = match;
          newVars[key as keyof EnvVariables] = value;
        }
      });
      
      // Update variables and save
      this.variables = { ...this.variables, ...newVars };
      this.saveToStorage();
      return true;
    } catch (err) {
      console.error('Error importing environment variables:', err);
      return false;
    }
  }
  
  public clear(): void {
    this.variables = {};
    localStorage.removeItem('env_variables');
  }
}

export const envManager = EnvManager.getInstance();
