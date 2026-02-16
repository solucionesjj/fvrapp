import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { BarcodeService } from '../../services/barcode.service';
import { DataStorageService } from '../../services/data-storage.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-step2-barcode',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './step2-barcode.component.html',
  styleUrls: ['./step2-barcode.component.scss']
})
export class Step2BarcodeComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isCameraActive = false;
  isScanning = false;
  scanResult: string | null = null;
  scanError: string | null = null;
  selectedImage: string | null = null;
  
  // Propiedades para Bluetooth
  isBluetoothListening = false;
  bluetoothInput = '';
  private bluetoothBuffer = '';
  private bluetoothTimeout: any;
  private keydownListener?: (event: KeyboardEvent) => void;
  
  private scanSubscription?: Subscription;
  
  constructor(
    private router: Router,
    private barcodeService: BarcodeService,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    public translationService: TranslationService
  ) {}
  
  ngOnInit(): void {
    // Cargar datos guardados si existen
    this.dataStorageService.getUserData().subscribe(userData => {
      if (userData?.barcode) {
        this.scanResult = userData.barcode;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.stopCamera();
    this.stopBluetoothListening();
  }
  
  startCamera(): void {
    this.isCameraActive = true;
    this.isScanning = true;
    this.scanError = null;
    
    // Esperar a que el DOM se actualice y el elemento de video esté disponible
    setTimeout(() => {
      if (this.videoElement) {
        this.scanSubscription = this.barcodeService.decodeFromCamera(this.videoElement.nativeElement)
          .subscribe({
            next: (result) => {
              if (result && typeof result.getText === 'function') {
                this.scanResult = result.getText();
                this.stopCamera();
                this.saveBarcode(this.scanResult, 'camera');
              }
            },
            error: (error) => {
              console.error('Error al decodificar licencia de Florida desde cámara:', error);
              this.isScanning = false;
              this.isCameraActive = false;
              
              if (error.name === 'NotAllowedError') {
                this.scanError = 'Acceso a la cámara denegado. Por favor, permite el acceso a la cámara en tu navegador para escanear la licencia de Florida.';
              } else if (error.name === 'NotFoundError') {
                this.scanError = 'No se encontró ninguna cámara disponible. Para licencias de Florida, se recomienda usar la cámara trasera del dispositivo.';
              } else if (error.message?.includes('NotFoundException')) {
                this.scanError = 'No se detecta código PDF417. Las licencias de Florida tienen un código de barras 2D (PDF417) en la parte posterior. Asegúrate de mostrar la parte trasera de la licencia con buena iluminación.';
              } else {
                this.scanError = 'Error al escanear licencia de Florida: ' + (error.message || 'Error desconocido') + '. Intenta con mejor iluminación o sube una imagen del código PDF417.';
              }
              
              // Sugerencias adicionales basadas en el tipo de error
              if (error.message?.includes('permisos') || error.message?.includes('denegados')) {
                this.scanError += ' Revisa la configuración de permisos de tu navegador.';
              } else if (error.message?.includes('No se encontraron dispositivos')) {
                this.scanError += ' Asegúrate de que tu dispositivo tenga una cámara conectada.';
              }
            }
          });
        
        // Timeout para el escaneo (aumentado para licencias de Florida)
        setTimeout(() => {
          if (this.isScanning && this.isCameraActive && !this.scanResult) {
            console.log('Timeout de escaneo alcanzado para licencia de Florida');
            this.scanError = 'El escaneo está tomando más tiempo del esperado. Para licencias de Florida, asegúrate de que el código PDF417 (código de barras 2D en la parte posterior) esté completamente visible, bien iluminado y enfocado. Mantén la cámara estable y perpendicular al código.';
          }
        }, 60000); // 60 segundos para licencias complejas
        
      } else {
        this.scanError = 'No se pudo inicializar el elemento de video';
        this.isScanning = false;
        this.isCameraActive = false;
      }
    }, 500);
  }
  
  stopCamera(): void {
    this.isCameraActive = false;
    this.isScanning = false;
    
    // Detener la suscripción primero
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
      this.scanSubscription = undefined;
    }
    
    // Detener específicamente el stream del elemento de video de este componente
    if (this.videoElement && this.videoElement.nativeElement) {
      const videoElement = this.videoElement.nativeElement;
      if (videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('Camera track stopped:', track.kind, track.label);
          });
        }
        videoElement.srcObject = null;
        console.log('Video element srcObject cleared');
      }
    }
    
    // Llamar al método del servicio como respaldo
    this.barcodeService.stopDecoding();
  }
  
  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.scanError = 'Por favor, seleccione un archivo de imagen válido.';
        return;
      }
      
      this.scanError = null;
      this.isScanning = true;
      
      // Crear URL para la imagen
      const imageUrl = URL.createObjectURL(file);
      this.selectedImage = imageUrl;
      
      // Crear una imagen para decodificar
      const img = new Image();
      img.onload = () => {
        this.barcodeService.decodeFromImage(img)
          .subscribe({
            next: (result) => {
              if (result && typeof result.getText === 'function') {
                this.scanResult = result.getText();
                this.isScanning = false;
                this.saveBarcode(this.scanResult, 'image');
              } else {
                this.scanError = 'No se pudo decodificar el código de barras';
                this.isScanning = false;
              }
            },
            error: (error) => {
              this.scanError = `No se pudo decodificar el código de barras: ${error.message || 'Formato no reconocido'}`;
              this.isScanning = false;
            },
            complete: () => {
              URL.revokeObjectURL(imageUrl);
            }
          });
      };
      img.onerror = () => {
        this.scanError = 'Error al cargar la imagen';
        this.isScanning = false;
        URL.revokeObjectURL(imageUrl);
      };
      img.src = imageUrl;
    }
  }
  
  saveBarcode(data: string | null, source: string): void {
    if (data) {
      const parsedData = this.barcodeService.parseAAMVAText(data);
      this.dataStorageService.updateUserData({
        licenseCode: parsedData['licenseCode'],
        firstName: parsedData['firstName'],
        secondName: parsedData['secondName'],
        address: parsedData['address'],
        city: parsedData['city'],
        state: parsedData['state'],
        postalCode: parsedData['postalCode'],
        height: parsedData['height'],
        licenseExpirationDate: parsedData['licenseExpirationDate'],
        dateOfBirth: parsedData['dateOfBirth'],
        Sex: parsedData['Sex'],
        licenseIssueDate: parsedData['licenseIssueDate'],
        licenseTypeOfVehicle: parsedData['licenseTypeOfVehicle'],
        licenseRestrictions: parsedData['licenseRestrictions'],
        licenseOtherVehicles: parsedData['licenseOtherVehicles'],
        licenseId: parsedData['licenseId'],
        licenseIssueCountry: parsedData['licenseIssueCountry'],
        licenseId2: parsedData['licenseId2'],
        surnames: parsedData['surnames'],
        licenseCompliance: parsedData['licenseCompliance'],
        licenseFormatVersion: parsedData['licenseFormatVersion'],
        licenseType: parsedData['licenseType'],
        surnameAlias: parsedData['surnameAlias'],
        firstNameAlias: parsedData['firstNameAlias'],
        secondNameAlias: parsedData['secondNameAlias'],
        licenseTypeOfDriver: parsedData['licenseTypeOfDriver'],
        statalId: parsedData['statalId'],
        barcode: data,
        barcodeType: source
      });
    }
  }
  
  goBack(): void {
    this.router.navigate(['/step1']);
  }
  
  saveAndContinue(): void {
    if (this.scanResult) {
      this.saveBarcode(this.scanResult, this.selectedImage ? 'image' : 'camera');
      
      // Detener la cámara de manera explícita antes de navegar
      this.stopCamera();
      
      // Esperar un momento para asegurar que la cámara se detenga completamente
      setTimeout(() => {
        this.router.navigate(['/step3']);
      }, 100);
    }
  }

  confirmRestart(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translationService.translate('dialog.restart.title'),
        message: this.translationService.translate('dialog.restart.message')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataStorageService.clearUserData();
        this.router.navigate(['/step1']);
      }
    });
  }

  resetCapture(): void {
    // Detener la cámara primero si está activa
    this.stopCamera();
    
    // Limpiar el resultado del escaneo y la imagen seleccionada
    this.scanResult = null;
    this.selectedImage = null;
    this.scanError = null;

    // Limpiar los datos del usuario
    this.dataStorageService.updateUserData({
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
        barcodeType: ''
      });

    // Limpiar el input de archivo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    
    // Actualizar los datos del usuario para remover el código de barras
    this.dataStorageService.updateUserData({
      barcode: undefined,
      barcodeType: undefined
    });
  }

  // Métodos para Bluetooth Scanner
  startBluetoothListening(): void {
    this.isBluetoothListening = true;
    this.bluetoothInput = '';
    this.bluetoothBuffer = '';
    this.scanError = null;

    // Crear el listener para eventos de teclado
    this.keydownListener = (event: KeyboardEvent) => {
      // Ignorar si hay un input enfocado (para evitar interferir con entrada manual)
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      // Detectar Enter (código 13) como fin de escaneo
      if (event.keyCode === 13 || event.key === 'Enter') {
        event.preventDefault();
        this.processBluetooth();
        return;
      }

      // Solo procesar caracteres alfanuméricos y algunos símbolos comunes en códigos de barras
      const char = event.key;
      if (char && char.length === 1 && /[a-zA-Z0-9\-_@.\s]/.test(char)) {
        event.preventDefault();
        this.bluetoothBuffer += char;
        this.bluetoothInput = this.bluetoothBuffer;

        // Limpiar timeout anterior
        if (this.bluetoothTimeout) {
          clearTimeout(this.bluetoothTimeout);
        }

        // Establecer timeout para procesar automáticamente si no hay más entrada
        this.bluetoothTimeout = setTimeout(() => {
          if (this.bluetoothBuffer.length >= 6) { // Mínimo 6 caracteres para un código válido
            this.processBluetooth();
          }
        }, 100); // 100ms de timeout
      }
    };

    // Añadir el listener al documento
    document.addEventListener('keydown', this.keydownListener, true);
  }

  stopBluetoothListening(): void {
    this.isBluetoothListening = false;
    
    // Remover el listener
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener, true);
      this.keydownListener = undefined;
    }

    // Limpiar timeout
    if (this.bluetoothTimeout) {
      clearTimeout(this.bluetoothTimeout);
      this.bluetoothTimeout = undefined;
    }

    // Limpiar buffer
    this.bluetoothBuffer = '';
  }

  private processBluetooth(): void {
    if (this.bluetoothBuffer.trim().length >= 6) {
      const scannedCode = this.bluetoothBuffer.trim();
      this.scanResult = scannedCode;
      this.stopBluetoothListening();
      this.saveBarcode(scannedCode, 'bluetooth');
    } else {
      this.scanError = 'Código escaneado demasiado corto. Intente escanear nuevamente.';
    }
    
    // Limpiar buffer después del procesamiento
    this.bluetoothBuffer = '';
  }
}