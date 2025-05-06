/**
 * MySQL connection utility for the application
 * Handles connection to the database and provides CRUD operations
 */
import { envManager } from './envManager';

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
  secure: boolean;
  secureType: 'SSL' | 'TLS';
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
  status?: string;
}

// User profile interface
export interface UserProfile {
  email: string;
  name?: string;
  notificationsEnabled?: boolean;
}

// Add routines database config interface
export interface RoutinesDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

class MySQLConnection {
  private static instance: MySQLConnection;
  private config: DbConfig | null = null;
  private emailConfig: EmailConfig | null = null;
  private userProfile: UserProfile | null = null;
  private connected: boolean = false;
  private connectionLogs: string[] = [];
  private connectionAttemptInProgress: boolean = false;
  private routinesDbConfig: RoutinesDbConfig | null = null;
  private routinesDbConnected: boolean = false;
  
  private constructor() {
    // Get saved configuration from localStorage
    const savedConfig = localStorage.getItem('mysql_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
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
    
    // Attempt to connect if we have config
    if (this.config) {
      this.initializeConnection();
    }
  }
  
  public static getInstance(): MySQLConnection {
    if (!MySQLConnection.instance) {
      MySQLConnection.instance = new MySQLConnection();
    }
    return MySQLConnection.instance;
  }
  
  private async initializeConnection() {
    if (!this.config || this.connectionAttemptInProgress) return;
    
    this.connectionAttemptInProgress = true;
    
    try {
      // For browser environment, we'll use the backend proxy approach
      const response = await fetch('/api/mysql/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.connected = true;
        this.log(`MySQL connection initialized: ${this.config.host}:${this.config.port}`);
        
        // If we have a user profile, save it to the database
        if (this.userProfile) {
          await this.setUserProfile(this.userProfile);
        }
      } else {
        this.connected = false;
        this.log(`Error initializing MySQL connection: ${result.error}`);
      }
    } catch (err) {
      this.connected = false;
      this.log(`Error initializing MySQL connection: ${err}`);
      console.error('MySQL connection error:', err);
    } finally {
      this.connectionAttemptInProgress = false;
    }
  }
  
  public async setConfig(config: DbConfig): Promise<void> {
    this.config = config;
    // Save to localStorage for persistence
    localStorage.setItem('mysql_config', JSON.stringify(config));
    await this.initializeConnection();
    this.log(`MySQL configuration updated: ${config.host}:${config.port}`);
  }
  
  public getConfig(): DbConfig | null {
    return this.config;
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public async setEmailConfig(config: EmailConfig): Promise<void> {
    this.emailConfig = config;
    localStorage.setItem('email_config', JSON.stringify(config));
    this.log(`SMTP configuration updated: ${config.smtpHost}:${config.smtpPort}`);
  }
  
  public getEmailConfig(): EmailConfig | null {
    return this.emailConfig;
  }
  
  public async setUserProfile(profile: UserProfile): Promise<void> {
    this.userProfile = profile;
    localStorage.setItem('user_profile', JSON.stringify(profile));
    
    // If connected, save to database too
    if (this.connected && this.config) {
      try {
        await this.saveUserProfileToDb(profile);
      } catch (err) {
        console.error('Error saving user profile to database:', err);
      }
    }
    
    this.log(`User profile updated: ${profile.email}`);
  }
  
  private async saveUserProfileToDb(profile: UserProfile): Promise<void> {
    if (!this.config) return;
    
    try {
      const response = await fetch('/api/mysql/save-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          profile
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error saving user profile to database:', err);
      throw err;
    }
  }
  
  public getUserProfile(): UserProfile | null {
    return this.userProfile;
  }
  
  public async testConnection(): Promise<{success: boolean, message: string}> {
    if (!this.config) {
      this.log("Connection test failed: No configuration found");
      return { 
        success: false, 
        message: "No hay configuración de MySQL. Por favor, configure los detalles de conexión primero." 
      };
    }
    
    try {
      const response = await fetch('/api/mysql/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.connected = true;
        this.log(`Connection test successful to ${this.config.host}:${this.config.port}`);
        return { 
          success: true, 
          message: `Conexión exitosa a ${this.config.database}@${this.config.host}` 
        };
      } else {
        this.connected = false;
        this.log(`Connection test failed to ${this.config.host}:${this.config.port}: ${result.error}`);
        return { 
          success: false, 
          message: `Error de conexión: ${result.error}. Verifique los detalles y asegúrese de que el servidor esté en funcionamiento.` 
        };
      }
    } catch (err) {
      this.connected = false;
      this.log(`Connection test failed to ${this.config.host}:${this.config.port}: ${err}`);
      return { 
        success: false, 
        message: `Error de conexión: ${err}. Verifique los detalles y asegúrese de que el servidor esté en funcionamiento.` 
      };
    }
  }
  
  public async testEmailConfig(): Promise<{success: boolean, message: string}> {
    if (!this.emailConfig) {
      this.log("SMTP test failed: No configuration found");
      return { 
        success: false, 
        message: "No hay configuración SMTP. Por favor, configure los detalles primero." 
      };
    }
    
    try {
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.emailConfig),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`SMTP test successful to ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}`);
        return { 
          success: true, 
          message: `Conexión SMTP exitosa a ${this.emailConfig.smtpHost}` 
        };
      } else {
        this.log(`SMTP test failed to ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}: ${result.error}`);
        return { 
          success: false, 
          message: `Error de conexión SMTP: ${result.error}. Verifique los detalles del servidor.` 
        };
      }
    } catch (err) {
      this.log(`SMTP test failed to ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}: ${err}`);
      return { 
        success: false, 
        message: `Error de conexión SMTP: ${err}. Verifique los detalles del servidor.` 
      };
    }
  }
  
  public async sendEmail(to: string, subject: string, body: string): Promise<{success: boolean, message: string}> {
    if (!this.emailConfig) {
      this.log(`Email sending failed: No SMTP configuration`);
      return { 
        success: false, 
        message: "No hay configuración SMTP. Por favor, configure los detalles primero." 
      };
    }
    
    // Log the attempt
    this.log(`Attempting to send email to ${to}: ${subject}`);
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.emailConfig,
          to,
          subject,
          body
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`Email sent successfully to ${to}`);
        return { 
          success: true, 
          message: `Correo enviado correctamente a ${to}` 
        };
      } else {
        this.log(`Failed to send email to ${to}: ${result.error}`);
        return { 
          success: false, 
          message: `Error al enviar correo: ${result.error}. Por favor, intente de nuevo.` 
        };
      }
    } catch (err) {
      this.log(`Failed to send email to ${to}: ${err}`);
      return { 
        success: false, 
        message: `Error al enviar correo: ${err}. Por favor, intente de nuevo.` 
      };
    }
  }
  
  public async sendRoutineEmail(email: string, routineName: string): Promise<{success: boolean, message: string}> {
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
      if (!this.connected || !this.config) {
        // Fallback to localStorage if not connected
        localStorage.setItem('app_equipment', JSON.stringify(equipment));
        this.log(`Saved ${equipment.length} equipment items to localStorage (offline mode)`);
        return true;
      }
      
      const response = await fetch('/api/mysql/save-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          equipment
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Also save to localStorage as backup
        localStorage.setItem('app_equipment', JSON.stringify(equipment));
        this.log(`Saved ${equipment.length} equipment items to database`);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      this.log(`Error saving equipment: ${err}`);
      console.error('Error saving equipment:', err);
      
      // Try to save to localStorage as fallback
      try {
        localStorage.setItem('app_equipment', JSON.stringify(equipment));
      } catch (localErr) {
        console.error('Error saving equipment to localStorage:', localErr);
      }
      
      return false;
    }
  }
  
  public async getEquipment(): Promise<Equipment[]> {
    try {
      if (!this.connected || !this.config) {
        // Fallback to localStorage if not connected
        const data = localStorage.getItem('app_equipment');
        const equipment = data ? JSON.parse(data) : [];
        this.log(`Retrieved ${equipment.length} equipment items from localStorage (offline mode)`);
        return equipment;
      }
      
      const response = await fetch('/api/mysql/get-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`Retrieved ${result.data.length} equipment items from database`);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      // Fallback to localStorage
      this.log(`Error retrieving equipment from database: ${err}`);
      console.error('Error getting equipment:', err);
      
      const data = localStorage.getItem('app_equipment');
      const equipment = data ? JSON.parse(data) : [];
      return equipment;
    }
  }
  
  // Exercise CRUD operations
  public async saveExercises(exercises: Exercise[]): Promise<boolean> {
    try {
      if (!this.connected || !this.config) {
        // Fallback to localStorage if not connected
        localStorage.setItem('app_exercises', JSON.stringify(exercises));
        this.log(`Saved ${exercises.length} exercises to localStorage (offline mode)`);
        return true;
      }
      
      const response = await fetch('/api/mysql/save-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          exercises
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Also save to localStorage as backup
        localStorage.setItem('app_exercises', JSON.stringify(exercises));
        this.log(`Saved ${exercises.length} exercises to database`);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      this.log(`Error saving exercises: ${err}`);
      console.error('Error saving exercises:', err);
      
      // Try to save to localStorage as fallback
      try {
        localStorage.setItem('app_exercises', JSON.stringify(exercises));
      } catch (localErr) {
        console.error('Error saving exercises to localStorage:', localErr);
      }
      
      return false;
    }
  }
  
  public async getExercises(): Promise<Exercise[]> {
    try {
      if (!this.connected || !this.config) {
        // Fallback to localStorage if not connected
        const data = localStorage.getItem('app_exercises');
        const exercises = data ? JSON.parse(data) : [];
        this.log(`Retrieved ${exercises.length} exercises from localStorage (offline mode)`);
        return exercises;
      }
      
      const response = await fetch('/api/mysql/get-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`Retrieved ${result.data.length} exercises from database`);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      // Fallback to localStorage
      this.log(`Error retrieving exercises from database: ${err}`);
      console.error('Error getting exercises:', err);
      
      const data = localStorage.getItem('app_exercises');
      const exercises = data ? JSON.parse(data) : [];
      return exercises;
    }
  }
  
  // Routine CRUD operations
  public async saveRoutines(routines: Routine[]): Promise<boolean> {
    // First try to save to the separate routines database
    if (this.routinesDbConfig && this.routinesDbConnected) {
      const result = await this.saveRoutinesToSeparateDb(routines);
      if (result) return true;
    }
    
    // Fallback to original method if separate db failed
    try {
      if (!this.connected || !this.config) {
        // Fallback to localStorage if not connected
        localStorage.setItem('app_routines', JSON.stringify(routines));
        this.log(`Saved ${routines.length} routines to localStorage (offline mode)`);
        return true;
      }
      
      const response = await fetch('/api/mysql/save-routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
          routines
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Also save to localStorage as backup
        localStorage.setItem('app_routines', JSON.stringify(routines));
        this.log(`Saved ${routines.length} routines to database`);
        return true;
      } else {
        throw new Error(result.error);
      }
      
      return true;
    } catch (err) {
      this.log(`Error saving routines: ${err}`);
      console.error('Error saving routines:', err);
      
      // Try to save to localStorage as fallback
      try {
        localStorage.setItem('app_routines', JSON.stringify(routines));
      } catch (localErr) {
        console.error('Error saving routines to localStorage:', localErr);
      }
      
      return false;
    }
  }
  
  public async getRoutines(): Promise<Routine[]> {
    // First try to get from the separate routines database
    if (this.routinesDbConfig && this.routinesDbConnected) {
      try {
        const routines = await this.getRoutinesFromSeparateDb();
        if (routines.length > 0) return routines;
      } catch (err) {
        console.error('Error getting routines from separate database:', err);
      }
    }
    
    // Fallback to original method if separate db failed
    try {
      if (!this.connected || !this.config) {
        // Fallback to localStorage if not connected
        const data = localStorage.getItem('app_routines');
        const routines = data ? JSON.parse(data) : [];
        this.log(`Retrieved ${routines.length} routines from localStorage (offline mode)`);
        return routines;
      }
      
      const response = await fetch('/api/mysql/get-routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`Retrieved ${result.data.length} routines from database`);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      this.log(`Error retrieving routines from database: ${err}`);
      console.error('Error getting routines:', err);
      
      const data = localStorage.getItem('app_routines');
      const routines = data ? JSON.parse(data) : [];
      return routines;
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
  public async disconnect(): Promise<void> {
    if (this.connected && this.config) {
      try {
        await fetch('/api/mysql/disconnect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.config),
        });
      } catch (err) {
        console.error('Error disconnecting from database:', err);
      }
    }
    
    this.connected = false;
    this.config = null;
    localStorage.removeItem('mysql_config');
    this.log('Disconnected from database');
  }
  
  // Initialize routines database connection
  private async initializeRoutinesDbConnection() {
    if (!this.routinesDbConfig || this.connectionAttemptInProgress) return;
    
    try {
      // Get routines database config from env variables
      const env = await envManager.getAllVariables();
      
      this.routinesDbConfig = {
        host: env.ROUTINES_MYSQL_HOST || '',
        port: parseInt(env.ROUTINES_MYSQL_PORT || '3306'),
        user: env.ROUTINES_MYSQL_USER || '',
        password: env.ROUTINES_MYSQL_PASSWORD || '',
        database: env.ROUTINES_MYSQL_DATABASE || ''
      };
      
      // Check if we have valid config
      if (!this.routinesDbConfig.host || !this.routinesDbConfig.user || !this.routinesDbConfig.database) {
        this.log('Routines database configuration is incomplete');
        this.routinesDbConnected = false;
        return;
      }
      
      // Initialize the routines database
      const response = await fetch('/api/mysql/initialize-routines-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.routinesDbConfig),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.routinesDbConnected = true;
        this.log(`Routines database initialized: ${this.routinesDbConfig.host}:${this.routinesDbConfig.port}`);
      } else {
        this.routinesDbConnected = false;
        this.log(`Error initializing routines database: ${result.error}`);
      }
    } catch (err) {
      this.routinesDbConnected = false;
      this.log(`Error initializing routines database: ${err}`);
      console.error('Routines database initialization error:', err);
    }
  }
  
  public async setRoutinesDbConfig(config: RoutinesDbConfig): Promise<void> {
    this.routinesDbConfig = config;
    
    // Save to environment variables
    await envManager.updateVariables({
      ROUTINES_MYSQL_HOST: config.host,
      ROUTINES_MYSQL_PORT: config.port.toString(),
      ROUTINES_MYSQL_USER: config.user,
      ROUTINES_MYSQL_PASSWORD: config.password,
      ROUTINES_MYSQL_DATABASE: config.database
    });
    
    // Initialize connection
    await this.initializeRoutinesDbConnection();
    
    this.log(`Routines database configuration updated: ${config.host}:${config.port}`);
  }
  
  // New method to get routine database configuration from environment
  public async getRoutinesDbConfig(): Promise<RoutinesDbConfig | null> {
    try {
      const env = await envManager.getAll();
      
      if (env.ROUTINES_MYSQL_HOST) {
        return {
          host: env.ROUTINES_MYSQL_HOST || '',
          port: parseInt(env.ROUTINES_MYSQL_PORT || '3306'),
          database: env.ROUTINES_MYSQL_DATABASE || '',
          user: env.ROUTINES_MYSQL_USER || '',
          password: env.ROUTINES_MYSQL_PASSWORD || ''
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting routines database config:", error);
      return null;
    }
  }
  
  public isRoutinesDbConnected(): boolean {
    return this.routinesDbConnected;
  }
  
  // Method to save routines to the separate database
  public async saveRoutinesToSeparateDb(routines: Routine[]): Promise<boolean> {
    if (!this.routinesDbConfig) {
      this.log('Cannot save routines: No routines database configuration');
      return false;
    }
    
    try {
      const response = await fetch('/api/mysql/save-routines-separate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig,
          routines
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`Saved ${routines.length} routines to separate database`);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      this.log(`Error saving routines to separate database: ${err}`);
      console.error('Error saving routines to separate database:', err);
      return false;
    }
  }
  
  // Method to get routines from the separate database
  public async getRoutinesFromSeparateDb(): Promise<Routine[]> {
    if (!this.routinesDbConfig) {
      this.log('Cannot get routines: No routines database configuration');
      return [];
    }
    
    try {
      const response = await fetch('/api/mysql/get-routines-separate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.routinesDbConfig
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.log(`Retrieved ${result.data.length} routines from separate database`);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      this.log(`Error getting routines from separate database: ${err}`);
      console.error('Error getting routines from separate database:', err);
      return [];
    }
  }
  
  // Add method to load environment variables with special handling for routines database
  public async loadEnvironmentVariables(): Promise<void> {
    const vars = await envManager.getAllVariables();
    
    // Apply MySQL config if available
    if (vars.MYSQL_HOST && vars.MYSQL_USER && vars.MYSQL_PASSWORD) {
      const config = {
        host: vars.MYSQL_HOST,
        port: parseInt(vars.MYSQL_PORT || '3306'),
        user: vars.MYSQL_USER,
        password: vars.MYSQL_PASSWORD,
        database: vars.MYSQL_DATABASE || 'gymflow'
      };
      
      // Only update if something changed
      if (JSON.stringify(this.config) !== JSON.stringify(config)) {
        await this.setConfig(config);
        this.log('Loaded MySQL configuration from environment variables');
      }
    }
    
    // Apply SMTP config if available
    if (vars.SMTP_HOST && vars.SMTP_USER && vars.SMTP_PASSWORD) {
      const emailConfig = {
        smtpHost: vars.SMTP_HOST,
        smtpPort: parseInt(vars.SMTP_PORT || '587'),
        smtpUser: vars.SMTP_USER,
        smtpPassword: vars.SMTP_PASSWORD,
        fromEmail: vars.FROM_EMAIL || vars.SMTP_USER,
        secure: vars.SMTP_SECURE === 'true',
        secureType: (vars.SMTP_SECURE_TYPE as 'SSL' | 'TLS') || 'TLS'
      };
      
      // Only update if something changed
      if (JSON.stringify(this.emailConfig) !== JSON.stringify(emailConfig)) {
        await this.setEmailConfig(emailConfig);
        this.log('Loaded SMTP configuration from environment variables');
      }
    }
    
    // Apply routines database config if available
    if (vars.ROUTINES_MYSQL_HOST && vars.ROUTINES_MYSQL_USER && vars.ROUTINES_MYSQL_DATABASE) {
      const config = {
        host: vars.ROUTINES_MYSQL_HOST,
        port: parseInt(vars.ROUTINES_MYSQL_PORT || '3306'),
        user: vars.ROUTINES_MYSQL_USER,
        password: vars.ROUTINES_MYSQL_PASSWORD || '',
        database: vars.ROUTINES_MYSQL_DATABASE
      };
      
      // Only update if something changed
      if (JSON.stringify(this.routinesDbConfig) !== JSON.stringify(config)) {
        this.routinesDbConfig = config;
        await this.initializeRoutinesDbConnection();
        this.log('Loaded routines database configuration from environment variables');
      }
    }
  }
  
  // Force reconnect to database
  public async reconnect(): Promise<boolean> {
    if (!this.config) return false;
    
    try {
      this.connected = false;
      await this.initializeConnection();
      return this.connected;
    } catch (err) {
      console.error('Error reconnecting to database:', err);
      return false;
    }
  }
}

export const mysqlConnection = MySQLConnection.getInstance();

// Try to load environment variables on module import
setTimeout(() => {
  mysqlConnection.loadEnvironmentVariables();
}, 0);
