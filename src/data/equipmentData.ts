
export interface Equipment {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  muscleGroups: string[];
  image?: string;
}

export const gymEquipment: Equipment[] = [
  {
    id: "press-banca",
    name: "Press de Banca",
    emoji: "🏋️",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de pecho con barra horizontal",
    muscleGroups: ["Pecho", "Tríceps", "Hombros"]
  },
  {
    id: "smith-machine",
    name: "Máquina Smith",
    emoji: "🔨",
    category: "Multiestación",
    description: "Máquina multiusos con barra guiada para diversos ejercicios",
    muscleGroups: ["Múltiples", "Pecho", "Piernas", "Hombros"]
  },
  {
    id: "prensa-piernas",
    name: "Prensa de Piernas",
    emoji: "🦵",
    category: "Máquina con Peso",
    description: "Máquina para trabajar cuádriceps y glúteos con resistencia",
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"]
  },
  {
    id: "polea-alta",
    name: "Polea Alta",
    emoji: "⛓️",
    category: "Polea",
    description: "Sistema de poleas para ejercicios de tracción hacia abajo",
    muscleGroups: ["Espalda", "Bíceps", "Hombros"]
  },
  {
    id: "polea-baja",
    name: "Polea Baja",
    emoji: "⛓️",
    category: "Polea",
    description: "Sistema de poleas para ejercicios de tracción hacia arriba",
    muscleGroups: ["Espalda", "Bíceps", "Antebrazo"]
  },
  {
    id: "extension-pierna",
    name: "Extensión de Pierna",
    emoji: "🦿",
    category: "Máquina de Aislamiento",
    description: "Máquina para aislar y trabajar los cuádriceps",
    muscleGroups: ["Cuádriceps"]
  },
  {
    id: "curl-femoral",
    name: "Curl Femoral",
    emoji: "🦵",
    category: "Máquina de Aislamiento",
    description: "Máquina para aislar y trabajar los isquiotibiales",
    muscleGroups: ["Isquiotibiales"]
  },
  {
    id: "aductor",
    name: "Máquina de Aductor",
    emoji: "🔄",
    category: "Máquina de Aislamiento",
    description: "Máquina para trabajar la cara interna del muslo",
    muscleGroups: ["Aductores"]
  },
  {
    id: "abductor",
    name: "Máquina de Abductor",
    emoji: "🔄",
    category: "Máquina de Aislamiento",
    description: "Máquina para trabajar la cara externa del muslo",
    muscleGroups: ["Abductores"]
  },
  {
    id: "press-hombro",
    name: "Press de Hombro",
    emoji: "💪",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de hombros con resistencia",
    muscleGroups: ["Hombros", "Tríceps"]
  },
  {
    id: "press-pecho",
    name: "Press de Pecho",
    emoji: "💪",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de pecho con resistencia",
    muscleGroups: ["Pecho", "Tríceps", "Hombros"]
  },
  {
    id: "remo-sentado",
    name: "Remo Sentado",
    emoji: "🚣",
    category: "Máquina con Peso",
    description: "Máquina para ejercicios de espalda en posición sentada",
    muscleGroups: ["Espalda", "Bíceps", "Antebrazos"]
  },
  {
    id: "maquina-dominadas",
    name: "Máquina de Dominadas Asistidas",
    emoji: "🧗",
    category: "Asistida",
    description: "Máquina para hacer dominadas con asistencia de contrapeso",
    muscleGroups: ["Espalda", "Bíceps", "Antebrazo"]
  },
  {
    id: "barra-dominadas",
    name: "Barra de Dominadas",
    emoji: "🏋️",
    category: "Peso Libre",
    description: "Barra fija para realizar dominadas y ejercicios de suspensión",
    muscleGroups: ["Espalda", "Bíceps", "Core"]
  },
  {
    id: "barra-paralelas",
    name: "Barras Paralelas",
    emoji: "🤸",
    category: "Peso Libre",
    description: "Barras para realizar fondos y ejercicios de tríceps",
    muscleGroups: ["Tríceps", "Pecho", "Hombros"]
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
    requiresGym: false
  },
  {
    id: "sentadillas",
    name: "Sentadillas",
    emoji: "🧎",
    equipment: null,
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    difficulty: "principiante",
    description: "Ejercicio básico para piernas usando el peso corporal",
    requiresGym: false
  },
  {
    id: "plancha",
    name: "Plancha",
    emoji: "🧘",
    equipment: null,
    muscleGroups: ["Core", "Abdominales", "Espalda baja"],
    difficulty: "principiante",
    description: "Ejercicio estático para fortalecer el core",
    requiresGym: false
  },
  {
    id: "burpees",
    name: "Burpees",
    emoji: "🏃",
    equipment: null,
    muscleGroups: ["Full body", "Cardio"],
    difficulty: "intermedio",
    description: "Ejercicio de alta intensidad que combina sentadilla, flexión y salto",
    requiresGym: false
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    emoji: "🧗",
    equipment: null,
    muscleGroups: ["Core", "Hombros", "Cardio"],
    difficulty: "principiante",
    description: "Ejercicio dinámico para core y cardio",
    requiresGym: false
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
    requiresGym: true
  },
  {
    id: "prensa-piernas-exercise",
    name: "Prensa de Piernas",
    emoji: "🦵",
    equipment: ["prensa-piernas"],
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    difficulty: "principiante",
    description: "Sentado en la máquina, empujar la plataforma con las piernas",
    requiresGym: true
  },
  {
    id: "polea-alta-exercise",
    name: "Jalón al Pecho",
    emoji: "⛓️",
    equipment: ["polea-alta"],
    muscleGroups: ["Espalda", "Bíceps"],
    difficulty: "principiante",
    description: "Sentado, tirar de la barra hacia el pecho",
    requiresGym: true
  },
  {
    id: "extension-pierna-exercise",
    name: "Extensión de Pierna",
    emoji: "🦿",
    equipment: ["extension-pierna"],
    muscleGroups: ["Cuádriceps"],
    difficulty: "principiante",
    description: "Sentado en la máquina, extender las piernas",
    requiresGym: true
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
    requiresGym: false
  },
  {
    id: "dominadas",
    name: "Dominadas",
    emoji: "🧗",
    equipment: ["barra-dominadas"],
    muscleGroups: ["Espalda", "Bíceps", "Antebrazos"],
    difficulty: "intermedio",
    description: "Colgado de la barra, levantar el cuerpo hasta que el mentón supere la barra",
    requiresGym: true
  },
  {
    id: "fondos",
    name: "Fondos en Paralelas",
    emoji: "🤸",
    equipment: ["barra-paralelas"],
    muscleGroups: ["Tríceps", "Pecho", "Hombros"],
    difficulty: "intermedio",
    description: "Sostenido en las barras paralelas, bajar y subir el cuerpo",
    requiresGym: true
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
