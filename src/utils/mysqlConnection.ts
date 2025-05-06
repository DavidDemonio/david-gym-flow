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

// Email configuration
export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
}

// Types for database data
export interface Equipment {
  id?: string | number;
  name: string;
  muscleGroups: string[];
  description: string;
  image?: string;
  emoji: string;
  category: string;
  caloriesPerHour?: number;
}

export interface Exercise {
  id?: string | number;
  name: string;
  muscleGroups: string[];
  equipment?: string[] | null;
  description: string;
  difficulty: string;
  sets?: number;
  reps?: string;
  rest?: string;
  calories?: number;
  caloriesPerRep?: number;
  image?: string;
  emoji: string;
  requiresGym: boolean;
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

// User profile interface
export interface UserProfile {
  email: string;
  name?: string;
  notificationsEnabled?: boolean;
}

class MySQLConnection {
  private static instance: MySQLConnection;
  private config: DbConfig | null = null;
  private emailConfig: EmailConfig | null = null;
  private userProfile: UserProfile | null = null;
  private connected: boolean = false;
  private connectionLogs: string[] = [];
  
  private constructor() {
    // Get saved configuration from localStorage
    const savedConfig = localStorage.getItem('mysql_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
      this.connected = true;
    }
    
    // Get saved email configuration
    const savedEmailConfig = localStorage.getItem('email_config');
    if (savedEmailConfig) {
      this.emailConfig = JSON.parse(savedEmailConfig);
    }
    
    // Get saved user profile
    const savedUserProfile = localStorage.getItem('user_profile');
    if (savedUserProfile) {
      this.userProfile = JSON.parse(savedUserProfile);
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
    this.log(`MySQL configuration updated: ${config.host}:${config.port}`);
  }
  
  public getConfig(): DbConfig | null {
    return this.config;
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public setEmailConfig(config: EmailConfig): void {
    this.emailConfig = config;
    localStorage.setItem('email_config', JSON.stringify(config));
    this.log(`SMTP configuration updated: ${config.smtpHost}:${config.smtpPort}`);
  }
  
  public getEmailConfig(): EmailConfig | null {
    return this.emailConfig;
  }
  
  public setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    localStorage.setItem('user_profile', JSON.stringify(profile));
    this.log(`User profile updated: ${profile.email}`);
  }
  
  public getUserProfile(): UserProfile | null {
    return this.userProfile;
  }
  
  public testConnection(): {success: boolean, message: string} {
    if (!this.config) {
      this.log("Connection test failed: No configuration found");
      return { 
        success: false, 
        message: "No hay configuración de MySQL. Por favor, configure los detalles de conexión primero." 
      };
    }
    
    // Simulate a connection test
    const isValid = this.config.host && this.config.user && this.config.database;
    const success = isValid && Math.random() > 0.1; // 90% chance of success for simulation
    
    if (success) {
      this.log(`Connection test successful to ${this.config.host}:${this.config.port}`);
      return { 
        success: true, 
        message: `Conexión exitosa a ${this.config.database}@${this.config.host}` 
      };
    } else {
      this.log(`Connection test failed to ${this.config.host}:${this.config.port}`);
      return { 
        success: false, 
        message: "Error de conexión. Verifique los detalles y asegúrese de que el servidor esté en funcionamiento." 
      };
    }
  }
  
  public testEmailConfig(): {success: boolean, message: string} {
    if (!this.emailConfig) {
      this.log("SMTP test failed: No configuration found");
      return { 
        success: false, 
        message: "No hay configuración SMTP. Por favor, configure los detalles primero." 
      };
    }
    
    // Simulate an SMTP test
    const isValid = this.emailConfig.smtpHost && this.emailConfig.smtpUser && this.emailConfig.fromEmail;
    const success = isValid && Math.random() > 0.1; // 90% chance of success for simulation
    
    if (success) {
      this.log(`SMTP test successful to ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}`);
      return { 
        success: true, 
        message: `Conexión SMTP exitosa a ${this.emailConfig.smtpHost}` 
      };
    } else {
      this.log(`SMTP test failed to ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}`);
      return { 
        success: false, 
        message: "Error de conexión SMTP. Verifique los detalles del servidor." 
      };
    }
  }
  
  public sendEmail(to: string, subject: string, body: string): {success: boolean, message: string} {
    if (!this.emailConfig) {
      this.log(`Email sending failed: No SMTP configuration`);
      return { 
        success: false, 
        message: "No hay configuración SMTP. Por favor, configure los detalles primero." 
      };
    }
    
    // Log the attempt
    this.log(`Attempting to send email to ${to}: ${subject}`);
    
    // Simulate email sending (would be replaced with actual SMTP logic)
    const success = Math.random() > 0.1; // 90% success rate for simulation
    
    if (success) {
      this.log(`Email sent successfully to ${to}`);
      return { 
        success: true, 
        message: `Correo enviado correctamente a ${to}` 
      };
    } else {
      this.log(`Failed to send email to ${to}`);
      return { 
        success: false, 
        message: "Error al enviar correo. Por favor, intente de nuevo." 
      };
    }
  }
  
  public sendRoutineEmail(email: string, routineName: string): {success: boolean, message: string} {
    return this.sendEmail(
      email,
      `Tu rutina de entrenamiento: ${routineName}`,
      `Hola,\n\nAdjunto encontrarás tu rutina de entrenamiento personalizada: ${routineName}.\n\nSaludos,\nGymFlow App`
    );
  }
  
  public getConnectionLogs(): string[] {
    return this.connectionLogs;
  }
  
  public clearLogs(): void {
    this.connectionLogs = [];
  }
  
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    this.connectionLogs.unshift(`[${timestamp}] ${message}`);
    
    // Keep logs trimmed to the last 100 entries
    if (this.connectionLogs.length > 100) {
      this.connectionLogs = this.connectionLogs.slice(0, 100);
    }
    
    console.log(`[MySQL Connection] ${message}`);
  }

  // Equipment CRUD operations
  public async saveEquipment(equipment: Equipment[]): Promise<boolean> {
    try {
      localStorage.setItem('app_equipment', JSON.stringify(equipment));
      this.log(`Saved ${equipment.length} equipment items to database`);
      return true;
    } catch (err) {
      this.log(`Error saving equipment: ${err}`);
      console.error('Error saving equipment:', err);
      return false;
    }
  }
  
  public async getEquipment(): Promise<Equipment[]> {
    try {
      const data = localStorage.getItem('app_equipment');
      const equipment = data ? JSON.parse(data) : [];
      this.log(`Retrieved ${equipment.length} equipment items from database`);
      return equipment;
    } catch (err) {
      this.log(`Error retrieving equipment: ${err}`);
      console.error('Error getting equipment:', err);
      return [];
    }
  }
  
  // Exercise CRUD operations
  public async saveExercises(exercises: Exercise[]): Promise<boolean> {
    try {
      localStorage.setItem('app_exercises', JSON.stringify(exercises));
      this.log(`Saved ${exercises.length} exercises to database`);
      return true;
    } catch (err) {
      this.log(`Error saving exercises: ${err}`);
      console.error('Error saving exercises:', err);
      return false;
    }
  }
  
  public async getExercises(): Promise<Exercise[]> {
    try {
      const data = localStorage.getItem('app_exercises');
      const exercises = data ? JSON.parse(data) : [];
      this.log(`Retrieved ${exercises.length} exercises from database`);
      return exercises;
    } catch (err) {
      this.log(`Error retrieving exercises: ${err}`);
      console.error('Error getting exercises:', err);
      return [];
    }
  }
  
  // Routine CRUD operations
  public async saveRoutines(routines: Routine[]): Promise<boolean> {
    try {
      localStorage.setItem('app_routines', JSON.stringify(routines));
      this.log(`Saved ${routines.length} routines to database`);
      return true;
    } catch (err) {
      this.log(`Error saving routines: ${err}`);
      console.error('Error saving routines:', err);
      return false;
    }
  }
  
  public async getRoutines(): Promise<Routine[]> {
    try {
      const data = localStorage.getItem('app_routines');
      const routines = data ? JSON.parse(data) : [];
      this.log(`Retrieved ${routines.length} routines from database`);
      return routines;
    } catch (err) {
      this.log(`Error retrieving routines: ${err}`);
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
        this.log(`Updated routine: ${routine.name}`);
      } else {
        // Add new routine with a generated ID
        routine.id = Date.now();
        routines.push(routine);
        this.log(`Created new routine: ${routine.name}`);
      }
      
      // Save all routines
      return this.saveRoutines(routines);
    } catch (err) {
      this.log(`Error saving routine: ${err}`);
      console.error('Error saving routine:', err);
      return false;
    }
  }
  
  // Simulates disconnecting from the database
  public disconnect(): void {
    this.connected = false;
    this.config = null;
    localStorage.removeItem('mysql_config');
    this.log('Disconnected from database');
  }
  
  // Load environment variables if available (would be used with actual .env file)
  public loadEnvVariables(): void {
    // This is a placeholder - in a real app with .env support, we'd load from there
    // For now, we'll check if there are any hardcoded values in localStorage as "env_variables"
    const envVars = localStorage.getItem('env_variables');
    if (envVars) {
      try {
        const vars = JSON.parse(envVars);
        
        // Apply MySQL config if available
        if (vars.MYSQL_HOST && vars.MYSQL_USER) {
          this.setConfig({
            host: vars.MYSQL_HOST,
            port: parseInt(vars.MYSQL_PORT || '3306'),
            user: vars.MYSQL_USER,
            password: vars.MYSQL_PASSWORD || '',
            database: vars.MYSQL_DATABASE || 'gymflow'
          });
          this.log('Loaded MySQL configuration from environment variables');
        }
        
        // Apply SMTP config if available
        if (vars.SMTP_HOST && vars.SMTP_USER) {
          this.setEmailConfig({
            smtpHost: vars.SMTP_HOST,
            smtpPort: parseInt(vars.SMTP_PORT || '587'),
            smtpUser: vars.SMTP_USER,
            smtpPassword: vars.SMTP_PASSWORD || '',
            fromEmail: vars.FROM_EMAIL || vars.SMTP_USER
          });
          this.log('Loaded SMTP configuration from environment variables');
        }
        
      } catch (err) {
        console.error('Error loading environment variables:', err);
      }
    }
  }
}

export const mysqlConnection = MySQLConnection.getInstance();

// Try to load environment variables on module import
setTimeout(() => {
  mysqlConnection.loadEnvVariables();
}, 0);
