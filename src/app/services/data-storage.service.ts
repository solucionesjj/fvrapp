import { Injectable } from '@angular/core';
import { UserData } from '../models/user-data.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { GoogleSheetsService } from './google-sheets.service';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private readonly STORAGE_KEY = 'wizard_user_data';
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  
  constructor(private googleSheetsService: GoogleSheetsService) {
    // Cargar datos del localStorage al iniciar el servicio
    this.loadFromLocalStorage();
  }
  
  /**
   * Obtiene los datos actuales del usuario como Observable
   */
  getUserData(): Observable<UserData | null> {
    return this.userDataSubject.asObservable();
  }
  
  /**
   * Obtiene los datos actuales del usuario como valor directo
   */
  getUserDataValue(): UserData | null {
    return this.userDataSubject.value;
  }
  
  /**
   * Actualiza los datos del usuario y los guarda en localStorage
   */
  updateUserData(data: Partial<UserData>): void {
    
    const currentData = this.userDataSubject.value || this.getEmptyUserData();
    const updatedData = { ...currentData, ...data, updatedAt: new Date() };
    
    // Guardar en localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    console.log('UserData', updatedData);
    // Actualizar el BehaviorSubject
    this.userDataSubject.next(updatedData);
  }
  
  /**
   * Limpia todos los datos del usuario
   */
  clearUserData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userDataSubject.next(null);
  }
  
  /**
   * Carga los datos del localStorage
   */
  private loadFromLocalStorage(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    
    if (storedData) {
      try {
        const userData = JSON.parse(storedData) as UserData;
        this.userDataSubject.next(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        this.clearUserData();
      }
    }
  }
  
  /**
   * Crea un objeto UserData vacío con valores por defecto
   */
  private getEmptyUserData(): UserData {
    return {
      signature: '',
      consent: false,
      licenseCode: '',
      firstName: '',
      secondName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      height: '',
      licenseExpirationDate: '',
      dateOfBirth: '',
      Sex: '',
      licenseIssueDate: '',
      licenseTypeOfVehicle: '',
      licenseRestrictions: '',
      licenseOtherVehicles: '',
      licenseId: '',
      licenseIssueCountry: '',
      licenseId2: '',
      surnames: '',
      licenseCompliance: '',
      licenseFormatVersion: '',
      licenseType: '',
      surnameAlias: '',
      firstNameAlias: '',
      secondNameAlias: '',
      licenseTypeOfDriver: '',
      statalId: '',
      barcode: '',
      barcodeType: '',
      question1: false,
      question2: false,
      question3: false,
      countyOfResidence: '',
      email: '',
      phoneNumber: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  /**
   * Guarda los datos del usuario en Google Sheets
   * Primero intenta autenticar al usuario si no está autenticado
   */
  saveToDatabase(userData: UserData): Observable<boolean> {
    console.log('Iniciando guardado en Google Sheets:', userData);
    userData.signature = '';
    userData.barcode = '';
    return new Observable<boolean>((observer) => {
      this.handleGoogleSheetsOperation(userData, observer);
    });
  }

  private async handleGoogleSheetsOperation(userData: UserData, observer: any): Promise<void> {
    try {
      // Verificar si la API está inicializada
      const isInitialized = await this.googleSheetsService.isApiInitialized();
      if (!isInitialized) {
        console.error('Google Sheets API no está inicializada');
        observer.next(false);
        observer.complete();
        return;
      }

      // Verificar si está autenticado
      const isAuthenticated = await this.googleSheetsService.isAuthenticated();
      if (!isAuthenticated) {
        // Intentar autenticar
        const signedIn = await this.googleSheetsService.signIn();
        if (!signedIn) {
          console.error('No se pudo autenticar con Google');
          observer.next(false);
          observer.complete();
          return;
        }
      }

      // Guardar los datos
      this.googleSheetsService.saveToGoogleSheets(userData)
        .pipe(
          catchError((error) => {
            console.error('Error guardando en Google Sheets:', error);
            return of(false);
          })
        )
        .subscribe({
          next: (success) => {
            if (success) {
              console.log('Datos guardados exitosamente en Google Sheets');
            } else {
              console.error('Error al guardar en Google Sheets');
            }
            observer.next(success);
            observer.complete();
          },
          error: (error) => {
            console.error('Error en la operación:', error);
            observer.next(false);
            observer.complete();
          }
        });
    } catch (error) {
      console.error('Error en handleGoogleSheetsOperation:', error);
      observer.next(false);
      observer.complete();
    }
  }
}