#!/bin/bash

# Script de despliegue automatizado para FVR App
# Uso: ./deploy.sh [servidor] [usuario] [ruta_destino]

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar parámetros
if [ $# -lt 3 ]; then
    error "Uso: $0 <servidor> <usuario> <ruta_destino>"
    error "Ejemplo: $0 www.soeasy.one usuario /var/www/html/fvrapp"
    exit 1
fi

SERVER=$1
USER=$2
DEST_PATH=$3

log "Iniciando despliegue de FVR App..."
log "Servidor: $SERVER"
log "Usuario: $USER"
log "Destino: $DEST_PATH"

# 1. Instalar dependencias
log "Instalando dependencias..."
npm install

# 2. Compilar para producción
log "Compilando aplicación para producción..."
npm run build

if [ ! -d "dist/fvrapp/browser" ]; then
    error "La compilación falló. No se encontró dist/fvrapp/browser"
    exit 1
fi

success "Compilación completada exitosamente"

# 3. Verificar y corregir el favicon en index.html
log "Verificando configuración del favicon..."
if grep -q 'href="favicon.ico"' dist/fvrapp/browser/index.html; then
    warning "Corrigiendo ruta del favicon..."
    sed -i '' 's/href="favicon.ico"/href=".\/favicon.ico"/g' dist/fvrapp/browser/index.html
    success "Ruta del favicon corregida"
else
    success "Configuración del favicon correcta"
fi

# 4. Verificar que el archivo .htaccess existe
if [ ! -f "dist/fvrapp/browser/.htaccess" ]; then
    warning "Archivo .htaccess no encontrado. Creándolo..."
    cat > dist/fvrapp/browser/.htaccess << 'EOF'
RewriteEngine On

# Handle Angular Router
RewriteBase /fvrapp/

# Handle files and directories that exist
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Handle Angular routes - redirect all requests to index.html
RewriteRule ^ index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/icon "access plus 1 year"
    ExpiresByType text/ico "access plus 1 year"
    ExpiresByType application/ico "access plus 1 year"
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /fvrapp/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
    success "Archivo .htaccess creado"
else
    success "Archivo .htaccess encontrado"
fi

# 5. Crear backup en el servidor (opcional)
log "Creando backup en el servidor..."
ssh $USER@$SERVER "if [ -d '$DEST_PATH' ]; then cp -r $DEST_PATH ${DEST_PATH}_backup_$(date +%Y%m%d_%H%M%S); fi" || warning "No se pudo crear backup"

# 6. Subir archivos al servidor
log "Subiendo archivos al servidor..."
rsync -avz --delete dist/fvrapp/browser/ $USER@$SERVER:$DEST_PATH/

if [ $? -eq 0 ]; then
    success "Archivos subidos exitosamente"
else
    error "Error al subir archivos"
    exit 1
fi

# 7. Configurar permisos
log "Configurando permisos..."
ssh $USER@$SERVER "sudo chown -R www-data:www-data $DEST_PATH && sudo chmod -R 644 $DEST_PATH && sudo find $DEST_PATH -type d -exec chmod 755 {} \;"

if [ $? -eq 0 ]; then
    success "Permisos configurados correctamente"
else
    warning "No se pudieron configurar los permisos automáticamente"
fi

# 8. Verificar que mod_rewrite esté habilitado
log "Verificando configuración de Apache..."
ssh $USER@$SERVER "sudo a2enmod rewrite && sudo systemctl reload apache2" || warning "No se pudo verificar/habilitar mod_rewrite"

# 9. Mostrar información final
echo ""
success "🎉 ¡Despliegue completado exitosamente!"
echo ""
log "Tu aplicación está disponible en: https://$SERVER/fvrapp/"
log "Rutas de ejemplo:"
log "  - https://$SERVER/fvrapp/"
log "  - https://$SERVER/fvrapp/step1"
log "  - https://$SERVER/fvrapp/step2"
echo ""
warning "Si encuentras errores 404 en las rutas, verifica:"
warning "  1. Que el archivo .htaccess se haya subido correctamente"
warning "  2. Que mod_rewrite esté habilitado en Apache"
warning "  3. Que AllowOverride All esté configurado en el VirtualHost"
echo ""
log "Para más información, consulta GUIA_DESPLIEGUE.md"