// Configuración para Google Sheets API
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales
// NOTA: Esta configuración usa la nueva Google Identity Services API
// en lugar de la obsoleta gapi.auth2 para cumplir con las nuevas políticas de Google

export const GOOGLE_SHEETS_CONFIG = {
   // API Key de Google Cloud Console
   // Para obtenerla: https://console.cloud.google.com/apis/credentials
   API_KEY: 'AIzaSyApnxy9y6TPoFf6MRJyW33lyvJXNvwAuw4',

   // Client ID de OAuth 2.0
   // Para obtenerlo: https://console.cloud.google.com/apis/credentials
   CLIENT_ID: '721580974577-ae1vupacld6sbi84frs01o96ld4gond4.apps.googleusercontent.com',

   // ID de tu Google Sheet
   // Puedes obtenerlo de la URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   SPREADSHEET_ID: '1ddSFmwFao4OyHyr9pKIQ5hqqcachLGnPtwXafNLn1s0',

   // Rango de celdas donde se guardarán los datos
   RANGE: 'Data!A:AZ',

   // URL de descubrimiento de la API
   DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',

   // Permisos necesarios
   SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
};

// Instrucciones para configurar Google Sheets API:
/*
1. Ve a Google Cloud Console: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Sheets API:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API" y habilítala
4. Crea credenciales:
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "Clave de API"
   - Copia la API Key y reemplaza YOUR_GOOGLE_API_KEY_HERE
5. Crea un ID de cliente OAuth 2.0:
   - En la misma página de credenciales
   - Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
   - Selecciona "Aplicación web"
   - Agrega tu dominio a "Orígenes de JavaScript autorizados" (ej: http://localhost:4200)
   - Copia el Client ID y reemplaza YOUR_GOOGLE_CLIENT_ID_HERE
6. Crea una Google Sheet:
   - Ve a https://sheets.google.com/
   - Crea una nueva hoja de cálculo
   - Copia el ID de la URL y reemplaza YOUR_SPREADSHEET_ID_HERE
7. Comparte la hoja:
   - Haz clic en "Compartir" en tu Google Sheet
   - Cambia los permisos a "Cualquier persona con el enlace puede editar"
   - O agrega específicamente el email de tu proyecto de Google Cloud
*/