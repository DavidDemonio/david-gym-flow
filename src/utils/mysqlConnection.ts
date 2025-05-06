
/**
 * MySQL connection utility for the application
 * Handles connection to the database and provides CRUD operations
 */
import mysql from 'mysql2/promise';
import { envManager } from './envManager';
import nodemailer from 'nodemailer';

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
  private pool: mysql.Pool | null = null;
  private mailTransporter: nodemailer.Transporter | null = null;
  
  private constructor() {
    // Get saved configuration from localStorage
    const savedConfig = localStorage.getItem('mysql_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
      this.initConnection();
    }
    
    // Get saved email configuration
    const savedEmailConfig = localStorage.getItem('email_config');
    if (savedEmailConfig) {
      this.emailConfig = JSON.parse(savedEmailConfig);
      this.initMailTransporter();
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
  
  private async initConnection() {
    if (!this.config) return;
    
    try {
      // Close existing pool if it exists
      if (this.pool) {
        await this.pool.end();
      }
      
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      this.connected = true;
      this.log(`MySQL connection pool initialized: ${this.config.host}:${this.config.port}`);
      
      // Create necessary tables if they don't exist
      await this.initTables();
    } catch (err) {
      this.connected = false;
      this.log(`Error initializing MySQL connection: ${err}`);
      console.error('MySQL connection error:', err);
    }
  }
  
  private async initTables() {
    if (!this.pool) return;
    
    try {
      // Create equipment table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS equipment (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          muscleGroups JSON,
          emoji VARCHAR(10),
          category VARCHAR(100),
          caloriesPerHour INT,
          image VARCHAR(255)
        )
      `);
      
      // Create exercises table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS exercises (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          muscleGroups JSON,
          equipment JSON,
          difficulty VARCHAR(50),
          sets INT,
          reps VARCHAR(50),
          rest VARCHAR(50),
          calories INT,
          caloriesPerRep INT,
          emoji VARCHAR(10),
          requiresGym BOOLEAN,
          videoUrl VARCHAR(255)
        )
      `);
      
      // Create routines table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS routines (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          objetivo VARCHAR(100),
          nivel VARCHAR(50),
          equipamiento VARCHAR(100),
          dias INT,
          exercises JSON
        )
      `);
      
      // Create user_profiles table
      await this.pool.execute(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          notificationsEnabled BOOLEAN DEFAULT FALSE
        )
      `);
      
      this.log('Database tables initialized');
    } catch (err) {
      this.log(`Error initializing database tables: ${err}`);
      console.error('Error initializing tables:', err);
    }
  }
  
  private initMailTransporter() {
    if (!this.emailConfig) return;
    
    try {
      this.mailTransporter = nodemailer.createTransport({
        host: this.emailConfig.smtpHost,
        port: this.emailConfig.smtpPort,
        secure: this.emailConfig.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: this.emailConfig.smtpUser,
          pass: this.emailConfig.smtpPassword
        }
      });
      
      this.log(`SMTP transporter initialized: ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}`);
    } catch (err) {
      this.log(`Error initializing SMTP transporter: ${err}`);
      console.error('SMTP initialization error:', err);
    }
  }
  
  public async setConfig(config: DbConfig): Promise<void> {
    this.config = config;
    // Save to localStorage for persistence
    localStorage.setItem('mysql_config', JSON.stringify(config));
    await this.initConnection();
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
    this.initMailTransporter();
    this.log(`SMTP configuration updated: ${config.smtpHost}:${config.smtpPort}`);
  }
  
  public getEmailConfig(): EmailConfig | null {
    return this.emailConfig;
  }
  
  public async setUserProfile(profile: UserProfile): Promise<void> {
    this.userProfile = profile;
    localStorage.setItem('user_profile', JSON.stringify(profile));
    
    // Save user profile to database
    if (this.pool) {
      try {
        await this.pool.execute(
          'INSERT INTO user_profiles (email, name, notificationsEnabled) VALUES (?, ?, ?) ' +
          'ON DUPLICATE KEY UPDATE name = ?, notificationsEnabled = ?',
          [profile.email, profile.name || '', profile.notificationsEnabled || false,
           profile.name || '', profile.notificationsEnabled || false]
        );
        this.log(`User profile saved to database: ${profile.email}`);
      } catch (err) {
        this.log(`Error saving user profile to database: ${err}`);
        console.error('Error saving user profile:', err);
      }
    }
    
    this.log(`User profile updated: ${profile.email}`);
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
    
    if (!this.pool) {
      await this.initConnection();
    }
    
    try {
      if (!this.pool) throw new Error("No connection pool available");
      
      // Test connection by executing a simple query
      const [rows] = await this.pool.execute('SELECT 1 as test');
      this.log(`Connection test successful to ${this.config.host}:${this.config.port}`);
      return { 
        success: true, 
        message: `Conexión exitosa a ${this.config.database}@${this.config.host}` 
      };
    } catch (err) {
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
    
    if (!this.mailTransporter) {
      this.initMailTransporter();
    }
    
    try {
      if (!this.mailTransporter) throw new Error("No mail transporter available");
      
      // Verify SMTP connection
      const verify = await this.mailTransporter.verify();
      this.log(`SMTP test successful to ${this.emailConfig.smtpHost}:${this.emailConfig.smtpPort}`);
      return { 
        success: true, 
        message: `Conexión SMTP exitosa a ${this.emailConfig.smtpHost}` 
      };
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
    
    if (!this.mailTransporter) {
      this.initMailTransporter();
    }
    
    // Log the attempt
    this.log(`Attempting to send email to ${to}: ${subject}`);
    
    try {
      if (!this.mailTransporter) throw new Error("No mail transporter available");
      
      // Send email
      const info = await this.mailTransporter.sendMail({
        from: this.emailConfig.fromEmail,
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      });
      
      this.log(`Email sent successfully to ${to}, messageId: ${info.messageId}`);
      return { 
        success: true, 
        message: `Correo enviado correctamente a ${to}` 
      };
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
    if (!this.pool) {
      await this.initConnection();
      if (!this.pool) {
        this.log(`Error saving equipment: No database connection`);
        return false;
      }
    }
    
    try {
      // First clear the table
      await this.pool.execute('TRUNCATE TABLE equipment');
      
      // Then insert all equipment
      for (const item of equipment) {
        await this.pool.execute(
          'INSERT INTO equipment (name, description, muscleGroups, emoji, category, caloriesPerHour, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.name, item.description, JSON.stringify(item.muscleGroups), item.emoji, item.category, item.caloriesPerHour || 0, item.image || '/placeholder.svg']
        );
      }
      
      // Also save to localStorage as a fallback
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
    if (!this.pool) {
      await this.initConnection();
      if (!this.pool) {
        // Fallback to localStorage
        const data = localStorage.getItem('app_equipment');
        const equipment = data ? JSON.parse(data) : [];
        this.log(`Retrieved ${equipment.length} equipment items from localStorage (no database connection)`);
        return equipment;
      }
    }
    
    try {
      const [rows] = await this.pool.execute('SELECT * FROM equipment');
      const equipment = (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        muscleGroups: JSON.parse(row.muscleGroups),
        emoji: row.emoji,
        category: row.category,
        caloriesPerHour: row.caloriesPerHour,
        image: row.image
      }));
      
      // Update localStorage for backup
      localStorage.setItem('app_equipment', JSON.stringify(equipment));
      this.log(`Retrieved ${equipment.length} equipment items from database`);
      return equipment;
    } catch (err) {
      // Fallback to localStorage
      const data = localStorage.getItem('app_equipment');
      const equipment = data ? JSON.parse(data) : [];
      this.log(`Error retrieving equipment from database: ${err}. Using localStorage fallback.`);
      console.error('Error getting equipment:', err);
      return equipment;
    }
  }
  
  // Exercise CRUD operations
  public async saveExercises(exercises: Exercise[]): Promise<boolean> {
    if (!this.pool) {
      await this.initConnection();
      if (!this.pool) {
        this.log(`Error saving exercises: No database connection`);
        return false;
      }
    }
    
    try {
      // First clear the table
      await this.pool.execute('TRUNCATE TABLE exercises');
      
      // Then insert all exercises
      for (const exercise of exercises) {
        await this.pool.execute(
          'INSERT INTO exercises (name, description, muscleGroups, equipment, difficulty, sets, reps, rest, calories, caloriesPerRep, emoji, requiresGym, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            exercise.name,
            exercise.description,
            JSON.stringify(exercise.muscleGroups),
            JSON.stringify(exercise.equipment),
            exercise.difficulty,
            exercise.sets || 3,
            exercise.reps || '12',
            exercise.rest || '60s',
            exercise.calories || 0,
            exercise.caloriesPerRep || 0,
            exercise.emoji,
            exercise.requiresGym ? 1 : 0,
            exercise.videoUrl || null
          ]
        );
      }
      
      // Also save to localStorage as a fallback
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
    if (!this.pool) {
      await this.initConnection();
      if (!this.pool) {
        // Fallback to localStorage
        const data = localStorage.getItem('app_exercises');
        const exercises = data ? JSON.parse(data) : [];
        this.log(`Retrieved ${exercises.length} exercises from localStorage (no database connection)`);
        return exercises;
      }
    }
    
    try {
      const [rows] = await this.pool.execute('SELECT * FROM exercises');
      const exercises = (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        muscleGroups: JSON.parse(row.muscleGroups),
        equipment: JSON.parse(row.equipment),
        difficulty: row.difficulty,
        sets: row.sets,
        reps: row.reps,
        rest: row.rest,
        calories: row.calories,
        caloriesPerRep: row.caloriesPerRep,
        emoji: row.emoji,
        requiresGym: Boolean(row.requiresGym),
        videoUrl: row.videoUrl
      }));
      
      // Update localStorage for backup
      localStorage.setItem('app_exercises', JSON.stringify(exercises));
      this.log(`Retrieved ${exercises.length} exercises from database`);
      return exercises;
    } catch (err) {
      // Fallback to localStorage
      const data = localStorage.getItem('app_exercises');
      const exercises = data ? JSON.parse(data) : [];
      this.log(`Error retrieving exercises from database: ${err}. Using localStorage fallback.`);
      console.error('Error getting exercises:', err);
      return exercises;
    }
  }
  
  // Routine CRUD operations
  public async saveRoutines(routines: Routine[]): Promise<boolean> {
    if (!this.pool) {
      await this.initConnection();
      if (!this.pool) {
        this.log(`Error saving routines: No database connection`);
        return false;
      }
    }
    
    try {
      // First clear the table
      await this.pool.execute('TRUNCATE TABLE routines');
      
      // Then insert all routines
      for (const routine of routines) {
        await this.pool.execute(
          'INSERT INTO routines (name, objetivo, nivel, equipamiento, dias, exercises) VALUES (?, ?, ?, ?, ?, ?)',
          [
            routine.name,
            routine.objetivo,
            routine.nivel,
            routine.equipamiento,
            routine.dias,
            JSON.stringify(routine.exercises)
          ]
        );
      }
      
      // Also save to localStorage as a fallback
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
    if (!this.pool) {
      await this.initConnection();
      if (!this.pool) {
        // Fallback to localStorage
        const data = localStorage.getItem('app_routines');
        const routines = data ? JSON.parse(data) : [];
        this.log(`Retrieved ${routines.length} routines from localStorage (no database connection)`);
        return routines;
      }
    }
    
    try {
      const [rows] = await this.pool.execute('SELECT * FROM routines');
      const routines = (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        objetivo: row.objetivo,
        nivel: row.nivel,
        equipamiento: row.equipamiento,
        dias: row.dias,
        exercises: JSON.parse(row.exercises)
      }));
      
      // Update localStorage for backup
      localStorage.setItem('app_routines', JSON.stringify(routines));
      this.log(`Retrieved ${routines.length} routines from database`);
      return routines;
    } catch (err) {
      // Fallback to localStorage
      const data = localStorage.getItem('app_routines');
      const routines = data ? JSON.parse(data) : [];
      this.log(`Error retrieving routines from database: ${err}. Using localStorage fallback.`);
      console.error('Error getting routines:', err);
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
    if (this.pool) {
      try {
        await this.pool.end();
        this.log('Database connection pool closed');
      } catch (err) {
        this.log(`Error closing database connection pool: ${err}`);
        console.error('Error closing pool:', err);
      }
    }
    
    this.connected = false;
    this.config = null;
    this.pool = null;
    localStorage.removeItem('mysql_config');
    this.log('Disconnected from database');
  }
  
  // Load environment variables from envManager
  public async loadEnvVariables(): Promise<void> {
    const vars = envManager.getAll();
    
    // Apply MySQL config if available
    if (vars.MYSQL_HOST && vars.MYSQL_USER) {
      await this.setConfig({
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
  }
}

export const mysqlConnection = MySQLConnection.getInstance();

// Try to load environment variables on module import
setTimeout(() => {
  mysqlConnection.loadEnvVariables();
}, 0);
