
import { Exercise, Equipment, Routine } from "./mysqlConnection";

/**
 * Type definitions to fix compatibility issues between components
 */

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
  objetivo?: string;
  nivel?: string;
  equipamiento?: string;
  status: string;
}

// Define interfaces for data source Exercise and Equipment which might have different shapes
export interface DataExercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[] | null;
  emoji: string;
  difficulty?: string;
  requiresGym?: boolean;
  videoUrl?: string;
  sets?: number;
  reps?: string;
  rest?: string;
  calories?: number;
  caloriesPerRep?: number;
  type?: string;
}

export interface DataEquipment {
  id: string;
  name: string;
  muscleGroups: string[];
  description: string;
  image?: string;
  emoji?: string;
  category?: string;
  caloriesPerHour?: number;
  type?: string;
}

/**
 * Convert an object to an Exercise type with all required properties
 */
export function adaptExercise(data: any): Exercise {
  return {
    id: data.id || 0,
    name: data.name || '',
    description: data.description || '',
    muscleGroups: Array.isArray(data.muscleGroups) ? data.muscleGroups : [],
    equipment: Array.isArray(data.equipment) ? data.equipment : [],
    emoji: data.emoji || '💪',
    sets: data.sets || 3,
    reps: data.reps || '10-12',
    rest: data.rest || '60s',
    calories: data.calories || 0,
    difficulty: data.difficulty || 'Intermediate',
    type: 'exercise',
    // Add any other required properties
    caloriesPerRep: data.caloriesPerRep || 0,
    requiresGym: data.requiresGym || false,
    videoUrl: data.videoUrl || ''
  };
}

/**
 * Convert an object to an Equipment type with all required properties
 */
export function adaptEquipment(data: any): Equipment {
  return {
    id: data.id || 0,
    name: data.name || '',
    description: data.description || '',
    muscleGroups: Array.isArray(data.muscleGroups) ? data.muscleGroups : [],
    image: data.image || '',
    emoji: data.emoji || '🏋️',
    category: data.category || '',
    caloriesPerHour: data.caloriesPerHour || 0,
    type: 'equipment'
  };
}

/**
 * Convert an object to a Routine with status type
 */
export function adaptRoutine(data: any): RoutineWithStatus {
  return {
    id: data.id || 0,
    name: data.name || '',
    dias: typeof data.dias === 'string' ? parseInt(data.dias, 10) : (data.dias || 0),
    exercises: data.exercises || {},
    status: data.status || 'pending',
    objetivo: data.objetivo || '',
    nivel: data.nivel || '',
    equipamiento: data.equipamiento || ''
  };
}

/**
 * Convert MySQL Exercise to DataExercise format
 */
export function convertMySQLToDataExercise(exercise: Exercise): DataExercise {
  return {
    id: String(exercise.id),
    name: exercise.name,
    description: exercise.description,
    muscleGroups: exercise.muscleGroups,
    equipment: exercise.equipment,
    emoji: exercise.emoji,
    difficulty: exercise.difficulty,
    requiresGym: exercise.requiresGym,
    videoUrl: exercise.videoUrl,
    sets: exercise.sets,
    reps: exercise.reps,
    rest: exercise.rest,
    calories: exercise.calories,
    caloriesPerRep: exercise.caloriesPerRep,
    type: exercise.type
  };
}

/**
 * Convert MySQL Equipment to DataEquipment format
 */
export function convertMySQLToDataEquipment(equipment: Equipment): DataEquipment {
  return {
    id: String(equipment.id),
    name: equipment.name,
    description: equipment.description,
    muscleGroups: equipment.muscleGroups,
    image: equipment.image,
    emoji: equipment.emoji,
    category: equipment.category,
    caloriesPerHour: equipment.caloriesPerHour,
    type: equipment.type
  };
}
