
/**
 * MySQL connection utility for the application
 * Handles connection to the database and provides CRUD operations
 */

// Types for database configuration
export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Types for database data
export interface Equipment {
  id?: number;
  name: string;
  muscleGroups: string[];
  description: string;
  imagePath?: string;
  emoji?: string;
  category?: string;
  caloriesPerHour?: number;
  image?: string;
}

export interface Exercise {
  id?: number | string;
  name: string;
  muscleGroups: string[];
  equipment?: string | string[];
  description: string;
  difficulty: string;
  sets?: number;
  reps?: string;
  rest?: string;
  calories?: number;
  caloriesPerRep?: number;
  imagePath?: string;
  emoji?: string;
  requiresGym?: boolean;
  videoUrl?: string;
}

export interface Routine {
  id?: number;
  name: string;
  objetivo: string;
  nivel: string;
  equipamiento: string;
  dias: number;
  exercises: {[day: string]: Exercise[]};
}

class MySQLConnection {
  private static instance: MySQLConnection;
  private config: DbConfig | null = null;
  private connected: boolean = false;
  
  private constructor() {
    // Get saved configuration from localStorage
    const savedConfig = localStorage.getItem('mysql_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
      // We're not actually connecting here, just setting the flag based on saved config
      this.connected = true;
    }
  }
  
  public static getInstance(): MySQLConnection {
    if (!MySQLConnection.instance) {
      MySQLConnection.instance = new MySQLConnection();
    }
    return MySQLConnection.instance;
  }
  
  public setConfig(config: DbConfig): void {
    this.config = config;
    // Save to localStorage for persistence
    localStorage.setItem('mysql_config', JSON.stringify(config));
    this.connected = true;
  }
  
  public getConfig(): DbConfig | null {
    return this.config;
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  // In a real application, these methods would actually connect to a MySQL database
  // For this simulation, we'll use localStorage to persist data between sessions
  
  // Equipment CRUD operations
  public async saveEquipment(equipment: Equipment[]): Promise<boolean> {
    try {
      localStorage.setItem('app_equipment', JSON.stringify(equipment));
      console.log('Equipment saved to "database":', equipment.length, 'items');
      return true;
    } catch (err) {
      console.error('Error saving equipment:', err);
      return false;
    }
  }
  
  public async getEquipment(): Promise<Equipment[]> {
    try {
      const data = localStorage.getItem('app_equipment');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error getting equipment:', err);
      return [];
    }
  }
  
  // Exercise CRUD operations
  public async saveExercises(exercises: Exercise[]): Promise<boolean> {
    try {
      localStorage.setItem('app_exercises', JSON.stringify(exercises));
      console.log('Exercises saved to "database":', exercises.length, 'items');
      return true;
    } catch (err) {
      console.error('Error saving exercises:', err);
      return false;
    }
  }
  
  public async getExercises(): Promise<Exercise[]> {
    try {
      const data = localStorage.getItem('app_exercises');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error getting exercises:', err);
      return [];
    }
  }
  
  // Routine CRUD operations
  public async saveRoutines(routines: Routine[]): Promise<boolean> {
    try {
      localStorage.setItem('app_routines', JSON.stringify(routines));
      console.log('Routines saved to "database":', routines.length, 'items');
      return true;
    } catch (err) {
      console.error('Error saving routines:', err);
      return false;
    }
  }
  
  public async getRoutines(): Promise<Routine[]> {
    try {
      const data = localStorage.getItem('app_routines');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error getting routines:', err);
      return [];
    }
  }
  
  public async saveRoutine(routine: Routine): Promise<boolean> {
    try {
      // Get existing routines
      const routines = await this.getRoutines();
      
      // Check if the routine already exists
      const index = routines.findIndex(r => r.id === routine.id);
      
      if (index >= 0) {
        // Update existing routine
        routines[index] = routine;
      } else {
        // Add new routine with a generated ID
        routine.id = Date.now();
        routines.push(routine);
      }
      
      // Save all routines
      return this.saveRoutines(routines);
    } catch (err) {
      console.error('Error saving routine:', err);
      return false;
    }
  }
  
  // Simulates disconnecting from the database
  public disconnect(): void {
    this.connected = false;
    this.config = null;
    localStorage.removeItem('mysql_config');
  }
}

export const mysqlConnection = MySQLConnection.getInstance();
