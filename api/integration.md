
# Integración de GymFlow con MySQL y Email

Este documento explica cómo integrar GymFlow con servidores MySQL y SMTP para producción.

## Requisitos

- Node.js (v14 o superior recomendado)
- npm (v7 o superior recomendado)
- Servidor MySQL
- Servidor SMTP (para emails)

## Instalación

1. Ejecuta el script de configuración:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. Este script te guiará para configurar:
   - Conexión a MySQL (intentará crear la base de datos si no existe y borrará todas las tablas existentes para una instalación limpia)
   - Conexión SMTP para envío de correos (con soporte para SSL/TLS)
   - Tu perfil de usuario
   - Instalará todas las dependencias necesarias
   - Construirá la aplicación frontend
   - Creará un archivo .env con todas las configuraciones

3. Una vez configurado, inicia el servidor:
   ```bash
   # Para desarrollo
   npm run dev
   
   # Para producción
   node api/server.js
   
   # Para producción con PM2 (recomendado)
   npm install -g pm2
   pm2 start api/server.js --name "gymflow"
   pm2 startup
   pm2 save
   ```

4. La aplicación estará disponible en: http://localhost:3000

## Estructura de la base de datos

El sistema crea automáticamente las siguientes tablas:

- `equipment`: Almacena información sobre el equipamiento de gimnasio
- `exercises`: Almacena ejercicios personalizados
- `routines`: Almacena rutinas de entrenamiento
- `user_profiles`: Almacena perfiles de usuario
- `stats`: Almacena estadísticas de entrenamiento (calorías, tiempo, ejercicios completados)

## Inicialización de datos

El sistema inicializará automáticamente:

1. El perfil de usuario configurado durante la instalación
2. Un conjunto de ejercicios básicos predefinidos
3. Un conjunto de equipamiento básico predefinido
4. Estadísticas iniciales en cero para el usuario

Estos datos se cargarán automáticamente la primera vez que se inicie el servidor si las tablas están vacías.

## Funcionamiento en Producción

En producción, la aplicación:

1. Se conecta a la base de datos MySQL configurada
2. Utiliza nodemailer para enviar correos a través del servidor SMTP configurado
3. Sirve la aplicación web desde una única instalación
4. Sincroniza todas las estadísticas con la base de datos en tiempo real

## Variables de Entorno

La aplicación utiliza un archivo `.env` para la configuración. Las variables más importantes son:

```
# MySQL Configuration
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="usuario"
MYSQL_PASSWORD="contraseña"
MYSQL_DATABASE="gymflow"

# SMTP Configuration
SMTP_HOST="smtp.ejemplo.com"
SMTP_PORT="587"
SMTP_USER="usuario@ejemplo.com"
SMTP_PASSWORD="contraseña"
FROM_EMAIL="noreply@ejemplo.com"
SMTP_SECURE="true"  # o "false"
SMTP_SECURE_TYPE="TLS"  # o "SSL"

# App Configuration
APP_NAME="GymFlow"
DEBUG_MODE="false"
INITIALIZED="false"  # Cambia a "true" después de la inicialización
```

## Solución de problemas

Los logs se almacenan en la carpeta `api/logs`:
- `mysql.log`: Logs de conexión a la base de datos
- `email.log`: Logs de envío de correos
- `server.log`: Logs generales del servidor

Si encuentras problemas, revisa estos archivos para obtener más información.

## Ejecución con PM2 (recomendado para producción)

Para ejecutar la aplicación en producción, se recomienda usar PM2:

1. Instala PM2:
   ```bash
   npm install -g pm2
   ```

2. Inicia la aplicación:
   ```bash
   pm2 start api/server.js --name "gymflow"
   ```

3. Configura PM2 para arrancar automáticamente:
   ```bash
   pm2 startup
   pm2 save
   ```

## Actualización de la Aplicación

Para actualizar la aplicación:

1. Haz pull de los cambios:
   ```bash
   git pull
   ```

2. Reconstruye la aplicación:
   ```bash
   npm run build
   ```

3. Reinicia el servidor:
   ```bash
   pm2 restart gymflow
   ```

## Acceso a la Configuración en la Interfaz Web

Una vez que la aplicación esté en funcionamiento, puedes acceder a la configuración desde:

1. Menú principal > Ajustes
2. En la sección "Variables de Entorno (.env)" podrás ver y editar todas las configuraciones
3. Los cambios realizados en la interfaz web se aplicarán inmediatamente al sistema

## Sincronización de Estadísticas

La aplicación sincroniza automáticamente las siguientes estadísticas con la base de datos:

- Calorías quemadas durante los entrenamientos
- Tiempo total de entrenamiento
- Ejercicios completados
- Rutinas terminadas

Estas estadísticas se muestran en el panel principal y se actualizan en tiempo real.
