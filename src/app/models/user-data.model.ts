export interface UserData {
  // Paso 1: Firma y consentimiento
  signature: string; // Base64 de la firma
  consent: boolean;
  
  // Paso 2: Datos del código de barras PDF417
  licenseCode: string;
  firstName: string;
  secondName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  height: string;
  licenseExpirationDate: string;
  dateOfBirth: string;
  Sex: string;
  licenseIssueDate: string;
  licenseTypeOfVehicle: string;
  licenseRestrictions: string;
  licenseOtherVehicles: string;
  licenseId: string;
  licenseIssueCountry: string;
  licenseId2: string;
  surnames: string;
  licenseCompliance: string;
  licenseFormatVersion: string;
  licenseType: string;
  surnameAlias: string;
  firstNameAlias: string;
  secondNameAlias: string;
  licenseTypeOfDriver: string;
  statalId: string;
  barcode: string;
  barcodeType: string;
  
  // Paso 3: Formulario de preguntas
  question1: boolean;
  question2: boolean;
  question3: boolean;
  countyOfResidence: string;
  email: string; // Campo opcional
  phoneNumber: string; // Campo opcional
  
  // Paso 5: 
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}