# Configuración de Google Sheets API

Esta guía te ayudará a configurar la integración con Google Sheets para guardar los datos del formulario.

## ⚠️ Actualización Importante - Nueva API de Google Identity Services

Esta aplicación ha sido actualizada para usar la **nueva Google Identity Services API** en lugar de la obsoleta `gapi.auth2`. Esto cumple con las nuevas políticas de Google y evita el error:

> "You have created a new client application that uses libraries for user authentication or authorization that are deprecated."

**Beneficios de la nueva API:**
- Cumple con las políticas actuales de Google
- Mejor seguridad y rendimiento
- Soporte a largo plazo
- Experiencia de usuario mejorada

Para más información sobre la migración, consulta: [Google Identity Services Migration Guide](https://developers.google.com/identity/gsi/web/guides/gis-migration)

## Pasos para configurar Google Sheets API

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el nombre de tu proyecto

### 2. Habilitar Google Sheets API

1. En Google Cloud Console, ve a **"APIs y servicios"** > **"Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz clic en la API y presiona **"Habilitar"**

### 3. Crear credenciales

#### API Key
1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"Crear credenciales"** > **"Clave de API"**
3. Copia la API Key generada
4. (Opcional) Restringe la clave para mayor seguridad:
   - Haz clic en la clave creada
   - En "Restricciones de API", selecciona "Restringir clave"
   - Selecciona "Google Sheets API"

#### OAuth 2.0 Client ID
1. **Configurar pantalla de consentimiento OAuth** (IMPORTANTE):
   - Ve a **"APIs y servicios"** > **"Pantalla de consentimiento de OAuth"**
   - Selecciona **"Externo"** (no "Interno") para permitir usuarios fuera de tu organización
   - Completa la información requerida:
     - Nombre de la aplicación: "Dom's Sheet Uploader" (o el nombre que prefieras)
     - Email de soporte del usuario
     - Dominios autorizados (opcional para desarrollo)
   - En "Alcances", agrega: `https://www.googleapis.com/auth/spreadsheets`
   - Guarda y continúa

2. **Crear Client ID**:
   - Ve a **"APIs y servicios"** > **"Credenciales"**
   - Haz clic en **"Crear credenciales"** > **"ID de cliente de OAuth 2.0"**
   - Selecciona **"Aplicación web"**
   - Configura los orígenes autorizados:
     - Para desarrollo: `http://localhost:4200`
     - Para producción: tu dominio real
   - Copia el Client ID generado

### 4. Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea una nueva hoja de cálculo
3. Copia el ID de la hoja desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
4. Comparte la hoja:
   - Haz clic en **"Compartir"**
   - Cambia los permisos a **"Cualquier persona con el enlace puede editar"**
   - O agrega específicamente el email de tu proyecto de Google Cloud

### 5. Configurar la aplicación

1. Abre el archivo `src/app/config/google-sheets.config.ts`
2. Reemplaza los valores de configuración:

```typescript
export const GOOGLE_SHEETS_CONFIG = {
  API_KEY: 'tu_api_key_aqui',
  CLIENT_ID: 'tu_client_id_aqui',
  SPREADSHEET_ID: 'tu_spreadsheet_id_aqui',
  RANGE: 'Data!A:AZ',
  DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
};
```

### 6. Estructura de la hoja de cálculo

La aplicación creará automáticamente los encabezados en la primera fila:

| Signature | Consent | License Code | First Name | Second Name | ... |
|-----------|---------|--------------|------------|-------------| --- |
| [datos]   | [datos] | [datos]      | [datos]    | [datos]     | ... |

### 7. Probar la integración

1. Ejecuta la aplicación: `npm start`
2. Completa el formulario hasta el paso 4
3. Haz clic en "Enviar datos"
4. Se abrirá una ventana de autenticación de Google
5. Autoriza la aplicación
6. Los datos se guardarán en tu Google Sheet

## Solución de problemas

### Error: "Access blocked: [App Name] can only be used within its organization"
**Causa**: La pantalla de consentimiento OAuth está configurada como "Interno" en lugar de "Externo".

**Solución**:
1. Ve a Google Cloud Console > **"APIs y servicios"** > **"Pantalla de consentimiento de OAuth"**
2. Haz clic en **"EDITAR APLICACIÓN"**
3. Cambia el tipo de usuario de **"Interno"** a **"Externo"**
4. Completa la información requerida y guarda
5. Es posible que necesites recrear el Client ID después de este cambio

### Error: "API key not valid"
- Verifica que la API Key sea correcta
- Asegúrate de que Google Sheets API esté habilitada
- Revisa las restricciones de la API Key

### Error: "Invalid client ID"
- Verifica que el Client ID sea correcto
- Asegúrate de que el dominio esté en los orígenes autorizados
- Verifica que la pantalla de consentimiento esté configurada como "Externo"

### Error: "Permission denied"
- Verifica que la hoja de cálculo esté compartida correctamente
- Asegúrate de que el usuario tenga permisos de edición

### Error: "CORS"
- Verifica que el dominio esté configurado en los orígenes autorizados
- Para desarrollo local, usa `http://localhost:4200`

## Seguridad

⚠️ **Importante**: 
- Nunca subas las credenciales reales a un repositorio público
- Considera usar variables de entorno para producción
- Restringe las API Keys y Client IDs a los dominios necesarios
- Revisa regularmente los permisos de tu Google Sheet

## Variables de entorno (Opcional)

Para mayor seguridad en producción, puedes usar variables de entorno:

1. Crea un archivo `.env` (no lo subas al repositorio)
2. Agrega las variables:
   ```
   GOOGLE_API_KEY=tu_api_key
   GOOGLE_CLIENT_ID=tu_client_id
   GOOGLE_SPREADSHEET_ID=tu_spreadsheet_id
   ```
3. Modifica el archivo de configuración para usar estas variables

## Soporte

Si tienes problemas con la configuración:
1. Revisa la consola del navegador para errores específicos
2. Verifica que todas las credenciales sean correctas
3. Asegúrate de que los permisos estén configurados correctamente
4. Consulta la [documentación oficial de Google Sheets API](https://developers.google.com/sheets/api)