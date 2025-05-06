
#!/bin/bash

# GymFlow App Setup Script
# This script sets up the GymFlow application with MySQL and email configuration

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}       GymFlow App Setup Script         ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js before running this script.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm before running this script.${NC}"
    exit 1
fi

# Create .env file
ENV_FILE=".env"

echo -e "${YELLOW}Setting up configuration...${NC}"

# MySQL Configuration
echo -e "${BLUE}MySQL Database Configuration${NC}"
read -p "MySQL Host (default: localhost): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "MySQL Port (default: 3306): " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -p "MySQL User: " MYSQL_USER

read -s -p "MySQL Password: " MYSQL_PASSWORD
echo ""

read -p "MySQL Database (default: gymflow): " MYSQL_DATABASE
MYSQL_DATABASE=${MYSQL_DATABASE:-gymflow}

# SMTP Configuration
echo -e "\n${BLUE}SMTP Email Configuration${NC}"
read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST

read -p "SMTP Port (default: 587): " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}

read -p "SMTP User (email): " SMTP_USER

read -s -p "SMTP Password: " SMTP_PASSWORD
echo ""

read -p "From Email (default: $SMTP_USER): " FROM_EMAIL
FROM_EMAIL=${FROM_EMAIL:-$SMTP_USER}

read -p "Use secure connection (SSL/TLS)? (y/n, default: n): " USE_SECURE
USE_SECURE=$(echo $USE_SECURE | tr '[:upper:]' '[:lower:]')

if [[ $USE_SECURE == "y" || $USE_SECURE == "yes" ]]; then
    SMTP_SECURE="true"
    read -p "Secure type (SSL/TLS, default: TLS): " SECURE_TYPE
    SECURE_TYPE=$(echo $SECURE_TYPE | tr '[:lower:]' '[:upper:]')
    if [[ $SECURE_TYPE != "SSL" ]]; then
        SECURE_TYPE="TLS"
    fi
else
    SMTP_SECURE="false"
    SECURE_TYPE="TLS"
fi

# User Profile Configuration
echo -e "\n${BLUE}User Profile Configuration${NC}"
read -p "Your Name: " USER_NAME
read -p "Your Email: " USER_EMAIL

# Create MySQL Database if it doesn't exist
echo -e "\n${YELLOW}Checking MySQL database...${NC}"
if command -v mysql &> /dev/null; then
    # Check if we can connect without a password
    if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e ";" &> /dev/null; then
        echo -e "${GREEN}MySQL connection successful.${NC}"
        
        # Check if database exists
        if ! mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" &> /dev/null; then
            echo -e "${YELLOW}Database '$MYSQL_DATABASE' does not exist. Creating it...${NC}"
            mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE $MYSQL_DATABASE"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Database created successfully.${NC}"
            else
                echo -e "${RED}Failed to create database. Please create it manually.${NC}"
            fi
        else
            echo -e "${GREEN}Database '$MYSQL_DATABASE' already exists.${NC}"
            
            # Drop all tables in the database for a clean install
            echo -e "${YELLOW}Clearing existing database tables for a clean installation...${NC}"
            TABLES=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -s -N -e "SHOW TABLES FROM $MYSQL_DATABASE;")
            
            if [ -n "$TABLES" ]; then
                echo -e "${YELLOW}Dropping existing tables...${NC}"
                
                # Disable foreign key checks temporarily
                mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SET FOREIGN_KEY_CHECKS = 0;" $MYSQL_DATABASE
                
                # Drop each table
                for table in $TABLES; do
                    echo -e "Dropping table: $table"
                    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "DROP TABLE IF EXISTS \`$table\`;" $MYSQL_DATABASE
                done
                
                # Re-enable foreign key checks
                mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SET FOREIGN_KEY_CHECKS = 1;" $MYSQL_DATABASE
                
                echo -e "${GREEN}All tables dropped successfully.${NC}"
            else
                echo -e "${GREEN}No existing tables found. Database is already clean.${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}Could not connect to MySQL. You may need to create the database manually.${NC}"
    fi
else
    echo -e "${YELLOW}MySQL client not found. You may need to create the database manually.${NC}"
fi

# Create .env file
echo "# GymFlow App Configuration" > $ENV_FILE
echo "# Generated on $(date)" >> $ENV_FILE
echo "" >> $ENV_FILE
echo "# MySQL Configuration" >> $ENV_FILE
echo "MYSQL_HOST=\"$MYSQL_HOST\"" >> $ENV_FILE
echo "MYSQL_PORT=\"$MYSQL_PORT\"" >> $ENV_FILE
echo "MYSQL_USER=\"$MYSQL_USER\"" >> $ENV_FILE
echo "MYSQL_PASSWORD=\"$MYSQL_PASSWORD\"" >> $ENV_FILE
echo "MYSQL_DATABASE=\"$MYSQL_DATABASE\"" >> $ENV_FILE
echo "" >> $ENV_FILE
echo "# SMTP Configuration" >> $ENV_FILE
echo "SMTP_HOST=\"$SMTP_HOST\"" >> $ENV_FILE
echo "SMTP_PORT=\"$SMTP_PORT\"" >> $ENV_FILE
echo "SMTP_USER=\"$SMTP_USER\"" >> $ENV_FILE
echo "SMTP_PASSWORD=\"$SMTP_PASSWORD\"" >> $ENV_FILE
echo "FROM_EMAIL=\"$FROM_EMAIL\"" >> $ENV_FILE
echo "SMTP_SECURE=\"$SMTP_SECURE\"" >> $ENV_FILE
echo "SMTP_SECURE_TYPE=\"$SECURE_TYPE\"" >> $ENV_FILE
echo "" >> $ENV_FILE
echo "# App Configuration" >> $ENV_FILE
echo "APP_NAME=\"GymFlow\"" >> $ENV_FILE
echo "DEBUG_MODE=\"false\"" >> $ENV_FILE
echo "INITIALIZED=\"false\"" >> $ENV_FILE

echo -e "${GREEN}Configuration file created successfully.${NC}"

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Build the frontend
echo -e "\n${YELLOW}Building frontend...${NC}"
npm run build

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd api && npm install && cd ..

echo -e "${GREEN}GymFlow app setup completed successfully!${NC}"

# Save user profile
cat > user_profile.json << EOF
{
  "email": "$USER_EMAIL",
  "name": "$USER_NAME",
  "notificationsEnabled": true
}
EOF

echo -e "\n${BLUE}User profile saved to user_profile.json${NC}"
echo -e "${YELLOW}This file will be imported automatically when the app starts.${NC}"

echo -e "\n${BLUE}To start the application:${NC}"
echo -e "For development: ${YELLOW}npm run dev${NC}"
echo -e "For production: ${YELLOW}node api/server.js${NC}"
echo -e "\nFor production use, we recommend using PM2:${NC}"
echo -e "${YELLOW}npm install -g pm2${NC}"
echo -e "${YELLOW}pm2 start api/server.js --name \"gymflow\"${NC}"
echo -e "${YELLOW}pm2 startup${NC} (to enable startup on boot)"
echo -e "${YELLOW}pm2 save${NC} (to save the current process list)"

echo -e "\nThe app will be available at: ${GREEN}http://localhost:3000${NC}"
echo -e "${BLUE}=========================================${NC}"
