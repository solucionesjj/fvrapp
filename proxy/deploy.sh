#!/bin/bash

# Variables de configuración
USER="root"
HOST="www.soeasy.one"
PORT="2121"  # <--- Tu puerto personalizado
REMOTE_PATH="/var/www/html/fvrappProxy"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "--- Iniciando despliegue en puerto $PORT ---"

echo "Respaldando archivos remotos..."
FILE="index.js"
ssh -p $PORT $USER@$HOST "cd $REMOTE_PATH && if [ -f $FILE ]; then zip backup/$FILE.$TIMESTAMP.zip $FILE; fi"
FILE="package.json"
ssh -p $PORT $USER@$HOST "cd $REMOTE_PATH && if [ -f $FILE ]; then zip backup/$FILE.$TIMESTAMP.zip $FILE; fi"

echo "Subiendo nuevos archivos..."
FILE="index.js"
scp -P $PORT ./$FILE $USER@$HOST:$REMOTE_PATH/
FILE="package.json"
scp -P $PORT ./$FILE $USER@$HOST:$REMOTE_PATH/

echo "Instalando componentes nuevos y reiniciando aplicación con PM2..."
ssh -p $PORT $USER@$HOST "cd $REMOTE_PATH && npm install --omit=dev && pm2 restart all"

echo "--- Proceso finalizado con éxito ---"