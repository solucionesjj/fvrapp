# Guía de Compilación y Despliegue en Servidor Linux

## Requisitos Previos

### En tu máquina local:
- Node.js (versión 18 o superior)
- npm (viene con Node.js)
- Angular CLI

### En el servidor Linux:
- Servidor web (Apache, Nginx, etc.)
- Acceso SSH al servidor
- Permisos para escribir en el directorio web

## Paso 1: Preparación del Entorno Local

### Instalar dependencias (si no lo has hecho):
```bash
npm install
```

### Verificar que todo funciona:
```bash
npm start
```
Esto debería abrir la aplicación en http://localhost:4200

## Paso 2: Compilación para Producción

### Compilar la aplicación:
```bash
npm run build
```

Esto creará una carpeta `dist/fvrapp/` con todos los archivos optimizados para producción.

### Nota sobre el Tamaño del Bundle

Esta aplicación utiliza librerías como `pdf-lib` que pueden generar bundles de mayor tamaño. Si encuentras errores de budget excedido:

1. **Error típico**: `bundle initial exceeded maximum budget`
2. **Solución**: Los límites de budget ya han sido ajustados en `angular.json` para permitir bundles de hasta 2.5MB
3. **Optimización adicional** (opcional):
   ```bash
   # Para reducir el tamaño del bundle
   npm run build -- --optimization=true --source-map=false
   ```

### Verificar la compilación:
```bash
ls -la dist/fvrapp/
```

Deberías ver archivos como:
- `index.html`
- `main-[hash].js`
- `polyfills-[hash].js`
- `styles-[hash].css`
- Carpeta `assets/` (si tienes recursos)

## Paso 3: Preparar Archivos para el Servidor

### Para Apache (.htaccess)

**IMPORTANTE**: Este archivo ya se ha generado automáticamente en `dist/fvrapp/browser/.htaccess`

El archivo `.htaccess` incluye:
- Manejo de rutas de Angular (SPA routing)
- Headers de seguridad
- Compresión de archivos
- Cache de assets estáticos

```bash
cat > dist/fvrapp/.htaccess << 'EOF'
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
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
  ExpiresActive On
  ExpiresDefault "access plus 1 year"
</filesMatch>
EOF
```

**Nota**: Si tu aplicación está en una ruta diferente a `/fvrapp/`, modifica la línea `RewriteBase` en el archivo `.htaccess`.

### O crear configuración para Nginx:
```bash
cat > nginx-fvrapp.conf << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/fvrapp;
    index index.html;

    # Handle Angular Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
EOF
```

## Paso 4: Subir al Servidor Linux

### Opción A: Usando SCP
```bash
# Comprimir los archivos
cd dist
tar -czf fvrapp.tar.gz fvrapp/

# Subir al servidor
scp fvrapp.tar.gz usuario@tu-servidor.com:/tmp/

# Conectar al servidor
ssh usuario@tu-servidor.com

# En el servidor:
cd /var/www/  # o tu directorio web
sudo tar -xzf /tmp/fvrapp.tar.gz
sudo mv fvrapp/* ./  # o al directorio específico
sudo chown -R www-data:www-data *  # ajustar permisos
```

### Opción B: Usando rsync
```bash
# Sincronizar directamente
rsync -avz --delete dist/fvrapp/ usuario@tu-servidor.com:/var/www/html/
```

### Opción C: Usando Git (recomendado para actualizaciones)
```bash
# En tu repositorio local, crear rama de producción
git add dist/fvrapp/
git commit -m "Build para producción"
git push origin main

# En el servidor
git clone https://github.com/tu-usuario/tu-repo.git
# o
git pull origin main
cp -r dist/fvrapp/* /var/www/html/
```

## Paso 5: Configuración del Servidor Web

### Para Apache:
```bash
# Habilitar mod_rewrite
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires

# Reiniciar Apache
sudo systemctl restart apache2
```

### Para Nginx:
```bash
# Copiar configuración
sudo cp nginx-fvrapp.conf /etc/nginx/sites-available/fvrapp
sudo ln -s /etc/nginx/sites-available/fvrapp /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Paso 6: Configuración de HTTPS (Recomendado)

### Usando Let's Encrypt:
```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-apache  # para Apache
# o
sudo apt install certbot python3-certbot-nginx   # para Nginx

# Obtener certificado
sudo certbot --apache -d tu-dominio.com  # para Apache
# o
sudo certbot --nginx -d tu-dominio.com   # para Nginx
```

## Paso 7: Script de Despliegue Automatizado

**¡Ya disponible!** Se ha creado un script de despliegue automatizado: `deploy.sh`

### Uso del script:

```bash
# Hacer ejecutable (solo la primera vez)
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh www.soeasy.one tu_usuario /var/www/html/fvrapp
```

### El script automatiza:

✅ **Instalación de dependencias** (`npm install`)
✅ **Compilación para producción** (`npm run build`)
✅ **Generación automática de .htaccess** (si no existe)
✅ **Backup del despliegue anterior**
✅ **Subida de archivos via rsync**
✅ **Configuración de permisos**
✅ **Verificación de mod_rewrite en Apache**
✅ **Mensajes informativos y de error**

### Ventajas del script:

- **Seguro**: Crea backup antes de desplegar
- **Completo**: Incluye todas las configuraciones necesarias
- **Informativo**: Muestra el progreso y posibles errores
- **Automático**: Genera el .htaccess si no existe

### Ejemplo de uso:

```bash
./deploy.sh www.soeasy.one jmartinez /var/www/html/fvrapp
```

Esto desplegará tu aplicación en `https://www.soeasy.one/fvrapp/`

### Crear script manualmente (si es necesario):
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando despliegue..."

# Compilar aplicación
echo "📦 Compilando aplicación..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

# Crear archivo .htaccess
echo "⚙️ Creando configuración del servidor..."
cat > dist/fvrapp/.htaccess << 'HTACCESS'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
HTACCESS

# Subir al servidor
echo "📤 Subiendo archivos al servidor..."
rsync -avz --delete dist/fvrapp/ usuario@tu-servidor.com:/var/www/html/

if [ $? -eq 0 ]; then
    echo "✅ Despliegue completado exitosamente"
else
    echo "❌ Error en el despliegue"
    exit 1
fi
EOF

chmod +x deploy.sh
```

## Verificación del Despliegue

1. **Abrir tu sitio web** en el navegador
2. **Verificar que todas las rutas funcionan** (navegar entre páginas)
3. **Comprobar la consola del navegador** para errores
4. **Probar la funcionalidad de la firma** y generación de PDF

## Solución de Problemas Comunes

### ❌ Error 404 en rutas de Angular ("The requested URL was not found")

**Problema**: Al acceder directamente a rutas como `/fvrapp/step1` o al refrescar la página aparece error 404.

**Causa**: Apache no sabe cómo manejar las rutas del lado del cliente de Angular.

**Solución**:
1. ✅ **Ya implementada**: El archivo `.htaccess` se genera automáticamente en `dist/fvrapp/browser/.htaccess`
2. **Verificar**: Que el archivo `.htaccess` se haya subido al servidor
3. **Verificar**: Que Apache tenga habilitado `mod_rewrite`:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```
4. **Verificar**: Configuración del VirtualHost permite `.htaccess`:
   ```apache
   <Directory "/var/www/html/fvrapp">
       AllowOverride All
   </Directory>
   ```

### Otros problemas comunes

#### Archivos no se cargan:
- Verificar permisos: `sudo chown -R www-data:www-data /var/www/html/`
- Comprobar que el servidor web esté ejecutándose

#### Errores de CORS o API:
- Verificar que las URLs de API en el código apunten al servidor correcto
- Configurar CORS en el backend si es necesario

#### Problemas con la firma:
- Verificar que los archivos JavaScript se carguen correctamente
- Comprobar la consola del navegador para errores específicos

#### ❌ Favicon no se muestra (Error 404 en favicon.ico)

**Problema**: El favicon no aparece en el navegador y se ve un error 404 en la consola.

**Causa**: La ruta del favicon no es compatible con el `baseHref` configurado.

**Solución**:
1. ✅ **Ya implementada**: El archivo fuente `src/index.html` ha sido corregido
2. ✅ **Automática**: El script de despliegue verifica y corrige automáticamente este problema
3. **Manual** (si es necesario): Cambiar `href="favicon.ico"` por `href="./favicon.ico"` en el archivo `index.html`

## Actualizaciones Futuras

Para actualizar la aplicación:

1. **Hacer cambios en el código**
2. **Compilar**: `npm run build`
3. **Desplegar**: `./deploy.sh` o subir manualmente
4. **Verificar** que todo funcione correctamente

## Monitoreo

### Logs del servidor web:
```bash
# Apache
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Verificar estado del servidor:
```bash
sudo systemctl status apache2  # o nginx
```

¡Tu aplicación Angular debería estar funcionando correctamente en tu servidor Linux!