
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
   - Conexión a MySQL
   - Conexión SMTP para envío de correos (con soporte para SSL/TLS)
   - Tu perfil de usuario
   - Instalará todas las dependencias necesarias
   - Construirá la aplicación frontend

3. Una vez configurado, inicia el servidor:
   ```bash
   node api/server.js
   ```

4. La aplicación estará disponible en: http://localhost:3000

## Estructura de la base de datos

El sistema crea automáticamente las siguientes tablas:

- `equipment`: Almacena información sobre el equipamiento de gimnasio
- `exercises`: Almacena ejercicios personalizados
- `routines`: Almacena rutinas de entrenamiento
- `user_profiles`: Almacena perfiles de usuario

## Funcionamiento en Producción

En producción, la aplicación:

1. Se conecta a la base de datos MySQL configurada
2. Utiliza nodemailer para enviar correos a través del servidor SMTP configurado
3. Sirve la aplicación web desde una única instalación

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
