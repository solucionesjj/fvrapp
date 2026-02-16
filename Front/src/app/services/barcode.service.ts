import { Injectable } from '@angular/core';
import { BrowserMultiFormatReader, BrowserPDF417Reader } from '@zxing/browser';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private reader: BrowserMultiFormatReader;
  private pdf417Reader: BrowserPDF417Reader;

    private fieldMap: Record<string, string> = {
    ANS: 'licenseCode',
    DAC: 'firstName',
    DAD: 'secondName',
    DAG: 'address',
    DAI: 'city',
    DAJ: 'state',
    DAK: 'postalCode',
    DAU: 'height',
    DBA: 'licenseExpirationDate',
    DBB: 'dateOfBirth',
    DBC: 'Sex',
    DBD: 'licenseIssueDate',
    DCA: 'licenseTypeOfVehicle',
    DCB: 'licenseRestrictions',
    DCD: 'licenseOtherVehicles',
    DCF: 'licenseId',
    DCG: 'licenseIssueCountry',
    DCK: 'licenseId2',
    DCS: 'surnames',
    DDA: 'licenseCompliance',
    DDB: 'licenseFormatVersion',
    DDD: 'licenseType',
    DDE: 'surnameAlias',
    DDF: 'firstNameAlias',
    DDG: 'secondNameAlias',
    ZFC: 'licenseTypeOfDriver',
    ZFJ: 'statalId'
  };
  
  constructor() {
    // Inicializar los lectores de códigos de barras con configuración optimizada para licencias
    this.reader = new BrowserMultiFormatReader();
    this.pdf417Reader = new BrowserPDF417Reader();
    
    console.log('BarcodeService inicializado con lectores optimizados para licencias de Florida');
  }
  
  /**
   * Decodifica un código de barras desde una imagen
   * @param imageData URL de la imagen o elemento de imagen
   */
  decodeFromImage(imageData: string | HTMLImageElement): Observable<any> {
    const imageUrl = imageData instanceof HTMLImageElement ? imageData.src : imageData;
    
    return new Observable<any>(observer => {
      // Primero intentamos con el lector PDF417 específico
      this.pdf417Reader.decodeFromImageUrl(imageUrl)
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(pdf417Error => {
          console.log('PDF417 reader failed, trying MultiFormat reader:', pdf417Error.message);
          
          // Si falla el PDF417, intentamos con el lector multi-formato
          this.reader.decodeFromImageUrl(imageUrl)
            .then(result => {
              observer.next(result);
              observer.complete();
            })
            .catch(multiFormatError => {
               console.log('MultiFormat reader failed, trying with preprocessed image');
               
               // Como último recurso, intentamos con la imagen preprocesada
               this.preprocessImage(imageUrl)
                 .then(processedImageUrl => {
                   // Intentamos primero con PDF417 en la imagen procesada
                   return this.pdf417Reader.decodeFromImageUrl(processedImageUrl)
                     .catch(() => {
                       // Si falla, intentamos con MultiFormat en la imagen procesada
                       return this.reader.decodeFromImageUrl(processedImageUrl);
                     });
                 })
                 .then(result => {
                   console.log('Successfully decoded with preprocessed image');
                   observer.next(result);
                   observer.complete();
                 })
                 .catch(finalError => {
                   console.error('All decoding attempts failed:', {
                     pdf417Error: pdf417Error.message,
                     multiFormatError: multiFormatError.message,
                     finalError: finalError.message
                   });
                   
                   // Proporcionar un mensaje de error más específico
                   let errorMessage = 'No se pudo detectar un código de barras en la imagen.';
                   
                   if (multiFormatError.message?.includes('No MultiFormat Readers')) {
                     errorMessage += ' Asegúrate de que la imagen contenga un código PDF417 válido, esté bien iluminada, enfocada y tenga suficiente contraste.';
                   }
                   
                   errorMessage += ' Intenta con una imagen de mejor calidad o con mejor iluminación.';
                   
                   observer.error(new Error(errorMessage));
                 });
             });
        });
    });
  }
  
  /**
   * Parsea un texto AAMVA y devuelve un objeto con los campos
   * @param text Texto AAMVA a parsear
   * @returns Objeto con los campos del AAMVA
   */
    parseAAMVAText(text: string): Record<string, string> {
    const cleanedText = text.replace(/[@\x1e\r]/g, '').trim();
    const lines = cleanedText.split('\n').filter(Boolean);
    const parsed: Record<string, string> = {};

    let currentKey: string | null = null;

    for (let line of lines) {
      const match = line.match(/^([A-Z]{3})(.*)/);
      if (match) {
        const [_, code, value] = match;
        currentKey = code;
        if (this.fieldMap[code]) {
          if(code === 'ANS') {
            parsed[this.fieldMap[code]] = this.extractDAQValue(value) ?? '';
          } else {
            parsed[this.fieldMap[code]] = value.trim();
          }
        }
      } else if (currentKey && this.fieldMap[currentKey]) {
        parsed[this.fieldMap[currentKey]] += ' ' + line.trim();
      }
    }

    return parsed;
  }

  extractDAQValue(text: string) {
  const match = text.match(/DAQ(.{13})/);
  return match ? match[1] : null;
}
  
  /**
   * Inicia la decodificación desde la cámara con implementación simplificada
   * @param videoElement Elemento de video donde se mostrará la cámara
   */
  decodeFromCamera(videoElement: HTMLVideoElement): Observable<any> {
    return new Observable<any>(observer => {
      let stream: MediaStream | null = null;
      let scanInterval: any = null;
      let isScanning = false;
      
      console.log('Iniciando captura de cámara simplificada para códigos de barras');
      
      // Configuración de cámara optimizada
      const constraints = {
        video: {
          facingMode: 'environment', // Cámara trasera preferida
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };
      
      // Función para capturar y analizar frame
      const captureAndAnalyze = async () => {
        if (!isScanning || !videoElement.videoWidth || !videoElement.videoHeight) {
          return;
        }
        
        try {
          // Crear canvas para capturar frame
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.error('No se pudo obtener contexto del canvas');
            return;
          }
          
          // Configurar canvas con dimensiones del video
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          // Capturar frame actual
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // Convertir a imagen para análisis
          const imageDataUrl = canvas.toDataURL('image/png');
          
          // Intentar decodificar con PDF417 primero (específico para licencias)
           try {
             const result = await this.pdf417Reader.decodeFromImageUrl(imageDataUrl);
             if (result) {
               console.log('✅ Código PDF417 detectado exitosamente');
               cleanup();
               observer.next(result);
               observer.complete();
               return;
             }
           } catch (pdf417Error) {
             // Si PDF417 falla, intentar con MultiFormat
             try {
               const result = await this.reader.decodeFromImageUrl(imageDataUrl);
               if (result) {
                 console.log('✅ Código detectado con MultiFormat reader');
                 cleanup();
                 observer.next(result);
                 observer.complete();
                 return;
               }
             } catch (multiFormatError: any) {
               // Errores silenciosos durante escaneo continuo
               // Solo logear errores no relacionados con "no encontrado"
               if (!multiFormatError.message?.includes('NotFoundException')) {
                 console.debug('Frame sin código detectado');
               }
             }
           }
        } catch (error) {
          console.error('Error al capturar frame:', error);
        }
      };
      
      // Función de limpieza
      const cleanup = () => {
        isScanning = false;
        
        if (scanInterval) {
          clearInterval(scanInterval);
          scanInterval = null;
        }
        
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('Track detenido:', track.kind);
          });
          stream = null;
        }
        
        if (videoElement.srcObject) {
          videoElement.srcObject = null;
        }
      };
      
      // Iniciar cámara
      navigator.mediaDevices.getUserMedia(constraints)
        .then(mediaStream => {
          stream = mediaStream;
          videoElement.srcObject = stream;
          
          // Esperar a que el video esté listo
          videoElement.onloadedmetadata = () => {
            videoElement.play()
              .then(() => {
                console.log('📹 Cámara iniciada, comenzando escaneo...');
                isScanning = true;
                
                // Iniciar escaneo cada 500ms (2 FPS de análisis)
                scanInterval = setInterval(captureAndAnalyze, 500);
              })
              .catch(playError => {
                console.error('Error al reproducir video:', playError);
                observer.error(new Error('No se pudo iniciar la reproducción de video'));
              });
          };
          
          videoElement.onerror = (error) => {
            console.error('Error en elemento video:', error);
            observer.error(new Error('Error en la reproducción de video'));
          };
        })
        .catch(error => {
          console.error('Error al acceder a la cámara:', error);
          
          let errorMessage = 'Error al acceder a la cámara';
          
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara.';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró ninguna cámara disponible.';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'La cámara está siendo usada por otra aplicación.';
          } else {
            errorMessage = `Error de cámara: ${error.message}`;
          }
          
          observer.error(new Error(errorMessage));
        });
      
      // Función de limpieza para cuando se cancela la suscripción
      return () => {
        console.log('🛑 Deteniendo captura de cámara');
        cleanup();
      };
    });
  }
  
  /**
   * Detiene la decodificación de la cámara (implementación simplificada)
   */
  stopDecoding(): void {
    try {
      console.log('🛑 Deteniendo decodificación de códigos de barras');
      
      // Detener todos los streams de video activos
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(videoElement => {
        if (videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log('📹 Track detenido:', track.kind);
            });
          }
          videoElement.srcObject = null;
        }
      });
      
      console.log('✅ Decodificación de códigos de barras detenida');
    } catch (error) {
      console.error('❌ Error al detener decodificación:', error);
    }
  }
  
  /**
   * Preprocesa una imagen para mejorar la detección de códigos de barras
   * @param imageUrl URL de la imagen
   */
  private preprocessImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Dibujar la imagen original
          ctx.drawImage(img, 0, 0);
          
          // Aplicar filtros para mejorar el contraste
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Aumentar el contraste
          for (let i = 0; i < data.length; i += 4) {
            // Convertir a escala de grises y aumentar contraste
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const contrast = ((gray / 255 - 0.5) * 1.5 + 0.5) * 255;
            const value = contrast > 128 ? 255 : 0; // Binarizar
            
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
            // data[i + 3] es alpha, lo dejamos igual
          }
          
          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL());
        } else {
          reject(new Error('No se pudo obtener el contexto del canvas'));
        }
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  }

  /**
   * Analiza los datos del código de barras PDF417
   * Esta es una implementación básica, en un caso real
   * se analizaría según el formato específico del código
   */
  parseBarcode(data: string): any {
    // Implementación básica para demostración
    // En un caso real, se analizaría según el formato específico del código
    try {
      // Intentamos parsear como JSON por si viene en ese formato
      return JSON.parse(data);
    } catch (e) {
      // Si no es JSON, devolvemos el texto plano
      return {
        rawData: data,
        // Aquí se podrían extraer campos específicos según el formato del código
      };
    }
  }
}