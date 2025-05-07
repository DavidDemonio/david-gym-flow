
/**
 * Environment variables management utility
 */

import { mysqlConnection } from './mysqlConnection';

type EnvVariables = Record<string, string>;

class EnvManager {
  private variables: EnvVariables = {};
  private initialized: boolean = false;
  
  constructor() {
    this.loadFromLocalStorage();
  }
  
  /**
   * Load environment variables from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedEnv = localStorage.getItem('envVariables');
      if (storedEnv) {
        this.variables = JSON.parse(storedEnv);
        this.initialized = true;
      }
    } catch (err) {
      console.error('Error loading environment variables from localStorage:', err);
    }
  }
  
  /**
   * Save environment variables to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('envVariables', JSON.stringify(this.variables));
    } catch (err) {
      console.error('Error saving environment variables to localStorage:', err);
    }
  }

  /**
   * Initialize environment variables
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Try to load from MySQL
      const envVars = await mysqlConnection.loadEnvironmentVariables();
      if (envVars && Object.keys(envVars).length > 0) {
        this.variables = envVars;
        this.initialized = true;
        this.saveToLocalStorage();
        return true;
      }
    } catch (err) {
      console.warn('Could not load environment variables from MySQL:', err);
      // Try to load from localStorage as fallback
      this.loadFromLocalStorage();
    }
    
    return this.initialized;
  }
  
  /**
   * Set a single environment variable
   */
  async set(key: string, value: string): Promise<void> {
    this.variables[key] = value;
    this.saveToLocalStorage();
  }
  
  /**
   * Get a single environment variable
   */
  get(key: string): string | undefined {
    return this.variables[key];
  }
  
  /**
   * Set multiple environment variables at once
   */
  async setAll(vars: EnvVariables): Promise<void> {
    this.variables = { ...this.variables, ...vars };
    this.saveToLocalStorage();
  }

  /**
   * Set multiple environment variables (alias for setAll)
   */
  async setVariables(vars: EnvVariables): Promise<void> {
    return this.setAll(vars);
  }
  
  /**
   * Get all environment variables
   */
  async getAll(): Promise<EnvVariables> {
    if (!this.initialized) {
      await this.initialize();
    }
    return { ...this.variables };
  }

  /**
   * Get all variables (alias for getAll)
   */
  async getAllVariables(): Promise<EnvVariables> {
    return this.getAll();
  }
  
  /**
   * Update variables on server and in local storage
   */
  async updateVariables(vars: EnvVariables): Promise<boolean> {
    try {
      // Update local cache first
      this.variables = { ...this.variables, ...vars };
      this.saveToLocalStorage();
      
      // Then try to update on server
      const response = await fetch('/api/env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ env: vars }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Error updating environment variables:', err);
      return false;
    }
  }

  /**
   * Export variables to .env format
   */
  exportToEnvFormat(): string {
    return Object.entries(this.variables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }

  /**
   * Import variables from .env format
   */
  importFromEnvFormat(envText: string): void {
    const vars: EnvVariables = {};
    
    // Parse .env format (KEY=value)
    envText.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        vars[key.trim()] = value;
      }
    });
    
    this.setAll(vars);
  }

  /**
   * Refresh environment variables from server
   */
  async refresh(): Promise<boolean> {
    try {
      const vars = await mysqlConnection.loadEnvironmentVariables();
      if (vars && Object.keys(vars).length > 0) {
        await this.setAll(vars);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing environment variables:', error);
      return false;
    }
  }
}

export const envManager = new EnvManager();
