# Guía de Despliegue - Encuesta Maranata Spring
## Despliegue en Ubuntu con HTTPS, Nginx y MySQL

### Configuración Específica
- **Dominio**: maranata.laalameda.pe
- **Servidor Web**: Nginx con SSL/HTTPS
- **Base de Datos**: MySQL
- **Gestor de Procesos**: PM2
- **Path del Proyecto**: /var/www/vhosts/maranata.laalameda.pe/

## Requisitos del Sistema

### Servidor Ubuntu (20.04 LTS o superior)
- RAM: Mínimo 2GB (recomendado 4GB)
- Almacenamiento: Mínimo 20GB
- CPU: 2 cores (recomendado)
- Acceso SSH con privilegios sudo
- **Dominio configurado**: maranata.laalameda.pe apuntando a la IP del servidor

## Instalación Paso a Paso

### 1. Preparar el Servidor Ubuntu

\`\`\`bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y curl wget git build-essential

# Instalar Node.js 18+ (requerido para Next.js 14)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe ser v18+
npm --version
\`\`\`

### 2. Instalar y Configurar MySQL

\`\`\`bash
# Instalar MySQL
sudo apt update
sudo apt install -y mysql-server

# Configurar MySQL (seguir el asistente de configuración)
sudo mysql_secure_installation

# Acceder a MySQL como root
sudo mysql

# En el prompt de MySQL, crear base de datos y usuario:
CREATE DATABASE maranata_encuesta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'maranata_user'@'localhost' IDENTIFIED BY 'TuPasswordSeguro2024!';
GRANT ALL PRIVILEGES ON maranata_encuesta.* TO 'maranata_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Crear las tablas necesarias
mysql -u maranata_user -p maranata_encuesta
\`\`\`

SQL para crear las tablas:
\`\`\`sql
-- Tabla para almacenar las respuestas de la encuesta
CREATE TABLE survey_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    transporte VARCHAR(50) NOT NULL,
    num_participantes INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transporte (transporte),
    INDEX idx_created_at (created_at)
);

-- Insertar datos de prueba (opcional)
INSERT INTO survey_responses (nombre, telefono, transporte, num_participantes) VALUES
('Juan Pérez', '987654321', 'bus', 2),
('María García', '912345678', 'propio', 1);
\`\`\`

### 3. Instalar PM2 (Gestor de Procesos)

\`\`\`bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar con el sistema
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
\`\`\`

### 4. Configurar Nginx

\`\`\`bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración del sitio para maranata.laalameda.pe
sudo nano /etc/nginx/sites-available/maranata.laalameda.pe
\`\`\`

Contenido del archivo de configuración de Nginx:

\`\`\`nginx
server {
    listen 80;
    server_name maranata.laalameda.pe www.maranata.laalameda.pe;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name maranata.laalameda.pe www.maranata.laalameda.pe;

    # Configuración SSL (se completará con Certbot)
    ssl_certificate /etc/letsencrypt/live/maranata.laalameda.pe/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maranata.laalameda.pe/privkey.pem;
    
    # Configuraciones de seguridad SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Configuración del proxy hacia Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuración para archivos estáticos
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs específicos del sitio
    access_log /var/log/nginx/maranata.access.log;
    error_log /var/log/nginx/maranata.error.log;
}
\`\`\`

\`\`\`bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/maranata.laalameda.pe /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
\`\`\`

### 5. Configurar SSL con Let's Encrypt

\`\`\`bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL para maranata.laalameda.pe
sudo certbot --nginx -d maranata.laalameda.pe -d www.maranata.laalameda.pe

# Verificar renovación automática
sudo certbot renew --dry-run

# El certificado se renovará automáticamente cada 90 días
\`\`\`

### 6. Desplegar la Aplicación

\`\`\`bash
sudo mkdir -p /var/www/vhosts/maranata.laalameda.pe
sudo chown $USER:$USER /var/www/vhosts/maranata.laalameda.pe

# Navegar al directorio del vhost
cd /var/www/vhosts/maranata.laalameda.pe

# Clonar o subir el código
# Si tienes el código en Git:
# git clone tu-repositorio.git .
# O sube los archivos manualmente usando scp o rsync

# Instalar dependencias
npm install

# Agregar dependencia de MySQL
npm install mysql2

# Crear archivo de variables de entorno
nano .env.local
\`\`\`

Contenido del archivo `.env.local`:

\`\`\`bash
# Configuración de MySQL
DATABASE_URL=mysql://maranata_user:TuPasswordSeguro2024!@localhost:3306/maranata_encuesta

# Configuración de Next.js
NEXTAUTH_URL=https://maranata.laalameda.pe
NEXTAUTH_SECRET=tu_secret_muy_seguro_aqui_cambiar_por_uno_real

# Variables de entorno de producción
NODE_ENV=production
PORT=3000

# Configuración adicional para MySQL
MYSQL_HOST=localhost
MYSQL_USER=maranata_user
MYSQL_PASSWORD=TuPasswordSeguro2024!
MYSQL_DATABASE=maranata_encuesta
\`\`\`

\`\`\`bash
# Construir la aplicación
npm run build

nano ecosystem.config.js
\`\`\`

Contenido del archivo `ecosystem.config.js`:

\`\`\`javascript
module.exports = {
  apps: [{
    name: 'maranata-encuesta',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vhosts/maranata.laalameda.pe', // Path actualizado para vhost
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/maranata-error.log',
    out_file: '/var/log/pm2/maranata-out.log',
    log_file: '/var/log/pm2/maranata-combined.log',
    time: true
  }]
}
\`\`\`

\`\`\`bash
# Crear directorio para logs de PM2
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Iniciar la aplicación con PM2
pm2 start ecosystem.config.js
pm2 save  # Guardar configuración
\`\`\`

### 7. Configurar Firewall

\`\`\`bash
# Configurar UFW (Uncomplicated Firewall)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306  # MySQL (solo si necesitas acceso externo)
sudo ufw enable

# Verificar estado del firewall
sudo ufw status
\`\`\`

### 8. Configurar Backups Automáticos

\`\`\`bash
# Crear script de backup
sudo nano /usr/local/bin/backup-maranata.sh
\`\`\`

Contenido del script de backup:

\`\`\`bash
#!/bin/bash

# Configuración
DB_NAME="maranata_encuesta"
DB_USER="maranata_user"
DB_PASS="TuPasswordSeguro2024!"
BACKUP_DIR="/var/backups/maranata"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Backup de la base de datos
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www/vhosts maranata.laalameda.pe

# Eliminar backups antiguos (mantener solo los últimos 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
\`\`\`

\`\`\`bash
# Hacer el script ejecutable
sudo chmod +x /usr/local/bin/backup-maranata.sh

# Configurar cron para backup diario a las 2:00 AM
sudo crontab -e

# Agregar esta línea al crontab:
0 2 * * * /usr/local/bin/backup-maranata.sh >> /var/log/backup-maranata.log 2>&1
\`\`\`

## Comandos de Mantenimiento

### Gestión de la Aplicación
\`\`\`bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs maranata-encuesta

# Ver logs específicos
tail -f /var/log/pm2/maranata-combined.log

# Reiniciar aplicación
pm2 restart maranata-encuesta

# Detener aplicación
pm2 stop maranata-encuesta

cd /var/www/vhosts/maranata.laalameda.pe
git pull  # Si usas Git
npm install  # Si hay nuevas dependencias
npm run build
pm2 restart maranata-encuesta
\`\`\`

### Gestión de MySQL
\`\`\`bash
# Conectar a MySQL
mysql -u maranata_user -p maranata_encuesta

# Ver respuestas de la encuesta
SELECT * FROM survey_responses ORDER BY created_at DESC LIMIT 10;

# Backup manual
mysqldump -u maranata_user -p maranata_encuesta > backup_manual_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u maranata_user -p maranata_encuesta < backup_manual_20241225.sql
\`\`\`

### Monitoreo de Logs
\`\`\`bash
# Logs de Nginx
sudo tail -f /var/log/nginx/maranata.access.log
sudo tail -f /var/log/nginx/maranata.error.log

# Logs de la aplicación
pm2 logs maranata-encuesta --lines 100

# Logs del sistema
sudo journalctl -u nginx -f
sudo journalctl -u mysql -f
\`\`\`

## Verificación del Despliegue

### 1. Verificar servicios
\`\`\`bash
# Verificar que todos los servicios estén corriendo
sudo systemctl status nginx
sudo systemctl status mysql
pm2 status

# Verificar puertos
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3306
\`\`\`

### 2. Probar la aplicación
\`\`\`bash
# Probar conectividad local
curl -I http://localhost:3000

# Probar HTTPS
curl -I https://maranata.laalameda.pe

# Verificar certificado SSL
openssl s_client -connect maranata.laalameda.pe:443 -servername maranata.laalameda.pe
\`\`\`

## Solución de Problemas Comunes

### La aplicación no inicia
\`\`\`bash
# Verificar logs de PM2
pm2 logs maranata-encuesta

# Verificar variables de entorno
cat /var/www/vhosts/maranata.laalameda.pe/.env.local

# Verificar puerto
sudo netstat -tlnp | grep :3000

# Reiniciar todo
pm2 restart maranata-encuesta
sudo systemctl restart nginx
\`\`\`

### Error de conexión a MySQL
\`\`\`bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Probar conexión
mysql -u maranata_user -p -h localhost maranata_encuesta

# Verificar logs de MySQL
sudo tail -f /var/log/mysql/error.log
\`\`\`

### Problemas de SSL/HTTPS
\`\`\`bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado manualmente
sudo certbot renew

# Verificar configuración de Nginx
sudo nginx -t

# Recargar configuración de Nginx
sudo systemctl reload nginx
\`\`\`

### Problemas de permisos
\`\`\`bash
sudo chown -R $USER:$USER /var/www/vhosts/maranata.laalameda.pe
chmod -R 755 /var/www/vhosts/maranata.laalameda.pe

# Verificar permisos de logs
sudo chown -R $USER:$USER /var/log/pm2
\`\`\`

## Estimación de Costos

### Configuración Recomendada
- **VPS Ubuntu (4GB RAM, 2 CPU)**: $15-25/mes
- **Dominio .pe**: $20-30/año
- **SSL**: Gratis con Let's Encrypt
- **MySQL**: Sin costos adicionales (incluido)
- **Total mensual**: ~$15-25/mes

### Proveedores Recomendados para VPS
- **DigitalOcean**: Droplets desde $12/mes
- **Linode**: VPS desde $12/mes
- **Vultr**: Instancias desde $10/mes
- **AWS Lightsail**: Desde $10/mes

## Recomendaciones de Seguridad

1. **Cambiar todas las contraseñas por defecto**
2. **Configurar firewall correctamente**
3. **Mantener el sistema actualizado regularmente**
4. **Usar SSL/HTTPS obligatorio**
5. **Hacer backups automáticos diarios**
6. **Monitorear logs regularmente**
7. **Usar autenticación por clave SSH**
8. **Configurar fail2ban para proteger SSH**
9. **Limitar acceso a MySQL solo desde localhost**
10. **Configurar headers de seguridad en Nginx**

## Configuración Adicional de Seguridad

### Instalar y configurar Fail2Ban
\`\`\`bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Crear configuración personalizada
sudo nano /etc/fail2ban/jail.local
\`\`\`

Contenido de `/etc/fail2ban/jail.local`:
\`\`\`ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/maranata.error.log
\`\`\`

\`\`\`bash
# Reiniciar Fail2Ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
\`\`\`

## Contacto y Soporte

Para problemas específicos del despliegue, revisa los logs y la documentación oficial de:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

**Sitio desplegado**: https://maranata.laalameda.pe

