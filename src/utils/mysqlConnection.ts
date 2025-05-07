import { createClient } from '@supabase/supabase-js';
import { envManager } from './envManager';

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
  equipment: string;
  emoji: string;
  sets: number;
  reps: string;
  rest: string;
  calories: number;
}

export interface Routine {
  id: number;
  name: string;
  dias: number;
  exercises: Record<string, Exercise[]>;
  status: string;
}

interface Cache {
  exercises?: Exercise[];
  routines?: Routine[];
}

class MySQLConnection {
  private mainDbConfig: DbConfig | null = null;
  private routinesDbConfig: DbConfig | null = null;
  private isMainDbConnected: boolean = false;
  private isRoutinesDbConnected: boolean = false;
  private cachedData: Cache = {};

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
            this.isRoutinesDbConnected = isConnected;
          });
      } catch (error) {
        console.error('Error parsing stored routines database config:', error);
      }
    }
  }

  // Main database configuration
  async setConfig(config: DbConfig): Promise<void> {
    this.mainDbConfig = config;
    localStorage.setItem('mainDbConfig', JSON.stringify(config));
    this.isMainDbConnected = await this.testConnection(config);
  }

  getConfig(): DbConfig | null {
    return this.mainDbConfig;
  }

  // Routines database configuration
  async setRoutinesDbConfig(config: DbConfig): Promise<void> {
    this.routinesDbConfig = config;
    localStorage.setItem('routinesDbConfig', JSON.stringify(config));
    this.isRoutinesDbConnected = await this.testRoutinesDbConnection(config);
  }

  getRoutinesDbConfig(): DbConfig | null {
    return this.routinesDbConfig;
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
      return result.success;
    } catch (error) {
      console.error('Error testing MySQL connection:', error);
      this.isMainDbConnected = false;
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
      this.isRoutinesDbConnected = result.success;
      return result.success;
    } catch (error) {
      console.error('Error testing routines MySQL connection:', error);
      this.isRoutinesDbConnected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.isMainDbConnected;
  }

  isRoutinesDbConnected(): boolean {
    return this.isRoutinesDbConnected;
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    try {
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
      return result;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Get exercises
  async getExercises(): Promise<Exercise[]> {
    if (this.cachedData.exercises) {
      return this.cachedData.exercises;
    }

    try {
      const response = await fetch('/api/mysql/exercises', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.cachedData.exercises = result;
      return result;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
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
      const response = await fetch('/api/mysql/routines', {
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
      this.cachedData.routines = result;
      return result;
    } catch (error) {
      console.error('Error fetching routines:', error);
      return [];
    }
  }

  // Create routine
  async createRoutine(routine: Omit<Routine, 'id'>): Promise<Routine | null> {
    try {
      const response = await fetch('/api/mysql/create-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routine,
          config: this.routinesDbConfig
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
        return result.routine;
      }

      return null;
    } catch (error) {
      console.error('Error creating routine:', error);
      return null;
    }
  }

  // Update routine name
  async updateRoutineName(routineId: number, newName: string): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/update-routine-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId, 
          newName,
          config: this.routinesDbConfig
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
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating routine name:', error);
      return false;
    }
  }

  // Delete routine
  async deleteRoutine(routineId: number): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/delete-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId,
          config: this.routinesDbConfig
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
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting routine:', error);
      return false;
    }
  }

  // Update routine status
  async updateRoutineStatus(routineId: number, status: string): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/update-routine-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId, 
          status,
          config: this.routinesDbConfig
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
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating routine status:', error);
      return false;
    }
  }

  // Add exercise to routine
  async addExerciseToRoutine(routineId: number, day: string, exercise: Exercise): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/add-exercise-to-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId,
          day,
          exercise,
          config: this.routinesDbConfig
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local cache
        const cachedRoutines = this.cachedData.routines || [];
        this.cachedData.routines = cachedRoutines.map(routine => {
          if (routine.id === routineId) {
            const updatedExercises = { ...routine.exercises };
            if (updatedExercises[day]) {
              updatedExercises[day] = [...updatedExercises[day], exercise];
            } else {
              updatedExercises[day] = [exercise];
            }
            return { ...routine, exercises: updatedExercises };
          }
          return routine;
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      return false;
    }
  }

  // Remove exercise from routine
  async removeExerciseFromRoutine(routineId: number, day: string, exerciseId: number): Promise<boolean> {
    try {
      const response = await fetch('/api/mysql/remove-exercise-from-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId,
          day,
          exerciseId,
          config: this.routinesDbConfig
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local cache
        const cachedRoutines = this.cachedData.routines || [];
        this.cachedData.routines = cachedRoutines.map(routine => {
          if (routine.id === routineId) {
            const updatedExercises = { ...routine.exercises };
            if (updatedExercises[day]) {
              updatedExercises[day] = updatedExercises[day].filter(ex => ex.id !== exerciseId);
            }
            return { ...routine, exercises: updatedExercises };
          }
          return routine;
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing exercise from routine:', error);
      return false;
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
        return result.env;
      } else {
        throw new Error('Could not load environment variables');
      }
    } catch (error) {
      console.error('Error loading environment variables:', error);
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
      return result.success;
    } catch (error) {
      console.error('Error updating environment variables:', error);
      return false;
    }
  }
}

export const mysqlConnection = new MySQLConnection();
