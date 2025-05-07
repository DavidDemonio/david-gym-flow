import { envManager } from './envManager';
import { EmailConfig } from '../services/MysqlService';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  emoji: string;
  sets: number;
  reps: string;
  rest: string;
  calories: number;
  caloriesPerRep?: number;
  difficulty?: string;
  requiresGym?: boolean;
  videoUrl?: string;
  type?: string; // Added to support the components that use this property
}

export interface Equipment {
  id: number;
  name: string;
  muscleGroups: string[];
  description: string;
  image?: string;
  emoji?: string;
  category?: string;
  caloriesPerHour?: number;
  type?: string; // Added to support the components that use this property
}

export interface Routine {
  id: number;
  name: string;
  dias: number;
  exercises: Record<string, Exercise[]>;
  status?: string;
  objetivo?: string; // Added for compatibility
  nivel?: string; // Added for compatibility
  equipamiento?: string; // Added for compatibility
}

export interface RoutineWithStatus extends Routine {
  objetivo?: string;
  nivel?: string;
  equipamiento?: string;
  status: string;
}

interface Cache {
  exercises?: Exercise[];
  routines?: Routine[];
  logs?: string[]; // Added for connection logs
}

class MySQLConnection {
  private mainDbConfig: DbConfig | null = null;
  private routinesDbConfig: DbConfig | null = null;
  private authDbConfig: DbConfig | null = null;
  private emailConfig: EmailConfig | null = null;
  private isMainDbConnected: boolean = false;
  private isRoutinesConnected: boolean = false;
  private isAuthDbConnected: boolean = false;
  private cachedData: Cache = {
    logs: []
  };

  constructor() {
    this.loadConfigFromLocalStorage();
  }

  private loadConfigFromLocalStorage(): void {
    const mainDbStored = localStorage.getItem('mainDbConfig');
    if (mainDbStored) {
      try {
        this.mainDbConfig = JSON.parse(mainDbStored);
        this.testConnection(this.mainDbConfig)
          .then(isConnected => {
            this.isMainDbConnected = isConnected;
          });
      } catch (error) {
        console.error('Error parsing stored main database config:', error);
      }
    }

    const routinesDbStored = localStorage.getItem('routinesDbConfig');
    if (routinesDbStored) {
      try {
        this.routinesDbConfig = JSON.parse(routinesDbStored);
        this.testRoutinesDbConnection(this.routinesDbConfig)
          .then(isConnected => {
            this.isRoutinesConnected = isConnected;
          });
      } catch (error) {
        console.error('Error parsing stored routines database config:', error);
      }
    }

    const authDbStored = localStorage.getItem('authDbConfig');
    if (authDbStored) {
      try {
        this.authDbConfig = JSON.parse(authDbStored);
      } catch (error) {
        console.error('Error parsing stored auth database config:', error);
      }
    }

    const emailConfigStored = localStorage.getItem('emailConfig');
    if (emailConfigStored) {
      try {
        this.emailConfig = JSON.parse(emailConfigStored);
      } catch (error) {
        console.error('Error parsing stored email config:', error);
      }
    }
  }

  // Connection logs methods
  private logMessage(message: string): void {
    if (!this.cachedData.logs) {
      this.cachedData.logs = [];
    }
    const timestamp = new Date().toISOString();
    this.cachedData.logs.push(`[${timestamp}] ${message}`);
    // Keep only the last 100 logs
    if (this.cachedData.logs.length > 100) {
      this.cachedData.logs.shift();
    }
  }

  getConnectionLogs(): string[] {
    return this.cachedData.logs || [];
  }

  clearLogs(): void {
    this.cachedData.logs = [];
  }

  // Main database configuration
  async setConfig(config: DbConfig): Promise<void> {
    this.mainDbConfig = config;
    localStorage.setItem('mainDbConfig', JSON.stringify(config));
    this.isMainDbConnected = await this.testConnection(config);
    this.logMessage(`Main database configuration updated: ${config.database}@${config.host}:${config.port}`);
  }

  getConfig(): DbConfig | null {
    return this.mainDbConfig;
  }

  // Routines database configuration
  async setRoutinesDbConfig(config: DbConfig): Promise<void> {
    this.routinesDbConfig = config;
    localStorage.setItem('routinesDbConfig', JSON.stringify(config));
    this.isRoutinesConnected = await this.testRoutinesDbConnection(config);
    this.logMessage(`Routines database configuration updated: ${config.database}@${config.host}:${config.port}`);
  }

  getRoutinesDbConfig(): DbConfig | null {
    return this.routinesDbConfig;
  }

  // Auth database configuration
  async setAuthDbConfig(config: DbConfig): Promise<void> {
    this.authDbConfig = config;
    localStorage.setItem('authDbConfig', JSON.stringify(config));
    this.logMessage(`Auth database configuration updated: ${config.database}@${config.host}:${config.port}`);
  }

  getAuthDbConfig(): DbConfig | null {
    return this.authDbConfig;
  }

  // Email configuration
  async setEmailConfig(config: EmailConfig): Promise<void> {
    this.emailConfig = config;
    localStorage.setItem('emailConfig', JSON.stringify(config));
    this.logMessage(`Email configuration updated: ${config.host}:${config.port}`);
    return Promise.resolve();
  }

  getEmailConfig(): EmailConfig | null {
    return this.emailConfig;
  }

  // Test email configuration
  async testEmailConfig(config: EmailConfig = this.emailConfig!): Promise<{success: boolean, message: string}> {
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
      this.logMessage(`Email configuration test ${result.success ? 'successful' : 'failed'}`);
      return result;
    } catch (error) {
      console.error('Error testing email configuration:', error);
      this.logMessage(`Email configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Send email
  async sendEmail(to: string, subject: string, html: string): Promise<{success: boolean, message: string}> {
    try {
      if (!this.emailConfig) {
        throw new Error('Email configuration not found');
      }
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.emailConfig,
          to,
          subject,
          body: html
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      this.logMessage(`Email to "${to}" ${result.success ? 'sent successfully' : 'failed to send'}`);
      return { 
        success: result.success, 
        message: result.message || (result.success ? 'Email sent' : 'Failed to send email') 
      };
    } catch (error) {
      console.error('Error sending email:', error);
      this.logMessage(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Test main database connection
  async testConnection(config: DbConfig = this.mainDbConfig!): Promise<boolean> {
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
      this.isMainDbConnected = result.success;
      this.logMessage(`Main database connection test ${result.success ? 'successful' : 'failed'}`);
      return result.success;
    } catch (error) {
      console.error('Error testing MySQL connection:', error);
      this.isMainDbConnected = false;
      this.logMessage(`Main database connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Test routines database connection
  async testRoutinesDbConnection(config: DbConfig = this.routinesDbConfig!): Promise<boolean> {
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
      this.isRoutinesConnected = result.success;
      this.logMessage(`Routines database connection test ${result.success ? 'successful' : 'failed'}`);
      return result.success;
    } catch (error) {
      console.error('Error testing routines MySQL connection:', error);
      this.isRoutinesConnected = false;
      this.logMessage(`Routines database connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Connection status methods
  isConnected(): boolean {
    return this.isMainDbConnected;
  }

  isRoutinesConnected(): boolean {
    return this.isRoutinesConnected;
  }

  // Reconnect to database
  async reconnect(): Promise<boolean> {
    if (this.mainDbConfig) {
      return this.testConnection(this.mainDbConfig);
    }
    return false;
  }

  // Get user profile
  async getUserProfile(): Promise<{success: boolean, data: any}> {
    try {
      // Get the user email from local storage if available
      const currentUser = localStorage.getItem('currentUser');
      let email = '';
      if (currentUser) {
        const user = JSON.parse(currentUser);
        email = user.email || '';
      }

      const response = await fetch('/api/mysql/user-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.logMessage(`User profile retrieved successfully`);
      return result;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.logMessage(`Failed to retrieve user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, data: null };
    }
  }

  // Update user profile
  async saveUserProfile(profile: any): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/save-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.mainDbConfig,
          profile
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.logMessage(`User profile ${result.success ? 'saved' : 'failed to save'}`);
      return result.success;
    } catch (error) {
      console.error('Error updating user profile:', error);
      this.logMessage(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Get exercises
  async getExercises(): Promise<Exercise[]> {
    if (this.cachedData.exercises) {
      return this.cachedData.exercises;
    }

    try {
      const response = await fetch('/api/mysql/get-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: this.mainDbConfig }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Add type property to each exercise for compatibility
      const typedExercises = result.data.map((exercise: Exercise) => ({
        ...exercise,
        type: 'exercise'
      }));
      
      this.cachedData.exercises = typedExercises;
      this.logMessage(`Retrieved ${result.data.length} exercises`);
      return typedExercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      this.logMessage(`Failed to retrieve exercises: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  // Save exercises
  async saveExercises(exercises: Exercise[]): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/save-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.mainDbConfig,
          exercises: exercises.map(ex => {
            // Remove type property before saving to backend
            const { type, ...rest } = ex;
            return rest;
          })
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        this.cachedData.exercises = exercises;
      }
      this.logMessage(`Exercises ${result.success ? 'saved' : 'failed to save'}`);
      return result.success;
    } catch (error) {
      console.error('Error saving exercises:', error);
      this.logMessage(`Failed to save exercises: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Get routines
  async getRoutines(): Promise<Routine[]> {
    if (!this.routinesDbConfig) {
      console.warn('Routines database not configured.');
      return [];
    }

    if (this.cachedData.routines) {
      return this.cachedData.routines;
    }

    try {
      const response = await fetch('/api/mysql/get-routines-separate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: this.routinesDbConfig }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.cachedData.routines = result.data;
      this.logMessage(`Retrieved ${result.data.length} routines`);
      return result.data;
    } catch (error) {
      console.error('Error fetching routines:', error);
      this.logMessage(`Failed to retrieve routines: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  // Save routines
  async saveRoutines(routines: Routine[]): Promise<{success: boolean, message: string}> {
    if (!this.routinesDbConfig) {
      console.warn('Routines database not configured.');
      return { success: false, message: 'Routines database not configured.' };
    }

    try {
      const response = await fetch('/api/mysql/save-routines-separate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig,
          routines
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        this.cachedData.routines = routines;
      }
      this.logMessage(`Routines ${result.success ? 'saved' : 'failed to save'}`);
      return { success: result.success, message: result.message || 'Operation completed' };
    } catch (error) {
      console.error('Error saving routines:', error);
      this.logMessage(`Failed to save routines: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // Create a single routine
  async saveRoutine(routine: Omit<Routine, 'id'>): Promise<Routine | null> {
    try {
      if (!this.routinesDbConfig) {
        console.warn('Routines database not configured.');
        return null;
      }

      const response = await fetch('/api/mysql/create-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig,
          routine
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.routine) {
        // Update local cache
        const cachedRoutines = this.cachedData.routines || [];
        this.cachedData.routines = [...cachedRoutines, result.routine];
        this.logMessage(`Routine "${routine.name}" created successfully`);
        return result.routine;
      }

      this.logMessage(`Failed to create routine "${routine.name}"`);
      return null;
    } catch (error) {
      console.error('Error creating routine:', error);
      this.logMessage(`Error creating routine: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  // Load environment variables
  async loadEnvironmentVariables(): Promise<Record<string, string>> {
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
        this.logMessage('Environment variables loaded successfully');
        return result.env;
      } else {
        this.logMessage('Failed to load environment variables');
        throw new Error('Could not load environment variables');
      }
    } catch (error) {
      console.error('Error loading environment variables:', error);
      this.logMessage(`Error loading environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Get all env variables
  async getAllVariables(): Promise<Record<string, string>> {
    const env = await envManager.getAll();
    return env;
  }
  
  // Update environment variables
  async updateEnvironmentVariables(vars: Record<string, string>): Promise<boolean> {
    try {
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

      const result = await response.json();
      this.logMessage(`Environment variables ${result.success ? 'updated successfully' : 'failed to update'}`);
      return result.success;
    } catch (error) {
      console.error('Error updating environment variables:', error);
      this.logMessage(`Error updating environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Add missing methods
  async updateRoutineName(routineId: number, newName: string): Promise<{success: boolean, message: string}> {
    try {
      if (!this.routinesDbConfig) {
        console.warn('Routines database not configured.');
        return { success: false, message: 'Routines database not configured.' };
      }

      const response = await fetch('/api/mysql/update-routine-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig,
          routineId, 
          newName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local cache
        const cachedRoutines = this.cachedData.routines || [];
        this.cachedData.routines = cachedRoutines.map(routine => 
          routine.id === routineId ? { ...routine, name: newName } : routine
        );
        this.logMessage(`Routine name updated to "${newName}"`);
      }
      
      return { success: result.success, message: result.message || 'Operation completed' };
    } catch (error) {
      console.error('Error updating routine name:', error);
      this.logMessage(`Error updating routine name: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async deleteRoutine(routineId: number): Promise<{success: boolean, message: string}> {
    try {
      if (!this.routinesDbConfig) {
        console.warn('Routines database not configured.');
        return { success: false, message: 'Routines database not configured.' };
      }
      
      const response = await fetch('/api/mysql/delete-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig,
          routineId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local cache
        const cachedRoutines = this.cachedData.routines || [];
        this.cachedData.routines = cachedRoutines.filter(routine => routine.id !== routineId);
        this.logMessage(`Routine ${routineId} deleted successfully`);
      }
      
      return { success: result.success, message: result.message || 'Operation completed' };
    } catch (error) {
      console.error('Error deleting routine:', error);
      this.logMessage(`Error deleting routine: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async updateRoutineStatus(routineId: number, status: string): Promise<{success: boolean, message: string}> {
    try {
      if (!this.routinesDbConfig) {
        console.warn('Routines database not configured.');
        return { success: false, message: 'Routines database not configured.' };
      }
      
      const response = await fetch('/api/mysql/update-routine-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig,
          routineId, 
          status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local cache
        const cachedRoutines = this.cachedData.routines || [];
        this.cachedData.routines = cachedRoutines.map(routine => 
          routine.id === routineId ? { ...routine, status } : routine
        );
        this.logMessage(`Routine ${routineId} status updated to "${status}"`);
      }
      
      return { success: result.success, message: result.message || 'Operation completed' };
    } catch (error) {
      console.error('Error updating routine status:', error);
      this.logMessage(`Error updating routine status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

export const mysqlConnection = new MySQLConnection();
