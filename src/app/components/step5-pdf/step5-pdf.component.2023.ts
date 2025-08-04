import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataStorageService } from '../../services/data-storage.service';
import { UserData } from '../../models/user-data.model';
import { PDFDocument, PageSizes, StandardFonts, rgb } from 'pdf-lib';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-step5-pdf',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './step5-pdf.component.html',
  styleUrls: ['./step5-pdf.component.scss']
})
export class Step5PdfComponent implements OnInit {
  userData: UserData | null = null;
  isGeneratingPdf = false;
  pdfUrl: string | null = null;
  
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public translationService: TranslationService
  ) {}
  
  ngOnInit(): void {
    // Cargar datos guardados
    this.dataStorageService.getUserData().subscribe(userData => {
      this.userData = userData;
      if (userData) {
        // Log para diagnóstico
        // console.log('Datos del usuario cargados:', {
        //   hasSignature: !!userData.signature,
        //   signatureLength: userData.signature?.length || 0,
        //   signatureStart: userData.signature?.substring(0, 30) || 'N/A'
        // });
        this.generatePdf();
      }
    });
  }
  

  
  async generatePdf(): Promise<void> {
    if (!this.userData) {
      this.snackBar.open(this.translationService.translate('step5.error'), this.translationService.translate('common.close'), { duration: 3000 });
      return;
    }
    
    this.isGeneratingPdf = true;
    
    try {
      // Crear un nuevo documento PDF
      const pdfDoc = await PDFDocument.create();
      
      // Agregar una página
      // const page = pdfDoc.addPage([600, 800]);
      const page = pdfDoc.addPage(PageSizes.Letter);
      
      
      // Obtener la fuente estándar
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      // const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const boldFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Configurar tamaños de fuente
      const titleSize = 20;
      const subtitleSize = 14;
      const normalSize = 12;


      // Print X on US Citizen
      var temporalX = 0;
      if(this.userData.question1) {
        temporalX = 266;
      } else {
        temporalX = 340;
      }
      page.drawText(this.sanitizeTextForPdf('X'), {
        x: temporalX,
        y: 411,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      if(this.userData.question2) {
      page.drawText(this.sanitizeTextForPdf('X'), {
        x: 43,
        y: 394,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      }

      if(this.userData.question3) {
      page.drawText(this.sanitizeTextForPdf('X'), {
        x: 43,
        y: 374,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      }

      
      // Print Date of Birth
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(0, 1)), {
        x: 190,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(1, 2)), {
        x: 207,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(2, 3)), {
        x: 247,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(3, 4)), {
        x: 269,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(4, 5)), {
        x: 317,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(5, 6)), {
        x: 337,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(6, 7)), {
        x: 360,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      page.drawText(this.sanitizeTextForPdf(this.userData.dateOfBirth.substring(7, 8)), {
        x: 380,
        y: 351,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });      

      // Print Florida Driver License
      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(0, 1)), {
        x: 48,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(1, 2)), {
        x: 68,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(2, 3)), {
        x: 88,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(3, 4)), {
        x: 111,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(4, 5)), {
        x: 150,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(5, 6)), {
        x: 173,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(6, 7)), {
        x: 193,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(7, 8)), {
        x: 235,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(8, 9)), {
        x: 255,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(9, 10)), {
        x: 298,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(10, 11)), {
        x: 317,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(11, 12)), {
        x: 337,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      page.drawText(this.sanitizeTextForPdf(this.userData.licenseCode.substring(12, 13)), {
        x: 380,
        y: 306,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });


      // Print Surnames
      page.drawText(this.sanitizeTextForPdf(this.userData.surnames), {
        x: 48,
        y: 281,
        size: normalSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

       // Print Names
      page.drawText(this.sanitizeTextForPdf(this.userData.firstName + ' ' + this.userData.secondName), {
        x: 266,
        y: 281,
        size: normalSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });     

       // Print Name Suffix
       if(this.userData.Sex === '1' || this.userData.Sex === '2') {
        page.drawText(this.sanitizeTextForPdf(this.userData.Sex === '1' ? 'MR.' : 'MS.'), {
          x: 564,
          y: 281,
          size: normalSize,
          font: boldFont,
          color: rgb(0, 0, 0)
        });     
       }
       
       // Print Address
      page.drawText(this.sanitizeTextForPdf(this.userData.address), {
        x: 48,
        y: 261,
        size: normalSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });    

       // Print City
      page.drawText(this.sanitizeTextForPdf(this.userData.city), {
        x: 323,
        y: 261,
        size: normalSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });    

      // Print County
      page.drawText(this.sanitizeTextForPdf(this.userData.countyOfResidence), {
        x: 448,
        y: 261,
        size: normalSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      // Print Postal Code
      page.drawText(this.sanitizeTextForPdf(this.userData.postalCode), {
        x: 524,
        y: 261,
        size: normalSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });   

      // Print X on US Sex
      if(this.userData.Sex === '1' || this.userData.Sex === '2') {
        var temporalX = 0;
        if(this.userData.Sex === '1') {
          temporalX = 264;
        } else {
          temporalX = 295;
        }
        page.drawText(this.sanitizeTextForPdf('X'), {
          x: temporalX,
          y: 190,
          size: subtitleSize,
          font: boldFont,
        color: rgb(0, 0, 0)
      });
    }

    // Print Phone Number
    page.drawText(this.sanitizeTextForPdf(this.userData.phoneNumber), {
          x: 482,
          y: 190,
          size: subtitleSize,
          font: boldFont,
        color: rgb(0, 0, 0)
      });

    // Print Email
    page.drawText(this.sanitizeTextForPdf(this.userData.email), {
          x: 311,
          y: 173,
          size: subtitleSize,
          font: boldFont,
        color: rgb(0, 0, 0)
      });
      
      // Agregar firma
      if (this.userData.signature && this.userData.signature.trim() !== '') {
        console.log('Procesando firma:', this.userData.signature.substring(0, 50) + '...');
        
        try {
          // Validar que la firma no sea una imagen vacía
          if (this.isEmptySignature(this.userData.signature)) {
            console.warn('Firma detectada como vacía, omitiendo...');
          } else {
            // Convertir la firma base64 a una imagen para el PDF
            const signatureImage = await this.getImageFromBase64(this.userData.signature);
            
            // Crear una imagen temporal para validar que se puede cargar
            await this.validateImageData(signatureImage);
            
            const signatureBytes = await this.fetchWithRetry(signatureImage, 3);
            
            let signatureEmbed;
            try {
              // Intentar primero como PNG
              signatureEmbed = await pdfDoc.embedPng(signatureBytes);
            } catch (pngError) {
              console.warn('Error con PNG, intentando como JPEG:', pngError);
              // Si falla PNG, intentar como JPEG
              signatureEmbed = await pdfDoc.embedJpg(signatureBytes);
            }
            
            // Calcular dimensiones para mantener la proporción
            const dimensions = signatureEmbed.scale(0.27);
            
            page.drawImage(signatureEmbed, {
              x: 298,
              y: 17,
              width: dimensions.width,
              height: dimensions.height
            });
            
            console.log('Firma agregada exitosamente al PDF');
          }
        } catch (error) {
          console.error('Error al procesar la firma:', error);
          // Mostrar mensaje de error en el PDF
          page.drawText(this.sanitizeTextForPdf('Error al cargar la firma'), {
            x: 298,
            y: 37,
            size: normalSize,
            font,
            color: rgb(1, 0, 0)
          });
        }
      } else {
        console.warn('No hay firma disponible para agregar al PDF');
      }

      const now = new Date();

      const year = now.getFullYear();
      const month = this.translationService.getCurrentLanguage() === 'es' ? now.toLocaleString('es-ES', { month: 'short' }) : now.toLocaleString('en-US', { month: 'short' });
      const day = String(now.getDate()).padStart(2, '0');

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // convierte 0 en 12

      const formattedDate = `${year}/${month}/${day}`;
      const formattedTime = `${hours}:${minutes} ${ampm}`;


      // Print Date/Time of print format
      page.drawText(this.sanitizeTextForPdf(formattedDate), {
            x: 539,
            y: 43,
            size: 9,
            font,
            color: rgb(0, 0, 0)
          });

      page.drawText(this.sanitizeTextForPdf(formattedTime), {
            x: 547,
            y: 28,
            size: 9,
            font,
            color: rgb(0, 0, 0)
          });
      
      // Serializar el PDF a bytes
      const pdfBytes = await pdfDoc.save();
      
      // Convertir a Blob y crear URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      this.pdfUrl = URL.createObjectURL(blob);
      
      this.isGeneratingPdf = false;
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      this.snackBar.open(this.translationService.translate('step5.error'), this.translationService.translate('common.close'), { duration: 3000 });
      this.isGeneratingPdf = false;
    }
  }
  
  
  // Método para limpiar texto y evitar errores de codificación WinAnsi
  private sanitizeTextForPdf(text: string): string {
    if (!text) return '';
    
    // Reemplazar caracteres problemáticos con equivalentes seguros
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Eliminar caracteres de control
      .replace(/[\u00A0-\u00FF]/g, (char) => {
        // Reemplazar caracteres extendidos con equivalentes ASCII
        const charCode = char.charCodeAt(0);
        if (charCode === 0x00A0) return ' '; // Espacio no separable
        if (charCode >= 0x00C0 && charCode <= 0x00C6) return 'A'; // À-Æ
        if (charCode >= 0x00C8 && charCode <= 0x00CB) return 'E'; // È-Ë
        if (charCode >= 0x00CC && charCode <= 0x00CF) return 'I'; // Ì-Ï
        if (charCode === 0x00D1) return 'N'; // Ñ
        if (charCode >= 0x00D2 && charCode <= 0x00D6) return 'O'; // Ò-Ö
        if (charCode >= 0x00D9 && charCode <= 0x00DC) return 'U'; // Ù-Ü
        if (charCode === 0x00DD) return 'Y'; // Ý
        if (charCode >= 0x00E0 && charCode <= 0x00E6) return 'a'; // à-æ
        if (charCode >= 0x00E8 && charCode <= 0x00EB) return 'e'; // è-ë
        if (charCode >= 0x00EC && charCode <= 0x00EF) return 'i'; // ì-ï
        if (charCode === 0x00F1) return 'n'; // ñ
        if (charCode >= 0x00F2 && charCode <= 0x00F6) return 'o'; // ò-ö
        if (charCode >= 0x00F9 && charCode <= 0x00FC) return 'u'; // ù-ü
        if (charCode === 0x00FD || charCode === 0x00FF) return 'y'; // ý, ÿ
        return '?'; // Otros caracteres problemáticos
      })
      .replace(/[^\x20-\x7E]/g, '?'); // Reemplazar cualquier otro carácter no ASCII con ?
  }

  // Método auxiliar para convertir base64 a imagen
  private getImageFromBase64(base64String: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar si ya es una URL de datos válida
        if (base64String.startsWith('data:image')) {
          resolve(base64String);
          return;
        }
        
        // Limpiar la cadena base64 de posibles caracteres problemáticos
        let cleanBase64 = base64String.trim();
        
        // Si contiene coma, tomar solo la parte después de la coma
        if (cleanBase64.includes(',')) {
          cleanBase64 = cleanBase64.split(',')[1];
        }
        
        // Validar que la cadena base64 sea válida
        if (!cleanBase64 || cleanBase64.length === 0) {
          reject(new Error('Cadena base64 vacía'));
          return;
        }
        
        // Verificar que sea una cadena base64 válida
        try {
          atob(cleanBase64);
        } catch (e) {
          reject(new Error('Cadena base64 inválida'));
          return;
        }
        
        // Crear la URL de datos
        const dataUrl = `data:image/png;base64,${cleanBase64}`;
        resolve(dataUrl);
        
      } catch (error) {
        reject(new Error(`Error al procesar base64: ${error}`));
      }
    });
  }

  // Método para validar si una firma está vacía
  private isEmptySignature(signature: string): boolean {
    if (!signature || signature.trim() === '') {
      return true;
    }
    
    // Verificar si es la imagen vacía por defecto de SignaturePad
    const emptySignatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC';
    
    if (signature === emptySignatureData) {
      return true;
    }
    
    // Verificar si la imagen es muy pequeña (probablemente vacía)
    try {
      const base64Data = signature.split(',')[1] || signature;
      if (base64Data.length < 100) { // Muy pequeña para ser una firma real
        return true;
      }
    } catch (error) {
      console.warn('Error al validar firma:', error);
      return true;
    }
    
    return false;
  }

  // Método para validar que los datos de imagen son válidos
   private validateImageData(dataUrl: string): Promise<void> {
     return new Promise((resolve, reject) => {
       const img = new Image();
       
       img.onload = () => {
         // Verificar que la imagen tiene dimensiones válidas
         if (img.width > 0 && img.height > 0) {
           resolve();
         } else {
           reject(new Error('Imagen con dimensiones inválidas'));
         }
       };
       
       img.onerror = () => {
         reject(new Error('No se pudo cargar la imagen'));
       };
       
       // Establecer timeout para evitar esperas indefinidas
       setTimeout(() => {
         reject(new Error('Timeout al validar imagen'));
       }, 5000);
       
       img.src = dataUrl;
     });
   }

   // Método para hacer fetch con reintentos
    private async fetchWithRetry(url: string, maxRetries: number): Promise<ArrayBuffer> {
      let lastError: Error = new Error('Error desconocido');
     
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         console.log(`Intento ${attempt} de ${maxRetries} para cargar imagen`);
         
         const response = await fetch(url);
         
         if (!response.ok) {
           throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
         }
         
         const arrayBuffer = await response.arrayBuffer();
         
         if (arrayBuffer.byteLength === 0) {
           throw new Error('Respuesta vacía del servidor');
         }
         
         console.log(`Imagen cargada exitosamente en intento ${attempt}`);
         return arrayBuffer;
         
       } catch (error) {
         lastError = error as Error;
         console.warn(`Intento ${attempt} falló:`, error);
         
         // Si no es el último intento, esperar antes de reintentar
         if (attempt < maxRetries) {
           const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponencial
           console.log(`Esperando ${delay}ms antes del siguiente intento...`);
           await new Promise(resolve => setTimeout(resolve, delay));
         }
       }
     }
     
     throw new Error(`Falló después de ${maxRetries} intentos. Último error: ${lastError.message}`);
   }
  
  downloadPdf(): void {
    if (this.pdfUrl) {
      const link = document.createElement('a');
      link.href = this.pdfUrl;
      link.download = `resumen_${new Date().getTime()}.pdf`;
      link.click();
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
}