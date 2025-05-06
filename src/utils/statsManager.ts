
import { mysqlConnection } from "./mysqlConnection";

export interface UserStats {
  userId?: number;
  email: string;
  caloriesBurned: number;
  exercisesCompleted: number;
  workoutTime: number; // in minutes
  routinesCompleted: number;
  lastUpdated?: string;
}

class StatsManager {
  private static instance: StatsManager;
  private currentStats: UserStats | null = null;
  
  private constructor() {
    // Initialize with zeros
    const userProfile = mysqlConnection.getUserProfile();
    if (userProfile) {
      this.currentStats = {
        email: userProfile.email,
        caloriesBurned: 0,
        exercisesCompleted: 0,
        workoutTime: 0,
        routinesCompleted: 0,
      };
      
      // Try to load stats from storage
      this.loadFromStorage();
      
      // Try to sync with database
      this.syncWithDatabase();
    }
  }
  
  public static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager();
    }
    return StatsManager.instance;
  }
  
  private async syncWithDatabase(): Promise<void> {
    if (!this.currentStats || !mysqlConnection.isConnected()) return;
    
    try {
      const response = await fetch('/api/mysql/get-user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: mysqlConnection.getConfig(),
          email: this.currentStats.email
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Update with database values if available
        this.currentStats = {
          ...this.currentStats,
          ...result.data,
          lastUpdated: new Date().toISOString()
        };
        
        // Save to local storage
        this.saveToStorage();
      }
    } catch (err) {
      console.error("Error syncing stats from database:", err);
    }
  }
  
  public async saveToDatabase(): Promise<boolean> {
    if (!this.currentStats || !mysqlConnection.isConnected()) return false;
    
    try {
      const response = await fetch('/api/mysql/save-user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: mysqlConnection.getConfig(),
          stats: this.currentStats
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.currentStats.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        return true;
      } else {
        throw new Error(result.error || "Unknown error saving stats");
      }
    } catch (err) {
      console.error("Error saving stats to database:", err);
      return false;
    }
  }
  
  private loadFromStorage(): void {
    try {
      const savedStats = localStorage.getItem('user_stats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        if (parsedStats && this.currentStats) {
          this.currentStats = {
            ...this.currentStats,
            ...parsedStats
          };
        }
      }
    } catch (err) {
      console.error("Error loading stats from storage:", err);
    }
  }
  
  private saveToStorage(): void {
    try {
      if (this.currentStats) {
        localStorage.setItem('user_stats', JSON.stringify(this.currentStats));
      }
    } catch (err) {
      console.error("Error saving stats to storage:", err);
    }
  }
  
  // Public methods to update stats
  
  public addCaloriesBurned(calories: number): void {
    if (!this.currentStats) return;
    
    this.currentStats.caloriesBurned += calories;
    this.saveToStorage();
    this.saveToDatabase().catch(console.error);
  }
  
  public addExercisesCompleted(count: number = 1): void {
    if (!this.currentStats) return;
    
    this.currentStats.exercisesCompleted += count;
    this.saveToStorage();
    this.saveToDatabase().catch(console.error);
  }
  
  public addWorkoutTime(minutes: number): void {
    if (!this.currentStats) return;
    
    this.currentStats.workoutTime += minutes;
    this.saveToStorage();
    this.saveToDatabase().catch(console.error);
  }
  
  public addRoutineCompleted(): void {
    if (!this.currentStats) return;
    
    this.currentStats.routinesCompleted += 1;
    this.saveToStorage();
    this.saveToDatabase().catch(console.error);
  }
  
  public getStats(): UserStats | null {
    return this.currentStats;
  }
  
  public async reset(): Promise<void> {
    const userProfile = mysqlConnection.getUserProfile();
    
    if (userProfile) {
      this.currentStats = {
        email: userProfile.email,
        caloriesBurned: 0,
        exercisesCompleted: 0,
        workoutTime: 0,
        routinesCompleted: 0,
        lastUpdated: new Date().toISOString()
      };
      
      this.saveToStorage();
      await this.saveToDatabase();
    }
  }
}

export const statsManager = StatsManager.getInstance();

// Try to sync stats when module is imported
setTimeout(() => {
  statsManager.syncWithDatabase();
}, 1000);
