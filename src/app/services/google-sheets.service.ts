import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { UserData } from '../models/user-data.model';
import { GOOGLE_SHEETS_CONFIG } from '../config/google-sheets.config';

// Declaración de tipos para Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly API_KEY = GOOGLE_SHEETS_CONFIG.API_KEY;
  private readonly CLIENT_ID = GOOGLE_SHEETS_CONFIG.CLIENT_ID;
  private readonly DISCOVERY_DOC = GOOGLE_SHEETS_CONFIG.DISCOVERY_DOC;
  private readonly SCOPES = GOOGLE_SHEETS_CONFIG.SCOPES;
  private readonly SPREADSHEET_ID = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID;
  private readonly RANGE = GOOGLE_SHEETS_CONFIG.RANGE;
  
  private gapi: any;
  private isInitialized = false;
  private isSignedIn = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.loadGoogleAPI();
  }

  /**
   * Carga la API de Google
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof window !== 'undefined') {
        // Cargar Google Identity Services
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true;
        
        // Cargar Google API Client
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        
        let scriptsLoaded = 0;
        const totalScripts = 2;
        
        const onScriptLoad = async () => {
          scriptsLoaded++;
          if (scriptsLoaded === totalScripts) {
            try {
              await this.initializeGapi();
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        };
        
        const onScriptError = () => {
          reject(new Error('Failed to load Google API scripts'));
        };
        
        gsiScript.onload = onScriptLoad;
        gsiScript.onerror = onScriptError;
        gapiScript.onload = onScriptLoad;
        gapiScript.onerror = onScriptError;
        
        document.head.appendChild(gsiScript);
        document.head.appendChild(gapiScript);
      } else {
        reject(new Error('Window object not available'));
      }
    });
  }

  /**
   * Inicializa la API de Google
   */
  private async initializeGapi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.gapi = window.gapi;
        
        // Inicializar solo el cliente de Google API (sin auth2)
        this.gapi.load('client', async () => {
          try {
            await this.gapi.client.init({
              apiKey: this.API_KEY,
              discoveryDocs: [this.DISCOVERY_DOC]
            });
            
            // Esperar a que Google Identity Services esté disponible
            await this.waitForGoogleIdentityServices();
            
            this.isInitialized = true;
            console.log('Google API y Google Identity Services inicializados correctamente');
            resolve();
          } catch (error) {
            console.error('Error inicializando Google API:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Error cargando Google API:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Espera a que Google Identity Services esté disponible
   */
  private async waitForGoogleIdentityServices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos máximo
      
      const checkAvailability = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkAvailability, 100);
        } else {
          reject(new Error('Google Identity Services no está disponible después de 5 segundos'));
        }
      };
      
      checkAvailability();
    });
  }

  /**
   * Espera a que la API esté inicializada
   */
  private async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    if (!this.isInitialized) {
      throw new Error('Google API no pudo ser inicializada');
    }
  }

  /**
   * Autentica al usuario con Google
   */
  async signIn(): Promise<boolean> {
    await this.waitForInitialization();

    return new Promise<boolean>((resolve) => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: (response: any) => {
            if (response.error) {
              console.error('Error en autenticación:', response.error);
              if (response.error === 'invalid_request') {
                console.error('Error: La solicitud es inválida. Verifica la configuración del CLIENT_ID y los dominios autorizados en Google Cloud Console.');
              }
              this.isSignedIn = false;
              resolve(false);
            } else {
              console.log('Autenticación exitosa');
              this.isSignedIn = true;
              // Configurar el token de acceso para gapi.client
              this.gapi.client.setToken({
                access_token: response.access_token
              });
              resolve(true);
            }
          },
          error_callback: (error: any) => {
            console.error('Error callback en autenticación:', error);
            this.isSignedIn = false;
            resolve(false);
          }
        });
        
        // Solicitar token de acceso
        tokenClient.requestAccessToken();
      } catch (error) {
        console.error('Error en autenticación:', error);
        this.isSignedIn = false;
        resolve(false);
      }
    });
  }

  /**
   * Guarda los datos del usuario en Google Sheets
   */
  saveToGoogleSheets(userData: UserData, spreadsheetId?: string, range?: string): Observable<boolean> {
    const sheetId = spreadsheetId || this.SPREADSHEET_ID;
    const sheetRange = range || this.RANGE;
    return from(this._saveToGoogleSheets(userData, sheetId, sheetRange));
  }

  /**
   * Implementación privada para guardar en Google Sheets
   */
  private async _saveToGoogleSheets(userData: UserData, spreadsheetId: string, range: string): Promise<boolean> {
    try {
      // Esperar a que la API esté inicializada
      await this.waitForInitialization();
      
      // Asegurar autenticación
      if (!this.isSignedIn) {
        const signedIn = await this.signIn();
        if (!signedIn) {
          throw new Error('No se pudo autenticar con Google');
        }
      }

      // Obtener datos existentes para encontrar la próxima fila vacía
      const existingData = await this.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });

      const values = existingData.result.values || [];
      const nextRow = values.length + 1;

      // Preparar los datos para insertar
      const rowData = this.convertUserDataToRow(userData);

      // Si es la primera fila, agregar encabezados
      if (values.length === 0) {
        const headers = this.getHeaders();
        await this.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: `Data!A1:${this.getColumnLetter(headers.length)}1`,
          valueInputOption: 'RAW',
          resource: {
            values: [headers]
          }
        });
      }

      // Insertar los datos del usuario
      const response = await this.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `Data!A${nextRow}:${this.getColumnLetter(rowData.length)}${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [rowData]
        }
      });

      console.log('Datos guardados en Google Sheets:', response);
      return true;
    } catch (error) {
      console.error('Error guardando en Google Sheets:', error);
      return false;
    }
  }

  /**
   * Convierte UserData a un array de valores para la fila
   */
  private convertUserDataToRow(userData: UserData): any[] {
    return [
      userData.signature,
      userData.consent,
      userData.licenseCode,
      userData.firstName,
      userData.secondName,
      userData.address,
      userData.city,
      userData.state,
      userData.postalCode,
      userData.height,
      userData.licenseExpirationDate,
      userData.dateOfBirth,
      userData.Sex,
      userData.licenseIssueDate,
      userData.licenseTypeOfVehicle,
      userData.licenseRestrictions,
      userData.licenseOtherVehicles,
      userData.licenseId,
      userData.licenseIssueCountry,
      userData.licenseId2,
      userData.surnames,
      userData.licenseCompliance,
      userData.licenseFormatVersion,
      userData.licenseType,
      userData.surnameAlias,
      userData.firstNameAlias,
      userData.secondNameAlias,
      userData.licenseTypeOfDriver,
      userData.statalId,
      userData.barcode,
      userData.barcodeType,
      userData.question1,
      userData.question2,
      userData.question3,
      userData.countyOfResidence,
      userData.email,
      userData.phoneNumber,
      this.formatDateForSheet(userData.createdAt),
      this.formatDateForSheet(userData.updatedAt)
    ];
  }

  /**
   * Formatea una fecha para Google Sheets de manera segura
   */
  private formatDateForSheet(date: any): string {
    if (!date) {
      return '';
    }
    
    try {
      // Si ya es un objeto Date válido
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      // Si es una cadena, intentar convertirla a Date
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      }
      
      // Si es un número (timestamp)
      if (typeof date === 'number') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      }
      
      // Si no se puede convertir, devolver la fecha actual
      return new Date().toISOString();
    } catch (error) {
      console.warn('Error formateando fecha:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Obtiene los encabezados de las columnas
   */
  private getHeaders(): string[] {
    return [
      'Signature',
      'Consent',
      'License Code',
      'First Name',
      'Second Name',
      'Address',
      'City',
      'State',
      'Postal Code',
      'Height',
      'License Expiration Date',
      'Date of Birth',
      'Sex',
      'License Issue Date',
      'License Type of Vehicle',
      'License Restrictions',
      'License Other Vehicles',
      'License ID',
      'License Issue Country',
      'License ID 2',
      'Surnames',
      'License Compliance',
      'License Format Version',
      'License Type',
      'Surname Alias',
      'First Name Alias',
      'Second Name Alias',
      'License Type of Driver',
      'State ID',
      'Barcode',
      'Barcode Type',
      'Question 1',
      'Question 2',
      'Question 3',
      'County of Residence',
      'Email',
      'Phone Number',
      'Created At',
      'Updated At'
    ];
  }

  /**
   * Convierte un número de columna a letra (A, B, C, ..., AA, AB, etc.)
   */
  private getColumnLetter(columnNumber: number): string {
    let result = '';
    while (columnNumber > 0) {
      columnNumber--;
      result = String.fromCharCode(65 + (columnNumber % 26)) + result;
      columnNumber = Math.floor(columnNumber / 26);
    }
    return result;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.waitForInitialization();
      // Verificar si tenemos un token de acceso válido
      const token = this.gapi.client.getToken();
      this.isSignedIn = token && token.access_token ? true : false;
      return this.isSignedIn;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si la API está inicializada
   */
  async isApiInitialized(): Promise<boolean> {
    try {
      await this.waitForInitialization();
      return this.isInitialized;
    } catch {
      return false;
    }
  }
}