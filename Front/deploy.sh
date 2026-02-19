#!/bin/bash

# Uso: ./deploy.sh [servidor] [port] [usuario] [ruta_destino]

set -e  

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' 

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

if [ $# -lt 4 ]; then
    error "Uso: $0 <servidor> <puerto> <usuario> <ruta_destino>"
    error "Ejemplo: $0 fvrapp.soeasy.one 2121 usuario /var/www/html/fvrapp"
    exit 1
fi

SERVER=$1
PORT=$2
USER=$3
DEST_PATH=$4

log "Iniciando despliegue de FVR App..."
log "Servidor: $SERVER"
log "Puerto: $PORT"
log "Usuario: $USER"
log "Destino: $DEST_PATH"

log "Instalando dependencias..."
npm install

log "Compilando aplicación para producción..."
npm run build

if [ ! -d "dist/fvrapp/browser" ]; then
    error "La compilación falló. No se encontró dist/fvrapp/browser"
    exit 1
fi

success "Compilación completada exitosamente"

log "Creando backup en el servidor..."
ssh $USER@$SERVER -p $PORT "if [ -d '$DEST_PATH' ]; then cp -r $DEST_PATH ${DEST_PATH}_backup_$(date +%Y%m%d_%H%M%S); fi" || warning "No se pudo crear backup"

log "Subiendo archivos al servidor..."
rsync -avz -e "ssh -p $PORT" --delete dist/fvrapp/browser/ $USER@$SERVER:$DEST_PATH/

if [ $? -eq 0 ]; then
    success "Archivos subidos exitosamente"
else
    error "Error al subir archivos"
    exit 1
fi

echo ""
success "¡Despliegue completado exitosamente!"
echo ""
log "Tu aplicación está disponible en: https://$SERVER/"
