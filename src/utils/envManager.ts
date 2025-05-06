
/**
 * Environment variable manager for the application
 * Loads variables from the server API or uses localStorage as fallback
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
  private initialized: boolean = false;
  private initializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  
  private constructor() {
    this.loadFromStorage();
    this.initPromise = this.initialize();
  }
  
  public static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }
    return EnvManager.instance;
  }
  
  private async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;
    
    this.initializing = true;
    
    try {
      // Try to fetch environment variables from the server API
      const response = await fetch('/api/env');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.env) {
        console.log('Environment variables loaded from server API');
        // Merge with existing variables, prioritizing server values
        this.variables = { ...this.variables, ...data.env };
        this.saveToStorage();
        
        // Check if we need to update password fields from localStorage
        const storedVars = localStorage.getItem('env_variables');
        if (storedVars) {
          const parsedVars = JSON.parse(storedVars);
          if (parsedVars.MYSQL_PASSWORD) {
            this.variables.MYSQL_PASSWORD = parsedVars.MYSQL_PASSWORD;
          }
          if (parsedVars.SMTP_PASSWORD) {
            this.variables.SMTP_PASSWORD = parsedVars.SMTP_PASSWORD;
          }
          if (!this.variables.MYSQL_USER && parsedVars.MYSQL_USER) {
            this.variables.MYSQL_USER = parsedVars.MYSQL_USER;
          }
          if (!this.variables.SMTP_USER && parsedVars.SMTP_USER) {
            this.variables.SMTP_USER = parsedVars.SMTP_USER;
          }
        }
      }
    } catch (err) {
      console.warn('Could not load environment variables from server API:', err);
      // Continue with localStorage variables
    }
    
    // Apply variables to the application
    this.applyVariables();
    this.initialized = true;
    this.initializing = false;
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
      // If no variables in localStorage, use defaults
      this.loadDefaults();
    }
  }
  
  // Load default values
  private loadDefaults(): void {
    const defaultVars: EnvVariables = {
      APP_NAME: 'GymFlow',
      DEBUG_MODE: 'false',
      SMTP_SECURE: 'false',
      SMTP_SECURE_TYPE: 'TLS'
    };
    
    this.variables = defaultVars;
    this.saveToStorage();
  }
  
  // Wait for initialization to complete
  public async ready(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) {
      return this.initPromise;
    }
    return Promise.resolve();
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
  
  // Force re-fetch from server
  public async refresh(): Promise<void> {
    this.initialized = false;
    this.initializing = false;
    return this.initialize();
  }
}

export const envManager = EnvManager.getInstance();
