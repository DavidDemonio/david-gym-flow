
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
  SMTP_SECURE?: string;
  SMTP_SECURE_TYPE?: string;
  
  // Application settings
  APP_NAME?: string;
  DEBUG_MODE?: string;
}

class EnvManager {
  private static instance: EnvManager;
  private variables: EnvVariables = {};
  
  private constructor() {
    this.loadFromStorage();
    // Apply variables when the app loads
    setTimeout(() => this.applyVariables(), 0);
  }
  
  public static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }
    return EnvManager.instance;
  }
  
  private loadFromStorage(): void {
    // Try to load from localStorage first
    const storedVars = localStorage.getItem('env_variables');
    if (storedVars) {
      try {
        this.variables = JSON.parse(storedVars);
        console.log('Environment variables loaded from localStorage');
      } catch (err) {
        console.error('Error loading environment variables from storage:', err);
        this.variables = {};
      }
    } else {
      // If no variables in localStorage, try to load from .env
      this.loadFromEnvFile();
    }
  }
  
  // This simulates loading from a .env file
  // In a real app with server access, this would read from actual .env files
  private loadFromEnvFile(): void {
    // This is a placeholder - we can't actually read files from the filesystem in a browser
    console.log('loadFromEnvFile is a simulation in browser environment');
    
    // For demo purposes, we'll just use some default values if nothing is in localStorage
    const defaultVars: EnvVariables = {
      APP_NAME: 'GymFlow',
      DEBUG_MODE: 'false',
      SMTP_SECURE: 'false',
      SMTP_SECURE_TYPE: 'TLS'
    };
    
    this.variables = defaultVars;
    this.saveToStorage();
  }
  
  public get(key: string): string | undefined {
    return this.variables[key as keyof EnvVariables];
  }
  
  public set(key: string, value: string): void {
    this.variables = { ...this.variables, [key]: value };
    this.saveToStorage();
    this.applyVariable(key, value);
  }
  
  public getAll(): EnvVariables {
    return { ...this.variables };
  }
  
  public setAll(variables: EnvVariables): void {
    this.variables = { ...variables };
    this.saveToStorage();
    this.applyVariables();
  }
  
  private saveToStorage(): void {
    localStorage.setItem('env_variables', JSON.stringify(this.variables));
  }
  
  // Apply all variables to the app's environment
  private applyVariables(): void {
    // This is where we would apply environment variables to the application
    // In a real Node.js app, this might set process.env values
    // In a browser app, we need to apply these variables to our services
    
    console.log('Applying environment variables to application services');
    
    // Import is within the function to avoid circular reference
    import('./mysqlConnection').then(module => {
      const mysqlConnection = module.mysqlConnection;
      mysqlConnection.loadEnvVariables();
    }).catch(err => {
      console.error('Error importing mysqlConnection:', err);
    });
  }
  
  // Apply a single variable
  private applyVariable(key: string, value: string): void {
    // Apply specific variable changes if needed
    if (key.startsWith('MYSQL_') || key.startsWith('SMTP_')) {
      // Only reload MySQL or SMTP configurations when relevant variables change
      this.applyVariables();
    }
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
      this.applyVariables(); // Apply the new variables
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
