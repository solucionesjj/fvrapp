# Proxy Service
## Enviroment file:

```bash
#API
API_KEY=c3b354af70a09ab43a
APIURL=http://72.333.222.128/
APIHEALTH=http://72.333.222.128/health
PORT=3000
#Mongo connection parameters
DB_USER=proxyAppUser
DB_PASSWORD="LaClaveCompleja"
DB_HOST=localhost
DB_PORT=38291
DB_NAME=fvrapp
```

Para ambientes productivos se recomienda instalar los componentes de producción:
```bash
npm install --omit=dev
```

Adicional para que funcione como servicio se debe instalar PM2:
```bash
npm install -g pm2
```

Posterior a la instalación de pm2, se debe iniciar la aplicación con pm2:
```bash
pm2 start index.js --watch --name fvrappProxy
```
Como la aplicación ya quedó funcionando se debe almacenar el estado de pm2 para que se reinicie automáticamente al reiniciar el servidor:
```bash
pm2 save
```

Después de guardar los cambios en PM2 se debe configurar para que se inicie automáticamente al reiniciar el servidor:
```bash
pm2 startup
```