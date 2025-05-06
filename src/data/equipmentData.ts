
export interface Equipment {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  muscleGroups: string[];
  caloriesPerHour?: number; // Adding the missing property
  image?: string;
}

export const gymEquipment: Equipment[] = [
  {
    id: "press-banca",
    name: "Press de Banca",
    emoji: "🏋️",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de pecho con barra horizontal",
    muscleGroups: ["Pecho", "Tríceps", "Hombros"],
    caloriesPerHour: 350
  },
  {
    id: "smith-machine",
    name: "Máquina Smith",
    emoji: "🔨",
    category: "Multiestación",
    description: "Máquina multiusos con barra guiada para diversos ejercicios",
    muscleGroups: ["Múltiples", "Pecho", "Piernas", "Hombros"],
    caloriesPerHour: 400
  },
  {
    id: "prensa-piernas",
    name: "Prensa de Piernas",
    emoji: "🦵",
    category: "Máquina con Peso",
    description: "Máquina para trabajar cuádriceps y glúteos con resistencia",
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    caloriesPerHour: 450
  },
  {
    id: "polea-alta",
    name: "Polea Alta",
    emoji: "⛓️",
    category: "Polea",
    description: "Sistema de poleas para ejercicios de tracción hacia abajo",
    muscleGroups: ["Espalda", "Bíceps", "Hombros"],
    caloriesPerHour: 300
  },
  {
    id: "polea-baja",
    name: "Polea Baja",
    emoji: "⛓️",
    category: "Polea",
    description: "Sistema de poleas para ejercicios de tracción hacia arriba",
    muscleGroups: ["Espalda", "Bíceps", "Antebrazo"],
    caloriesPerHour: 300
  },
  {
    id: "extension-pierna",
    name: "Extensión de Pierna",
    emoji: "🦿",
    category: "Máquina de Aislamiento",
    description: "Máquina para aislar y trabajar los cuádriceps",
    muscleGroups: ["Cuádriceps"],
    caloriesPerHour: 280
  },
  {
    id: "curl-femoral",
    name: "Curl Femoral",
    emoji: "🦵",
    category: "Máquina de Aislamiento",
    description: "Máquina para aislar y trabajar los isquiotibiales",
    muscleGroups: ["Isquiotibiales"],
    caloriesPerHour: 250
  },
  {
    id: "aductor",
    name: "Máquina de Aductor",
    emoji: "🔄",
    category: "Máquina de Aislamiento",
    description: "Máquina para trabajar la cara interna del muslo",
    muscleGroups: ["Aductores"],
    caloriesPerHour: 220
  },
  {
    id: "abductor",
    name: "Máquina de Abductor",
    emoji: "🔄",
    category: "Máquina de Aislamiento",
    description: "Máquina para trabajar la cara externa del muslo",
    muscleGroups: ["Abductores"],
    caloriesPerHour: 220
  },
  {
    id: "press-hombro",
    name: "Press de Hombro",
    emoji: "💪",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de hombros con resistencia",
    muscleGroups: ["Hombros", "Tríceps"],
    caloriesPerHour: 300
  },
  {
    id: "press-pecho",
    name: "Press de Pecho",
    emoji: "💪",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de pecho con resistencia",
    muscleGroups: ["Pecho", "Tríceps", "Hombros"],
    caloriesPerHour: 350
  },
  {
    id: "remo-sentado",
    name: "Remo Sentado",
    emoji: "🚣",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de espalda en posición sentada",
    muscleGroups: ["Espalda", "Bíceps", "Antebrazos"],
    caloriesPerHour: 320
  },
  {
    id: "maquina-dominadas",
    name: "Máquina de Dominadas Asistidas",
    emoji: "🧗",
    category: "Asistida",
    description: "Máquina para hacer dominadas con asistencia de contrapeso",
    muscleGroups: ["Espalda", "Bíceps", "Antebrazo"],
    caloriesPerHour: 280
  },
  {
    id: "barra-dominadas",
    name: "Barra de Dominadas",
    emoji: "🏋️",
    category: "Peso Libre",
    description: "Barra fija para realizar dominadas y ejercicios de suspensión",
    muscleGroups: ["Espalda", "Bíceps", "Core"],
    caloriesPerHour: 400
  },
  {
    id: "barra-paralelas",
    name: "Barras Paralelas",
    emoji: "🤸",
    category: "Peso Libre",
    description: "Barras para realizar fondos y ejercicios de tríceps",
    muscleGroups: ["Tríceps", "Pecho", "Hombros"],
    caloriesPerHour: 380
  }
];

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  equipment: string[] | null;
  muscleGroups: string[];
  difficulty: "principiante" | "intermedio" | "avanzado";
  description: string;
  requiresGym: boolean;
  caloriesPerRep?: number; // Adding the missing property
  videoUrl?: string;
}

export const exercises: Exercise[] = [
  // Ejercicios sin equipamiento
  {
    id: "flexiones",
    name: "Flexiones",
    emoji: "💪",
    equipment: null,
    muscleGroups: ["Pecho", "Tríceps", "Hombros"],
    difficulty: "principiante",
    description: "Ejercicio básico para pecho y brazos usando el peso corporal",
    requiresGym: false,
    caloriesPerRep: 5
  },
  {
    id: "sentadillas",
    name: "Sentadillas",
    emoji: "🧎",
    equipment: null,
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    difficulty: "principiante",
    description: "Ejercicio básico para piernas usando el peso corporal",
    requiresGym: false,
    caloriesPerRep: 8
  },
  {
    id: "plancha",
    name: "Plancha",
    emoji: "🧘",
    equipment: null,
    muscleGroups: ["Core", "Abdominales", "Espalda baja"],
    difficulty: "principiante",
    description: "Ejercicio estático para fortalecer el core",
    requiresGym: false,
    caloriesPerRep: 6
  },
  {
    id: "burpees",
    name: "Burpees",
    emoji: "🏃",
    equipment: null,
    muscleGroups: ["Full body", "Cardio"],
    difficulty: "intermedio",
    description: "Ejercicio de alta intensidad que combina sentadilla, flexión y salto",
    requiresGym: false,
    caloriesPerRep: 10
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    emoji: "🧗",
    equipment: null,
    muscleGroups: ["Core", "Hombros", "Cardio"],
    difficulty: "principiante",
    description: "Ejercicio dinámico para core y cardio",
    requiresGym: false,
    caloriesPerRep: 7
  },
  
  // Ejercicios con máquinas
  {
    id: "press-banca-exercise",
    name: "Press de Banca",
    emoji: "🏋️",
    equipment: ["press-banca"],
    muscleGroups: ["Pecho", "Tríceps", "Hombros"],
    difficulty: "principiante",
    description: "Acostado en el banco, empujar la barra hacia arriba",
    requiresGym: true,
    caloriesPerRep: 8
  },
  {
    id: "prensa-piernas-exercise",
    name: "Prensa de Piernas",
    emoji: "🦵",
    equipment: ["prensa-piernas"],
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    difficulty: "principiante",
    description: "Sentado en la máquina, empujar la plataforma con las piernas",
    requiresGym: true,
    caloriesPerRep: 12
  },
  {
    id: "polea-alta-exercise",
    name: "Jalón al Pecho",
    emoji: "⛓️",
    equipment: ["polea-alta"],
    muscleGroups: ["Espalda", "Bíceps"],
    difficulty: "principiante",
    description: "Sentado, tirar de la barra hacia el pecho",
    requiresGym: true,
    caloriesPerRep: 7
  },
  {
    id: "extension-pierna-exercise",
    name: "Extensión de Pierna",
    emoji: "🦿",
    equipment: ["extension-pierna"],
    muscleGroups: ["Cuádriceps"],
    difficulty: "principiante",
    description: "Sentado en la máquina, extender las piernas",
    requiresGym: true,
    caloriesPerRep: 6
  },
  
  // Ejercicios con peso libre
  {
    id: "curl-biceps",
    name: "Curl de Bíceps",
    emoji: "💪",
    equipment: ["mancuernas"],
    muscleGroups: ["Bíceps", "Antebrazos"],
    difficulty: "principiante",
    description: "De pie, flexionar los codos llevando las mancuernas hacia los hombros",
    requiresGym: false,
    caloriesPerRep: 4
  },
  {
    id: "dominadas",
    name: "Dominadas",
    emoji: "🧗",
    equipment: ["barra-dominadas"],
    muscleGroups: ["Espalda", "Bíceps", "Antebrazos"],
    difficulty: "intermedio",
    description: "Colgado de la barra, levantar el cuerpo hasta que el mentón supere la barra",
    requiresGym: true,
    caloriesPerRep: 9
  },
  {
    id: "fondos",
    name: "Fondos en Paralelas",
    emoji: "🤸",
    equipment: ["barra-paralelas"],
    muscleGroups: ["Tríceps", "Pecho", "Hombros"],
    difficulty: "intermedio",
    description: "Sostenido en las barras paralelas, bajar y subir el cuerpo",
    requiresGym: true,
    caloriesPerRep: 8
  }
];

export const muscleGroups = [
  "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Antebrazos", 
  "Cuádriceps", "Isquiotibiales", "Glúteos", "Aductores", "Abductores", 
  "Pantorrillas", "Abdominales", "Core", "Espalda baja", "Full body"
];

export const equipmentCategories = [
  "Máquina con Peso", "Multiestación", "Polea", "Máquina de Aislamiento", 
  "Asistida", "Peso Libre", "Cardio"
];
