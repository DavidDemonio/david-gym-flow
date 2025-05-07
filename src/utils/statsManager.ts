
import { mysqlConnection } from './mysqlConnection';

interface UserStats {
  workoutsCompleted: number;
  exercisesPerformed: number;
  caloriesBurned: number;
  totalWorkoutTime: number; // in minutes
  averageWorkoutDuration: number; // in minutes
  favoriteExercises: string[];
  lastWorkoutDate: string | null;
}

class StatsManager {
  private cachedStats: UserStats | null = null;
  
  constructor() {
    this.cachedStats = null;
  }
  
  async getUserStats(): Promise<UserStats> {
    // If we have cached stats, return them
    if (this.cachedStats) {
      return this.cachedStats;
    }
    
    try {
      // Get user profile to get email
      const profileResponse = await mysqlConnection.getUserProfile();
      const email = profileResponse?.data?.email;
      
      if (!email) {
        return this.getDefaultStats();
      }
      
      // In a real implementation, we would fetch the stats from the server
      // For now, we return mock data
      const stats: UserStats = {
        workoutsCompleted: 12,
        exercisesPerformed: 145,
        caloriesBurned: 3240,
        totalWorkoutTime: 420, // minutes
        averageWorkoutDuration: 35, // minutes
        favoriteExercises: ["Press de Banca", "Sentadillas", "Peso Muerto"],
        lastWorkoutDate: "2023-08-24"
      };
      
      this.cachedStats = stats;
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return this.getDefaultStats();
    }
  }
  
  private getDefaultStats(): UserStats {
    return {
      workoutsCompleted: 0,
      exercisesPerformed: 0,
      caloriesBurned: 0,
      totalWorkoutTime: 0,
      averageWorkoutDuration: 0,
      favoriteExercises: [],
      lastWorkoutDate: null
    };
  }
  
  async recordWorkout(workoutData: {
    exerciseIds: number[];
    duration: number; // in minutes
    calories: number;
  }): Promise<boolean> {
    try {
      // In a real implementation, we would save to the server
      // For now, we just update our local cache
      
      if (this.cachedStats) {
        this.cachedStats = {
          ...this.cachedStats,
          workoutsCompleted: this.cachedStats.workoutsCompleted + 1,
          exercisesPerformed: this.cachedStats.exercisesPerformed + workoutData.exerciseIds.length,
          caloriesBurned: this.cachedStats.caloriesBurned + workoutData.calories,
          totalWorkoutTime: this.cachedStats.totalWorkoutTime + workoutData.duration,
          averageWorkoutDuration: Math.round((this.cachedStats.totalWorkoutTime + workoutData.duration) / (this.cachedStats.workoutsCompleted + 1)),
          lastWorkoutDate: new Date().toISOString().split('T')[0]
        };
      } else {
        await this.getUserStats(); // Initialize cache
      }
      
      return true;
    } catch (error) {
      console.error('Error recording workout:', error);
      return false;
    }
  }
  
  async getWorkoutHistory(limit = 10): Promise<{
    date: string;
    routineName: string;
    duration: number;
    calories: number;
  }[]> {
    try {
      // Get user profile to get email
      const profileResponse = await mysqlConnection.getUserProfile();
      const email = profileResponse?.data?.email;
      
      if (!email) {
        return [];
      }
      
      // In a real implementation, we would fetch from the server
      // For now, return mock data
      return [
        {
          date: "2023-08-24",
          routineName: "Entrenamiento de Pecho",
          duration: 45,
          calories: 320
        },
        {
          date: "2023-08-22",
          routineName: "Día de Piernas",
          duration: 50,
          calories: 380
        },
        {
          date: "2023-08-20",
          routineName: "Cardio & Core",
          duration: 30,
          calories: 250
        },
        {
          date: "2023-08-18",
          routineName: "Espalda y Bíceps",
          duration: 40,
          calories: 290
        },
        {
          date: "2023-08-16",
          routineName: "HIIT Training",
          duration: 25,
          calories: 310
        }
      ];
    } catch (error) {
      console.error('Error getting workout history:', error);
      return [];
    }
  }
  
  async getProgressData(metric: 'weight' | 'strength' | 'cardio'): Promise<{
    date: string;
    value: number;
  }[]> {
    try {
      // Get user profile to get email
      const profileResponse = await mysqlConnection.getUserProfile();
      const email = profileResponse?.data?.email;
      
      if (!email) {
        return [];
      }
      
      // Mock data for different metrics
      switch (metric) {
        case 'weight':
          return [
            { date: "2023-07-01", value: 82.5 },
            { date: "2023-07-08", value: 81.8 },
            { date: "2023-07-15", value: 81.2 },
            { date: "2023-07-22", value: 80.7 },
            { date: "2023-07-29", value: 80.0 },
            { date: "2023-08-05", value: 79.4 },
            { date: "2023-08-12", value: 79.1 },
            { date: "2023-08-19", value: 78.5 }
          ];
        case 'strength':
          return [
            { date: "2023-07-01", value: 60 },
            { date: "2023-07-08", value: 65 },
            { date: "2023-07-15", value: 65 },
            { date: "2023-07-22", value: 70 },
            { date: "2023-07-29", value: 72.5 },
            { date: "2023-08-05", value: 75 },
            { date: "2023-08-12", value: 77.5 },
            { date: "2023-08-19", value: 80 }
          ];
        case 'cardio':
          return [
            { date: "2023-07-01", value: 20 },
            { date: "2023-07-08", value: 22 },
            { date: "2023-07-15", value: 25 },
            { date: "2023-07-22", value: 24 },
            { date: "2023-07-29", value: 28 },
            { date: "2023-08-05", value: 30 },
            { date: "2023-08-12", value: 32 },
            { date: "2023-08-19", value: 35 }
          ];
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting progress data:', error);
      return [];
    }
  }
}

export const statsManager = new StatsManager();
