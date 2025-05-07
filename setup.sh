
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

# Main MySQL Configuration
echo -e "${BLUE}Main MySQL Database Configuration${NC}"
read -p "MySQL Host (default: localhost): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "MySQL Port (default: 3306): " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -p "MySQL User: " MYSQL_USER

read -s -p "MySQL Password: " MYSQL_PASSWORD
echo ""

read -p "MySQL Database (default: gymflow): " MYSQL_DATABASE
MYSQL_DATABASE=${MYSQL_DATABASE:-gymflow}

# Routines MySQL Configuration
echo -e "\n${BLUE}Routines MySQL Database Configuration${NC}"
read -p "Use same MySQL server for routines? (y/n, default: y): " USE_SAME_MYSQL_SERVER
USE_SAME_MYSQL_SERVER=${USE_SAME_MYSQL_SERVER:-y}
USE_SAME_MYSQL_SERVER=$(echo $USE_SAME_MYSQL_SERVER | tr '[:upper:]' '[:lower:]')

if [[ $USE_SAME_MYSQL_SERVER == "y" || $USE_SAME_MYSQL_SERVER == "yes" ]]; then
    ROUTINES_MYSQL_HOST=$MYSQL_HOST
    ROUTINES_MYSQL_PORT=$MYSQL_PORT
    ROUTINES_MYSQL_USER=$MYSQL_USER
    ROUTINES_MYSQL_PASSWORD=$MYSQL_PASSWORD
    read -p "Routines Database Name (default: gymflow_routines): " ROUTINES_MYSQL_DATABASE
    ROUTINES_MYSQL_DATABASE=${ROUTINES_MYSQL_DATABASE:-gymflow_routines}
else
    read -p "Routines MySQL Host (default: localhost): " ROUTINES_MYSQL_HOST
    ROUTINES_MYSQL_HOST=${ROUTINES_MYSQL_HOST:-localhost}
    
    read -p "Routines MySQL Port (default: 3306): " ROUTINES_MYSQL_PORT
    ROUTINES_MYSQL_PORT=${ROUTINES_MYSQL_PORT:-3306}
    
    read -p "Routines MySQL User: " ROUTINES_MYSQL_USER
    
    read -s -p "Routines MySQL Password: " ROUTINES_MYSQL_PASSWORD
    echo ""
    
    read -p "Routines MySQL Database (default: gymflow_routines): " ROUTINES_MYSQL_DATABASE
    ROUTINES_MYSQL_DATABASE=${ROUTINES_MYSQL_DATABASE:-gymflow_routines}
fi

# Authentication MySQL Configuration
echo -e "\n${BLUE}Authentication MySQL Database Configuration${NC}"
read -p "Use same MySQL server for authentication? (y/n, default: y): " USE_SAME_AUTH_MYSQL_SERVER
USE_SAME_AUTH_MYSQL_SERVER=${USE_SAME_AUTH_MYSQL_SERVER:-y}
USE_SAME_AUTH_MYSQL_SERVER=$(echo $USE_SAME_AUTH_MYSQL_SERVER | tr '[:upper:]' '[:lower:]')

if [[ $USE_SAME_AUTH_MYSQL_SERVER == "y" || $USE_SAME_AUTH_MYSQL_SERVER == "yes" ]]; then
    AUTH_MYSQL_HOST=$MYSQL_HOST
    AUTH_MYSQL_PORT=$MYSQL_PORT
    AUTH_MYSQL_USER=$MYSQL_USER
    AUTH_MYSQL_PASSWORD=$MYSQL_PASSWORD
    read -p "Auth Database Name (default: gymflow_auth): " AUTH_MYSQL_DATABASE
    AUTH_MYSQL_DATABASE=${AUTH_MYSQL_DATABASE:-gymflow_auth}
else
    read -p "Auth MySQL Host (default: localhost): " AUTH_MYSQL_HOST
    AUTH_MYSQL_HOST=${AUTH_MYSQL_HOST:-localhost}
    
    read -p "Auth MySQL Port (default: 3306): " AUTH_MYSQL_PORT
    AUTH_MYSQL_PORT=${AUTH_MYSQL_PORT:-3306}
    
    read -p "Auth MySQL User: " AUTH_MYSQL_USER
    
    read -s -p "Auth MySQL Password: " AUTH_MYSQL_PASSWORD
    echo ""
    
    read -p "Auth MySQL Database (default: gymflow_auth): " AUTH_MYSQL_DATABASE
    AUTH_MYSQL_DATABASE=${AUTH_MYSQL_DATABASE:-gymflow_auth}
fi

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
    if [[ $SECURE_TYPE != "SSL" && $SECURE_TYPE != "TLS" ]]; then
        SECURE_TYPE="TLS"
    fi
else
    SMTP_SECURE="false"
    SECURE_TYPE="TLS"
fi

# Authentication settings
echo -e "\n${BLUE}Authentication Settings${NC}"
read -p "Enable authentication requirement? (y/n, default: n): " AUTH_REQUIRED
AUTH_REQUIRED=$(echo $AUTH_REQUIRED | tr '[:upper:]' '[:lower:]')

if [[ $AUTH_REQUIRED == "y" || $AUTH_REQUIRED == "yes" ]]; then
    AUTH_REQUIRED_ENV="true"
else
    AUTH_REQUIRED_ENV="false"
fi

# Test connections if we're on a system with those tools
echo -e "\n${YELLOW}Would you like to test connections before saving? (y/n, default: y): ${NC}"
read TEST_CONNECTIONS
TEST_CONNECTIONS=${TEST_CONNECTIONS:-y}
TEST_CONNECTIONS=$(echo $TEST_CONNECTIONS | tr '[:upper:]' '[:lower:]')

if [[ $TEST_CONNECTIONS == "y" || $TEST_CONNECTIONS == "yes" ]]; then
    # Test Main MySQL connection if mysql client is available
    if command -v mysql &> /dev/null; then
        echo -e "\n${YELLOW}Testing Main MySQL connection...${NC}"
        if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" &> /dev/null; then
            echo -e "${GREEN}Main MySQL connection successful!${NC}"
        else
            echo -e "${RED}Main MySQL connection failed. Please check your credentials.${NC}"
            read -p "Would you like to continue anyway? (y/n): " CONTINUE
            if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                echo -e "${RED}Setup aborted.${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}MySQL client not found. Skipping connection test.${NC}"
    fi
    
    # Test Routines MySQL connection if different from main
    if [[ $USE_SAME_MYSQL_SERVER != "y" && $USE_SAME_MYSQL_SERVER != "yes" ]]; then
        if command -v mysql &> /dev/null; then
            echo -e "\n${YELLOW}Testing Routines MySQL connection...${NC}"
            if mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -e "SELECT 1" &> /dev/null; then
                echo -e "${GREEN}Routines MySQL connection successful!${NC}"
            else
                echo -e "${RED}Routines MySQL connection failed. Please check your credentials.${NC}"
                read -p "Would you like to continue anyway? (y/n): " CONTINUE
                if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                    echo -e "${RED}Setup aborted.${NC}"
                    exit 1
                fi
            fi
        else
            echo -e "${YELLOW}MySQL client not found. Skipping connection test.${NC}"
        fi
    fi
    
    # Test Auth MySQL connection if different from main
    if [[ $USE_SAME_AUTH_MYSQL_SERVER != "y" && $USE_SAME_AUTH_MYSQL_SERVER != "yes" ]]; then
        if command -v mysql &> /dev/null; then
            echo -e "\n${YELLOW}Testing Auth MySQL connection...${NC}"
            if mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -e "SELECT 1" &> /dev/null; then
                echo -e "${GREEN}Auth MySQL connection successful!${NC}"
            else
                echo -e "${RED}Auth MySQL connection failed. Please check your credentials.${NC}"
                read -p "Would you like to continue anyway? (y/n): " CONTINUE
                if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                    echo -e "${RED}Setup aborted.${NC}"
                    exit 1
                fi
            fi
        else
            echo -e "${YELLOW}MySQL client not found. Skipping connection test.${NC}"
        fi
    fi
    
    # Test SMTP connection if curl is available
    if command -v curl &> /dev/null; then
        echo -e "\n${YELLOW}Testing SMTP connection...${NC}"
        # We can't easily test SMTP here, so just inform the user
        echo -e "${YELLOW}SMTP will be tested later during application startup.${NC}"
    fi
fi

# User Profile Configuration
echo -e "\n${BLUE}User Profile Configuration${NC}"
read -p "Your Name: " USER_NAME
read -p "Your Email: " USER_EMAIL

# Create MySQL Databases if they don't exist
echo -e "\n${YELLOW}Checking MySQL databases...${NC}"
if command -v mysql &> /dev/null; then
    # Check if we can connect without a password
    if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e ";" &> /dev/null; then
        echo -e "${GREEN}MySQL connection successful.${NC}"
        
        # Check if main database exists
        if ! mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" &> /dev/null; then
            echo -e "${YELLOW}Database '$MYSQL_DATABASE' does not exist. Creating it...${NC}"
            mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Database created successfully.${NC}"
            else
                echo -e "${RED}Failed to create database. Please create it manually.${NC}"
            fi
        else
            echo -e "${GREEN}Database '$MYSQL_DATABASE' already exists.${NC}"
            
            # Ask if we should wipe the database for a clean installation
            read -p "Do you want to clear the database for a clean installation? (y/n, default: n): " CLEAR_DB
            CLEAR_DB=$(echo $CLEAR_DB | tr '[:upper:]' '[:lower:]')
            
            if [[ $CLEAR_DB == "y" || $CLEAR_DB == "yes" ]]; then
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
        fi
        
        # Check if routines database exists
        if ! mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -e "USE $ROUTINES_MYSQL_DATABASE" &> /dev/null; then
            echo -e "${YELLOW}Routines database '$ROUTINES_MYSQL_DATABASE' does not exist. Creating it...${NC}"
            mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -e "CREATE DATABASE $ROUTINES_MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Routines database created successfully.${NC}"
            else
                echo -e "${RED}Failed to create routines database. Please create it manually.${NC}"
            fi
        else
            echo -e "${GREEN}Routines database '$ROUTINES_MYSQL_DATABASE' already exists.${NC}"
            
            # Ask if we should wipe the database for a clean installation
            read -p "Do you want to clear the routines database for a clean installation? (y/n, default: n): " CLEAR_ROUTINES_DB
            CLEAR_ROUTINES_DB=$(echo $CLEAR_ROUTINES_DB | tr '[:upper:]' '[:lower:]')
            
            if [[ $CLEAR_ROUTINES_DB == "y" || $CLEAR_ROUTINES_DB == "yes" ]]; then
                echo -e "${YELLOW}Clearing existing routines database tables for a clean installation...${NC}"
                TABLES=$(mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -s -N -e "SHOW TABLES FROM $ROUTINES_MYSQL_DATABASE;")
                
                if [ -n "$TABLES" ]; then
                    echo -e "${YELLOW}Dropping existing tables...${NC}"
                    
                    # Disable foreign key checks temporarily
                    mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -e "SET FOREIGN_KEY_CHECKS = 0;" $ROUTINES_MYSQL_DATABASE
                    
                    # Drop each table
                    for table in $TABLES; do
                        echo -e "Dropping table: $table"
                        mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -e "DROP TABLE IF EXISTS \`$table\`;" $ROUTINES_MYSQL_DATABASE
                    done
                    
                    # Re-enable foreign key checks
                    mysql -h "$ROUTINES_MYSQL_HOST" -P "$ROUTINES_MYSQL_PORT" -u "$ROUTINES_MYSQL_USER" -p"$ROUTINES_MYSQL_PASSWORD" -e "SET FOREIGN_KEY_CHECKS = 1;" $ROUTINES_MYSQL_DATABASE
                    
                    echo -e "${GREEN}All routines tables dropped successfully.${NC}"
                else
                    echo -e "${GREEN}No existing tables found. Routines database is already clean.${NC}"
                fi
            fi
        fi
        
        # Check if auth database exists
        if ! mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -e "USE $AUTH_MYSQL_DATABASE" &> /dev/null; then
            echo -e "${YELLOW}Auth database '$AUTH_MYSQL_DATABASE' does not exist. Creating it...${NC}"
            mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -e "CREATE DATABASE $AUTH_MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Auth database created successfully.${NC}"
            else
                echo -e "${RED}Failed to create auth database. Please create it manually.${NC}"
            fi
        else
            echo -e "${GREEN}Auth database '$AUTH_MYSQL_DATABASE' already exists.${NC}"
            
            # Ask if we should wipe the database for a clean installation
            read -p "Do you want to clear the auth database for a clean installation? (y/n, default: n): " CLEAR_AUTH_DB
            CLEAR_AUTH_DB=$(echo $CLEAR_AUTH_DB | tr '[:upper:]' '[:lower:]')
            
            if [[ $CLEAR_AUTH_DB == "y" || $CLEAR_AUTH_DB == "yes" ]]; then
                echo -e "${YELLOW}Clearing existing auth database tables for a clean installation...${NC}"
                TABLES=$(mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -s -N -e "SHOW TABLES FROM $AUTH_MYSQL_DATABASE;")
                
                if [ -n "$TABLES" ]; then
                    echo -e "${YELLOW}Dropping existing tables...${NC}"
                    
                    # Disable foreign key checks temporarily
                    mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -e "SET FOREIGN_KEY_CHECKS = 0;" $AUTH_MYSQL_DATABASE
                    
                    # Drop each table
                    for table in $TABLES; do
                        echo -e "Dropping table: $table"
                        mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -e "DROP TABLE IF EXISTS \`$table\`;" $AUTH_MYSQL_DATABASE
                    done
                    
                    # Re-enable foreign key checks
                    mysql -h "$AUTH_MYSQL_HOST" -P "$AUTH_MYSQL_PORT" -u "$AUTH_MYSQL_USER" -p"$AUTH_MYSQL_PASSWORD" -e "SET FOREIGN_KEY_CHECKS = 1;" $AUTH_MYSQL_DATABASE
                    
                    echo -e "${GREEN}All auth tables dropped successfully.${NC}"
                else
                    echo -e "${GREEN}No existing tables found. Auth database is already clean.${NC}"
                fi
            fi
        fi
        
    else
        echo -e "${YELLOW}Could not connect to MySQL. You may need to create the databases manually.${NC}"
    fi
else
    echo -e "${YELLOW}MySQL client not found. You may need to create the databases manually.${NC}"
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
echo "# Routines Database Configuration" >> $ENV_FILE
echo "ROUTINES_MYSQL_HOST=\"$ROUTINES_MYSQL_HOST\"" >> $ENV_FILE
echo "ROUTINES_MYSQL_PORT=\"$ROUTINES_MYSQL_PORT\"" >> $ENV_FILE
echo "ROUTINES_MYSQL_USER=\"$ROUTINES_MYSQL_USER\"" >> $ENV_FILE
echo "ROUTINES_MYSQL_PASSWORD=\"$ROUTINES_MYSQL_PASSWORD\"" >> $ENV_FILE
echo "ROUTINES_MYSQL_DATABASE=\"$ROUTINES_MYSQL_DATABASE\"" >> $ENV_FILE
echo "" >> $ENV_FILE
echo "# Authentication Database Configuration" >> $ENV_FILE
echo "AUTH_MYSQL_HOST=\"$AUTH_MYSQL_HOST\"" >> $ENV_FILE
echo "AUTH_MYSQL_PORT=\"$AUTH_MYSQL_PORT\"" >> $ENV_FILE
echo "AUTH_MYSQL_USER=\"$AUTH_MYSQL_USER\"" >> $ENV_FILE
echo "AUTH_MYSQL_PASSWORD=\"$AUTH_MYSQL_PASSWORD\"" >> $ENV_FILE
echo "AUTH_MYSQL_DATABASE=\"$AUTH_MYSQL_DATABASE\"" >> $ENV_FILE
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
echo "# Authentication Configuration" >> $ENV_FILE
echo "AUTH_REQUIRED=\"$AUTH_REQUIRED_ENV\"" >> $ENV_FILE
echo "" >> $ENV_FILE
echo "# App Configuration" >> $ENV_FILE
echo "APP_NAME=\"GymFlow\"" >> $ENV_FILE
echo "DEBUG_MODE=\"false\"" >> $ENV_FILE
echo "INITIALIZED=\"false\"" >> $ENV_FILE

echo -e "${GREEN}Configuration file created successfully.${NC}"

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd api && npm install && cd ..

# Build the frontend
echo -e "\n${YELLOW}Building frontend...${NC}"
npm run build

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
echo -e "For production: ${YELLOW}npm run start${NC}"
echo -e "\nFor production use, we recommend using PM2:${NC}"
echo -e "${YELLOW}npm install -g pm2${NC}"
echo -e "${YELLOW}pm2 start api/server.js --name \"gymflow\"${NC}"
echo -e "${YELLOW}pm2 startup${NC} (to enable startup on boot)"
echo -e "${YELLOW}pm2 save${NC} (to save the current process list)"

echo -e "\nThe app will be available at: ${GREEN}http://localhost:3000${NC}"
echo -e "${BLUE}=========================================${NC}"
