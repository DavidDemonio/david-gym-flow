
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
  
  // Routines database configuration
  ROUTINES_MYSQL_HOST?: string;
  ROUTINES_MYSQL_PORT?: string;
  ROUTINES_MYSQL_USER?: string;
  ROUTINES_MYSQL_PASSWORD?: string;
  ROUTINES_MYSQL_DATABASE?: string;
  
  // Add index signature to make it compatible with Record<string, string>
  [key: string]: string | undefined;
}

class EnvManager {
  private static instance: EnvManager;
  private variables: EnvVariables = {};
  private initialized: boolean = false;
  private initializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  private lastFetchTime: number = 0;
  private refreshInterval: number = 60000; // 1 minute
  
  private constructor() {
    this.loadFromStorage();
    this.initPromise = this.initialize();
    
    // Set up periodic refresh
    setInterval(() => {
      this.refreshIfNeeded();
    }, this.refreshInterval);
  }
  
  public static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }
    return EnvManager.instance;
  }
  
  private async refreshIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetchTime > this.refreshInterval) {
      console.log('Auto-refreshing environment variables');
      this.refresh().catch(console.error);
    }
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
        this.lastFetchTime = Date.now();
        
        // Check if we need to update password fields from localStorage
        const storedVars = localStorage.getItem('env_variables');
        if (storedVars) {
          try {
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
          } catch (error) {
            console.error('Error parsing stored variables:', error);
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
    return this.variables[key];
  }
  
  public set(key: string, value: string): void {
    this.variables = { ...this.variables, [key]: value };
    this.saveToStorage();
    this.applyVariable(key, value);
    
    // Also send to server if possible
    const updateObj: Record<string, string> = {};
    updateObj[key] = value;
    this.sendToServer(updateObj).catch(console.error);
  }
  
  private async sendToServer(envVars: Record<string, string>): Promise<void> {
    try {
      const response = await fetch('/api/env/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env: envVars })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      console.log('Environment variables updated on server');
    } catch (err) {
      console.warn('Could not update environment variables on server:', err);
    }
  }
  
  public getAll(): EnvVariables {
    return { ...this.variables };
  }
  
  public getAllVariables(): Promise<EnvVariables> {
    return Promise.resolve({ ...this.variables });
  }
  
  public setAll(variables: EnvVariables): void {
    this.variables = { ...variables };
    this.saveToStorage();
    this.applyVariables();
    
    // Convert EnvVariables to Record<string, string> for sending to server
    const recordToSend: Record<string, string> = {};
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined) {
        recordToSend[key] = value;
      }
    });
    
    // Also send to server if possible
    this.sendToServer(recordToSend).catch(console.error);
  }
  
  public async updateVariables(variables: EnvVariables): Promise<void> {
    this.variables = { ...this.variables, ...variables };
    this.saveToStorage();
    this.applyVariables();
    
    // Send to server
    const recordToSend: Record<string, string> = {};
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined) {
        recordToSend[key] = value;
      }
    });
    
    await this.sendToServer(recordToSend);
  }
  
  public async setVariables(variables: EnvVariables): Promise<void> {
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
      // Call loadEnvironmentVariables() instead of non-existent loadEnvVariables()
      mysqlConnection.loadEnvironmentVariables();
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
          newVars[key] = value;
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
    
    try {
      const response = await fetch('/api/env');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.env) {
        console.log('Environment variables refreshed from server API');
        
        // Keep passwords from current variables
        const passwords = {
          MYSQL_PASSWORD: this.variables.MYSQL_PASSWORD,
          SMTP_PASSWORD: this.variables.SMTP_PASSWORD,
          ROUTINES_MYSQL_PASSWORD: this.variables.ROUTINES_MYSQL_PASSWORD
        };
        
        // Merge with existing variables, prioritizing server values
        this.variables = { ...this.variables, ...data.env, ...passwords };
        this.saveToStorage();
        this.lastFetchTime = Date.now();
      }
      
      this.applyVariables();
      this.initialized = true;
      return Promise.resolve();
    } catch (err) {
      console.warn('Could not refresh environment variables from server API:', err);
      return this.initialize();
    }
  }
}

export const envManager = EnvManager.getInstance();
