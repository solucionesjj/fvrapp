import { Injectable, signal } from '@angular/core';

export type Language = 'es' | 'en';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = signal<Language>('en');
  
  private translations: Record<Language, Translations> = {
    es: {
      // App general
      'app.title': 'Solicitud de registro de votantes de Florida',
      'app.footer': 'Aplicación de Registro',
      
      // Navigation
      'nav.previous': 'Anterior',
      'nav.next': 'Siguiente',
      'nav.restart': 'Reiniciar proceso',
      
      // Common
      'common.yes': 'Sí',
      'common.no': 'No',
      'common.close': 'Cerrar',
      'common.restart': 'Reiniciar proceso',
      
      // Step 1
      'step1.title': 'Consentimiento para el registro de votantes',
      'step1.subtitle': 'Por favor revise y firme para comenzar su registro.',
      'step1.signature': 'Firma digital *',
      'step1.clear': 'Borrar firma',
      'step1.consent.title':'Doy mi consentimiento para la recopilación y el procesamiento de datos.',
      'step1.consent': 'Entiendo que mi información se utilizará para fines de registro de votantes de acuerdo con la ley del estado de Florida.',
      'step1.error': 'Por favor, proporcione su firma antes de continuar.',
      'step1.nav.next': 'Continuar con elegibilidad',
      
      // Step 2
      'step2.title': 'Escanee su licencia de conducir o identificación',
      'step2.subtitle': 'Cargue o tome una fotografía de su licencia de conducir o tarjeta de identificación estatal',
      'step2.camera': 'Cámara',
      'step2.file': 'Archivo',
      'step2.manual': 'Manual',
      'step2.scanning': 'Escaneando...',
      'step2.upload': 'Subir imagen',
      'step2.enter_manual': 'Ingrese el código manualmente:',
      'step2.success': 'Código escaneado correctamente',
      'step2.recapture': 'Volver a capturar',
      'step2.error.camera': 'Error al acceder a la cámara',
      'step2.error.file': 'Error al procesar el archivo',
      'step2.error.manual': 'Por favor, ingrese un código válido',
      'step2.bluetooth': 'Bluetooth',
      'step2.bluetooth_title': 'Escáner Bluetooth',
      'step2.bluetooth_instructions': 'Asegúrese de que su escáner Bluetooth esté conectado y configurado en modo HID (teclado).',
      'step2.bluetooth_step1': 'Conecte su escáner Bluetooth al dispositivo',
      'step2.bluetooth_step2': 'Configure el escáner en modo HID/Teclado',
      'step2.bluetooth_step3': 'Active el escáner y escanee el código de barras',
      'step2.bluetooth_start': 'Activar Escáner',
      'step2.bluetooth_listening': 'Escuchando escáner...',
      'step2.bluetooth_waiting': 'Escanee el código de barras con su dispositivo Bluetooth',
      'step2.bluetooth_scanned': 'Código escaneado',
      'step2.bluetooth_stop': 'Desactivar Escáner',

      // Step 3
      'step3.title': 'Preguntas de elegibilidad',
      'step3.subtitle': 'Por favor, dilengie los siguientes datos',
      'step3.question1.title': 'Pregunta 1',
      'step3.question1.text': '¿Es usted ciudadano estadounidense?',
      'step3.question2.title': 'Pregunta 2',
      'step3.question2.text': '¿Ha sido usted condenado por un delito grave?',
      'step3.question3.title': 'Pregunta 3',
      'step3.question3.text': '¿Adjudicado mentalmente incapacitado?',
      'step3.county.title': 'Condado de Residencia',
      'step3.county.label': 'Ingrese su condado de residencia',
      'step3.county.placeholder': 'Ej. Columbia',
      'step3.email.title': 'Información de Contacto (Opcional)',
      'step3.email.label': 'Correo electrónico',
      'step3.email.placeholder': 'ejemplo@correo.com',
      'step3.phone.label': 'Teléfono celular',
      'step3.phone.placeholder': '(555) 123-4567',
      'step3.error': 'Por favor, seleccione un condado de residencia.',
      
      // Step 4

      'step4.title': 'Revise su información',
      'step4.subtitle': 'Revise la información antes de continuar el proceso',
      'step4.name': 'Nombre',
      'step4.surnames': 'Apellidos',
      'step4.driverLicense': 'Licencia de Conducción',
      'step4.dateOfBirth': 'Fecha de Nacimiento',
      'step4.gender': 'Genero',
      'step4.gender.male': 'Masculino',
      'step4.gender.female': 'Femenino',
      'step4.gender.other': 'Otro',
      'step4.address': 'Dirección',
      'step4.city': 'Ciudad',
      'step4.county': 'Condado',
      'step4.postalCode': 'Código Postal',
      'step4.email': 'Correo Electrónico',
      'step4.phoneNumber': 'Número de Teléfono',
      'step4.signature_section': 'Firma y Consentimiento',
      'step4.signature_label': 'Firma',
      'step4.consent_label': 'Dió su concentimiento',
      'step4.barcode_section': 'Datos del Código de Barras',
      'step4.capture_type': 'Tipo de captura',
      'step4.image': 'Imagen',
      'step4.form_section': 'Respuestas del Formulario',
      'step4.county_label': 'Condado de Residencia',
      'step4.not_specified': 'No especificado',
      'step4.no_answer': 'No respondido',
      'step4.incomplete_warning': 'Hay información incompleta. Por favor, regrese a los pasos anteriores para completar todos los campos requeridos.',
      'step4.no_data': 'No hay datos disponibles. Por favor, complete los pasos anteriores.',
      'step4.generate_pdf': 'Generar PDF',
      'step4.processing': 'Procesando...',
      'step4.success': 'Datos enviados correctamente',
      'step4.error': 'Error al enviar los datos',
      

      // Step 5
      'step5.title': 'Fin del proceso',
      'step5.subtitle': 'Finalización del proceso',
      'step5.success_title': '¡Proceso completado con éxito!',
      'step5.success_message': 'Please print the form to complete the process.',
      'step5.pdf_title': 'PDF',
      'step5.pdf_description': 'Se ha generado un documento PDF con los datos proporcionados.',
      'step5.download': 'Descargar PDF',
      'step5.view': 'Ver PDF',
      'step5.error': 'No hay datos disponibles para generar el PDF. Por favor, complete los pasos anteriores.',
      'step5.generate_pdf': 'Generar PDF',
      'step5.generate_receipt': 'Ver Recibo',
      
      // Confirm Dialog
      'confirm.title': 'Confirmar reinicio',
      'confirm.message': '¿Está seguro de que desea reiniciar el proceso? Se perderán todos los datos ingresados.',
      'confirm.cancel': 'Cancelar',
      'confirm.confirm': 'Confirmar',
      
      // Dialog
      'dialog.restart.title': 'Confirmar reinicio',
      'dialog.restart.message': '¿Está seguro de que desea reiniciar el proceso? Se perderán todos los datos ingresados.',
      
      // Language
      'language.spanish': 'Español',
      'language.english': 'English'
    },
    en: {
      // App general
      'app.title': 'Florida Voter Registration Application',
      'app.footer': 'Registration Application',
      
      // Navigation
      'nav.previous': 'Previous',
      'nav.next': 'Next',
      'nav.restart': 'Restart Process',
      
      // Common
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.close': 'Close',
      'common.restart': 'Restart process',
      
      // Step 1
      'step1.title': 'Voter Registration Consent',
      'step1.subtitle': 'Please review and sign to begin your registration',
      'step1.signature': 'Digital signature *',
      'step1.clear': 'Clear signature',
      'step1.consent.title':'I consent to data collection and processing',
      'step1.consent': 'I understand that my information will be used for voter registration purposes in accordance with Florida state law.',
      'step1.error': 'Please provide your signature before continuing.',
      'step1.nav.next': 'Continue to eligibility',
      
      // Step 2
      'step2.title': 'Scan your driver license or ID',
      'step2.subtitle': 'Please upload or take a photo of your driver license or state ID card',
      'step2.camera': 'Camera',
      'step2.file': 'File',
      'step2.manual': 'Manual',
      'step2.scanning': 'Scanning...',
      'step2.upload': 'Upload image',
      'step2.enter_manual': 'Enter the code manually:',
      'step2.success': 'Code scanned successfully',
      'step2.recapture': 'Recapture',
      'step2.error.camera': 'Error accessing camera',
      'step2.error.file': 'Error processing file',
      'step2.error.manual': 'Please enter a valid code',
      'step2.bluetooth': 'Bluetooth',
      'step2.bluetooth_title': 'Bluetooth Scanner',
      'step2.bluetooth_instructions': 'Make sure your Bluetooth scanner is connected and configured in HID (keyboard) mode.',
      'step2.bluetooth_step1': 'Connect your Bluetooth scanner to the device',
      'step2.bluetooth_step2': 'Configure the scanner in HID/Keyboard mode',
      'step2.bluetooth_step3': 'Activate the scanner and scan the barcode',
      'step2.bluetooth_start': 'Activate Scanner',
      'step2.bluetooth_listening': 'Listening to scanner...',
      'step2.bluetooth_waiting': 'Scan the barcode with your Bluetooth device',
      'step2.bluetooth_scanned': 'Scanned code',
      'step2.bluetooth_stop': 'Deactivate Scanner',
      
      // Step 3
      'step3.title': 'Eligibility Questions',
      'step3.subtitle': 'Please fill out the following information.',
      'step3.question1.title': 'Question 1',
      'step3.question1.text': 'Are you a U.S. citizen?',
      'step3.question2.title': 'Question 2',
      'step3.question2.text': 'Have you been convicted of a felony?',
      'step3.question3.title': 'Question 3',
      'step3.question3.text': 'Adjudicated mentally incapacitated?',
      'step3.county.title': 'County of Residence',
      'step3.county.label': 'Enter your county of residence',
      'step3.county.placeholder': 'Ex. Columbia',
      'step3.email.title': 'Contact Information (Optional)',
      'step3.email.label': 'Email address',
      'step3.email.placeholder': 'example@email.com',
      'step3.phone.label': 'Cell phone number',
      'step3.phone.placeholder': '(555) 123-4567',
      'step3.error': 'Please select a county of residence.',
      
      // Step 4
      'step4.title': 'Review Your Information',
      'step4.subtitle': 'Review the information before continue the process',
      'step4.name': 'Name',
      'step4.surnames': 'Surnames',
      'step4.driverLicense': 'Driver License',
      'step4.dateOfBirth': 'Date of Birth',
      'step4.gender': 'Gender',
      'step4.gender.male': 'Male',
      'step4.gender.female': 'Female',
      'step4.gender.other': 'Other',
      'step4.address': 'Address',
      'step4.city': 'City',
      'step4.county': 'County',
      'step4.postalCode': 'Postal Code',
      'step4.signature_section': 'Signature and Consent',
      'step4.email': 'Email',
      'step4.phoneNumber': 'Phone Number',
      'step4.signature_label': 'Signature',
      'step4.consent_label': 'Gave his consent',
      'step4.barcode_section': 'Barcode Data',
      'step4.capture_type': 'Capture type',
      'step4.image': 'Image',
      'step4.form_section': 'Form Answers',
      'step4.county_label': 'County of Residence',
      'step4.not_specified': 'Not specified',
      'step4.no_answer': 'Not answered',
      'step4.incomplete_warning': 'There is incomplete information. Please go back to previous steps to complete all required fields.',
      'step4.no_data': 'No data available. Please complete the previous steps.',
      'step4.generate_pdf': 'Generate PDF',
      'step4.processing': 'Processing...',
      'step4.success': 'Data sent successfully',
      'step4.error': 'Error sending data',
      
      // Step 5
      'step5.title': 'End of the process',
      'step5.subtitle': 'Completion of the process',
      'step5.success_title': 'Process completed successfully!',
      'step5.success_message': 'Please print the form to complete the process.',
      'step5.pdf_title': 'PDF',
      'step5.pdf_description': 'A PDF document has been generated with the data provided.',
      'step5.download': 'Download PDF',
      'step5.view': 'View PDF',
      'step5.processing': 'Generating PDF...',
      'step5.success': 'PDF generated successfully',
      'step5.error': 'No data available to generate PDF. Please complete the previous steps.',
      'step5.generate_pdf': 'Generate PDF',
      'step5.generate_receipt': 'View Receipt',
      
      // Confirm Dialog
      'confirm.title': 'Confirm restart',
      'confirm.message': 'Are you sure you want to restart the process? All entered data will be lost.',
      'confirm.cancel': 'Cancel',
      'confirm.confirm': 'Confirm',
      
      // Dialog
      'dialog.restart.title': 'Confirm restart',
      'dialog.restart.message': 'Are you sure you want to restart the process? All entered data will be lost.',
      
      // Language
      'language.spanish': 'Español',
      'language.english': 'English'
    }
  };
  
  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      this.currentLanguage.set(savedLanguage);
    }
  }
  
  getCurrentLanguage() {
    return this.currentLanguage();
  }
  
  setLanguage(language: Language) {
    this.currentLanguage.set(language);
    localStorage.setItem('app-language', language);
  }
  
  translate(key: string): string {
    const translation = this.translations[this.currentLanguage()][key];
    return translation || key;
  }
  
  // Computed signal for reactive translations
  t(key: string) {
    return () => this.translate(key);
  }
}
