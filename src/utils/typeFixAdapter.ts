
/**
 * This file provides type adapters for compatibility with components that expect different types
 */

import { Exercise, Equipment, Routine } from './mysqlConnection';

export interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
  className?: string;
}

export interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
  className?: string;
}

export interface CreateWeeklyRoutineDialogProps {
  exercises: Exercise[];
  open: boolean;
  onClose: () => void;
}

export interface RoutineWithStatus extends Routine {
  status: string;
  objetivo?: string;
  nivel?: string;
  equipamiento?: string;
}

// This function adapts exercises from different sources to match our Exercise type
export function adaptExerciseData(exercise: any): Exercise {
  return {
    id: exercise.id || 0,
    name: exercise.name || '',
    description: exercise.description || '',
    muscleGroups: Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups : [],
    equipment: Array.isArray(exercise.equipment) ? exercise.equipment : [exercise.equipment || ''],
    emoji: exercise.emoji || '💪',
    sets: exercise.sets || 3,
    reps: exercise.reps || '10-12',
    rest: exercise.rest || '60s',
    calories: exercise.calories || 0,
    caloriesPerRep: exercise.caloriesPerRep || 0,
    difficulty: exercise.difficulty || 'Intermediate',
    requiresGym: exercise.requiresGym || false,
    videoUrl: exercise.videoUrl || '',
    type: 'exercise' // Adding type property to fix errors
  };
}

// This function adapts equipment from different sources to match our Equipment type
export function adaptEquipmentData(equipment: any): Equipment {
  return {
    id: equipment.id || 0,
    name: equipment.name || '',
    description: equipment.description || '',
    muscleGroups: Array.isArray(equipment.muscleGroups) ? equipment.muscleGroups : [],
    image: equipment.image || '',
    emoji: equipment.emoji || '🏋️',
    category: equipment.category || 'General',
    caloriesPerHour: equipment.caloriesPerHour || 0,
    type: 'equipment' // Adding type property to fix errors
  };
}

// Convert type for routine with status
export function adaptRoutineData(routine: any): RoutineWithStatus {
  return {
    id: routine.id || 0,
    name: routine.name || '',
    dias: typeof routine.dias === 'string' ? parseInt(routine.dias, 10) : (routine.dias || 0),
    exercises: routine.exercises || {},
    status: routine.status || 'pending',
    objetivo: routine.objetivo || '',
    nivel: routine.nivel || '',
    equipamiento: routine.equipamiento || ''
  };
}
