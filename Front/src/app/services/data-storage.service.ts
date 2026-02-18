import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserData } from '../models/user-data.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private readonly STORAGE_KEY = 'wizard_user_data';
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  
  constructor(private http: HttpClient) {
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
  
  saveToDatabase(userData: UserData): Observable<boolean> {
    const userDataTemporal: UserData = JSON.parse(JSON.stringify(userData));
    userDataTemporal.signature = '';
    userDataTemporal.barcode = '';
    const url = `${environment.apiUrl}/scans`;
    return this.http.post(url, userDataTemporal).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error guardando en API:', error);
        return of(false);
      })
    );
  }
}
