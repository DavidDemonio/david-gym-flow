
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock, BarChart3, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface WorkoutExercise {
  name: string;
  emoji?: string;
  sets: number;
  reps: string | number;
  rest: string;
  calories: number;
}

interface WorkoutTimerProps {
  exercises: WorkoutExercise[];
  onComplete: (stats: WorkoutStats) => void;
  onCancel: () => void;
}

export interface WorkoutStats {
  duration: number; // in seconds
  totalCalories: number;
  exercisesCompleted: number;
  setsCompleted: number;
  date: Date;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ exercises, onComplete, onCancel }) => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restMode, setRestMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);

  // Parse rest time from string (e.g., "60 seg") to seconds
  const parseRestTime = (restString: string): number => {
    const match = restString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 60;
  };

  // Start rest timer
  const startRest = () => {
    setRestMode(true);
    setTimeRemaining(parseRestTime(exercises[currentExercise].rest));
    setIsActive(true);
    
    // Add calories burned for the completed set
    const exerciseCalories = exercises[currentExercise].calories;
    const setCalories = typeof exercises[currentExercise].reps === 'string' 
      ? exerciseCalories * 12 // Assuming average of range for string reps
      : exerciseCalories * (exercises[currentExercise].reps as number);
    
    setCaloriesBurned(prev => prev + setCalories);
    setCompletedSets(prev => prev + 1);
    
    toast({
      title: "Set completado",
      description: `+${setCalories} calorías quemadas`,
    });
  };

  // Complete rest and move to next set or exercise
  const completeRest = () => {
    setRestMode(false);
    
    // Move to next set or exercise
    if (currentSet < exercises[currentExercise].sets) {
      setCurrentSet(currentSet + 1);
    } else {
      // Move to next exercise or complete workout
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
        
        toast({
          title: "Ejercicio completado",
          description: `Siguiente: ${exercises[currentExercise + 1].name}`,
        });
      } else {
        // Workout completed
        completeWorkout();
      }
    }
  };

  const completeWorkout = () => {
    const stats: WorkoutStats = {
      duration: elapsedTime,
      totalCalories: caloriesBurned,
      exercisesCompleted: exercises.length,
      setsCompleted: completedSets,
      date: new Date()
    };
    
    toast({
      title: "Entrenamiento completado",
      description: `Has quemado ${caloriesBurned.toFixed(0)} calorías en ${formatTime(elapsedTime)}`,
      variant: "success",
    });
    
    onComplete(stats);
  };
  
  // Format time in seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        if (restMode && timeRemaining > 0) {
          setTimeRemaining(prev => prev - 1);
        } else if (restMode && timeRemaining === 0) {
          setIsActive(false);
          setRestMode(false);
        }
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, restMode, timeRemaining]);

  // Current exercise
  const exercise = exercises[currentExercise];
  
  // Progress calculation
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const progress = (completedSets / totalSets) * 100;

  return (
    <div className="glass-card rounded-xl p-6 animate-fadeInUp">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center">
            Entrenamiento en vivo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(elapsedTime)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <Flame className="h-3.5 w-3.5" />
              {caloriesBurned.toFixed(0)} kcal
            </Badge>
          </div>
        </div>
        
        <Progress value={progress} className="mt-4 h-2 bg-gray-200 dark:bg-gray-700" />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Progreso: {completedSets} de {totalSets} series ({Math.round(progress)}%)
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {restMode ? (
          <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-medium mb-4 text-center">Descanso</h3>
            <div className="text-4xl font-bold text-center mb-4">{formatTime(timeRemaining)}</div>
            
            <div className="flex justify-center gap-2">
              <Button 
                onClick={() => setIsActive(prev => !prev)} 
                variant="outline"
                className="w-12 h-12 p-0 rounded-full"
              >
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button 
                onClick={completeRest} 
                variant="default"
                className="w-12 h-12 p-0 rounded-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
              Siguiente: {exercise.name} - Serie {currentSet} de {exercise.sets}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{exercise.emoji || "💪"}</span>
              <h3 className="text-xl font-medium">{exercise.name}</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Serie</p>
                <p className="text-lg font-semibold">{currentSet} / {exercise.sets}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Repeticiones</p>
                <p className="text-lg font-semibold">{exercise.reps}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Descanso</p>
                <p className="text-lg font-semibold">{exercise.rest}</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => setIsActive(prev => !prev)} 
                variant="outline"
                className="flex-1"
              >
                {isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Iniciar
                  </>
                )}
              </Button>
              <Button 
                onClick={startRest} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Completar serie
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <Button variant="ghost" onClick={onCancel} className="text-gray-500 dark:text-gray-400">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={completeWorkout} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Finalizar entrenamiento
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default WorkoutTimer;
