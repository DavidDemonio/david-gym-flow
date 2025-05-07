
// This utility file helps adapt between different Exercise and Equipment type definitions

import { Exercise as MysqlExercise, Equipment as MysqlEquipment } from '../utils/mysqlConnection';

// Define interfaces for data Exercise and Equipment which might have different shapes
export interface DataExercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
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

// Adapter functions to ensure compatibility between different data structures
export function adaptExerciseData(exercise: DataExercise): MysqlExercise {
  return {
    id: typeof exercise.id === 'string' ? exercise.id : String(exercise.id),
    name: exercise.name,
    description: exercise.description || '',
    muscleGroups: exercise.muscleGroups || [],
    equipment: Array.isArray(exercise.equipment) ? exercise.equipment : [exercise.equipment || ''],
    emoji: exercise.emoji || '💪',
    sets: exercise.sets !== undefined ? exercise.sets : 3,
    reps: exercise.reps || '10-12',
    rest: exercise.rest || '60s',
    calories: exercise.calories !== undefined ? exercise.calories : 0,
    caloriesPerRep: exercise.caloriesPerRep,
    difficulty: exercise.difficulty,
    requiresGym: exercise.requiresGym,
    videoUrl: exercise.videoUrl,
    type: 'exercise' // Ensure type is set properly
  };
}

export function adaptEquipmentData(equipment: DataEquipment): MysqlEquipment {
  return {
    id: typeof equipment.id === 'string' ? equipment.id : String(equipment.id),
    name: equipment.name,
    muscleGroups: equipment.muscleGroups || [],
    description: equipment.description || '',
    image: equipment.image,
    emoji: equipment.emoji,
    category: equipment.category,
    caloriesPerHour: equipment.caloriesPerHour,
    type: 'equipment' // Ensure type is set properly
  };
}

// Type guard functions
export function isExercise(item: MysqlExercise | MysqlEquipment): item is MysqlExercise {
  return (item as MysqlExercise).sets !== undefined;
}

export function isEquipment(item: MysqlExercise | MysqlEquipment): item is MysqlEquipment {
  return (item as MysqlEquipment).caloriesPerHour !== undefined;
}
