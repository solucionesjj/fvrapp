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
   * Inicia la decodificación desde la cámara
   * @param videoElement Elemento de video donde se mostrará la cámara
   */
  decodeFromCamera(videoElement: HTMLVideoElement): Observable<any> {
    return new Observable<any>(observer => {
      let isDecoding = false;
      let currentReader: BrowserMultiFormatReader | BrowserPDF417Reader | null = null;
      
      // Primero verificamos si hay dispositivos de cámara disponibles
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          
          if (videoDevices.length === 0) {
            observer.error(new Error('No se encontraron dispositivos de cámara disponibles'));
            return;
          }
          
          // Función para intentar decodificación con PDF417 reader
          const tryPDF417Reader = () => {
            if (isDecoding) return;
            isDecoding = true;
            currentReader = this.pdf417Reader;
            
            console.log('Intentando con PDF417 reader optimizado para licencias de Florida...');
            this.pdf417Reader.decodeFromConstraints(
              {
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 1920, min: 1280 },
                  height: { ideal: 1080, min: 720 },
                  frameRate: { ideal: 30, min: 15 }
                }
              },
              videoElement,
              (result, error) => {
                if (result) {
                  console.log('PDF417 detectado exitosamente');
                  isDecoding = false;
                  observer.next(result);
                  observer.complete();
                  return;
                }
                if (error && !error.toString().includes('NotFoundException')) {
                  console.log('PDF417 reader error, intentando con MultiFormat reader:', error.message);
                  isDecoding = false;
                  tryMultiFormatReader();
                }
              }
            ).catch(pdf417Error => {
              console.error('Error con PDF417 reader para licencia de Florida:', pdf417Error);
              
              // Mensaje específico para errores de PDF417 con licencias de Florida
              if (pdf417Error.message?.includes('NotFoundException')) {
                console.log('No se detecta código PDF417 en licencia de Florida');
              }
              
              console.log('Intentando con MultiFormat reader como respaldo...');
              isDecoding = false;
              tryMultiFormatReader();
            });
          };
          
          // Función para intentar decodificación con MultiFormat reader
          const tryMultiFormatReader = () => {
            if (isDecoding) return;
            isDecoding = true;
            currentReader = this.reader;
            
            console.log('Intentando con MultiFormat reader...');
            this.reader.decodeFromConstraints(
              {
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 1920, min: 1280 },
                  height: { ideal: 1080, min: 720 },
                  frameRate: { ideal: 30, min: 15 }
                }
              },
              videoElement,
              (result, error) => {
                if (result) {
                  console.log('Código detectado con MultiFormat reader');
                  isDecoding = false;
                  observer.next(result);
                  observer.complete();
                  return;
                }
                if (error && !error.toString().includes('NotFoundException')) {
                  console.error('Error en decodificación MultiFormat:', error);
                  // Reintentar con PDF417 después de un breve delay
                  setTimeout(() => {
                    isDecoding = false;
                    tryPDF417Reader();
                  }, 1000);
                }
              }
            ).catch(multiFormatError => {
              console.error('Error al acceder a la cámara:', multiFormatError);
              if (multiFormatError.name === 'NotFoundError') {
                observer.error(new Error('No se pudo acceder a la cámara. Verifica que esté conectada y que tengas permisos.'));
              } else if (multiFormatError.name === 'NotAllowedError') {
                observer.error(new Error('Permisos de cámara denegados. Por favor, permite el acceso a la cámara.'));
              } else {
                observer.error(new Error(`Error de cámara: ${multiFormatError.message}`));
              }
            });
          };
          
          // Comenzar con el PDF417 reader ya que es más específico para licencias
          tryPDF417Reader();
        })
        .catch(enumError => {
          console.error('Error al enumerar dispositivos:', enumError);
          observer.error(new Error('No se pudieron detectar los dispositivos de cámara disponibles'));
        });
      
      // Función de limpieza cuando se cancela la suscripción
      return () => {
        isDecoding = false;
        try {
          // Intentamos liberar recursos si es posible
          const videoElement = document.querySelector('video');
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            videoElement.srcObject = null;
          }
        } catch (error) {
          console.error('Error al limpiar recursos:', error);
        }
      };
    });
  }
  
  /**
   * Detiene la decodificación de la cámara
   */
  stopDecoding(): void {
    try {
      // Los readers se detienen automáticamente cuando se completa el observable
      
      // Detener todos los streams de video activos
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(videoElement => {
        if (videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log('Track stopped:', track.kind);
            });
          }
          videoElement.srcObject = null;
        }
      });
      
      console.log('Barcode decoding stopped');
    } catch (error) {
      console.error('Error stopping barcode decoding:', error);
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