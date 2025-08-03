import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import SignaturePad from 'signature_pad';
import { DataStorageService } from '../../services/data-storage.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-step1-signature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './step1-signature.component.html',
  styleUrls: ['./step1-signature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step1SignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  consent = false;
  signatureError = false;
  isSignaturePadReady = false;
  isSignatureEmptyFlag = true;
  
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    // Cargar datos guardados si existen
    this.dataStorageService.getUserData().subscribe(userData => {
      if (userData) {
        this.consent = userData.consent;
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.initializeSignaturePad();
    
    // Redimensionar el canvas cuando cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }
  
  private initializeSignaturePad(): void {
    const canvas = this.signatureCanvas.nativeElement;
    this.resizeCanvas();
    
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)'
    });
    
    // Agregar listener para actualizar el estado cuando cambie la firma
    this.signaturePad.addEventListener('beginStroke', () => {
      this.updateSignatureEmptyFlag();
    });
    
    this.signaturePad.addEventListener('endStroke', () => {
      this.updateSignatureEmptyFlag();
    });
    
    // Marcar como listo y actualizar estado inicial
    this.isSignaturePadReady = true;
    this.updateSignatureEmptyFlag();
    this.cdr.detectChanges();
    
    // Cargar firma guardada si existe
    this.dataStorageService.getUserData().subscribe(userData => {
      if (userData?.signature) {
        this.signaturePad.fromDataURL(userData.signature);
        this.updateSignatureEmptyFlag();
        this.cdr.detectChanges();
      }
    });
  }
  
  private resizeCanvas(): void {
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const parentElement = canvas.parentElement;
    
    if (parentElement) {
      canvas.width = parentElement.clientWidth * ratio;
      canvas.height = 200 * ratio; // Altura fija de 200px
      canvas.getContext('2d')?.scale(ratio, ratio);
      
      // Limpiar y redibujar la firma si existe
      if (this.signaturePad) {
        const data = this.signaturePad.toDataURL();
        this.signaturePad.clear();
        if (data !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC') {
          this.signaturePad.fromDataURL(data);
        }
      }
    }
  }
  
  clearSignature(): void {
    this.signaturePad.clear();
    this.signatureError = false;
    this.updateSignatureEmptyFlag();
  }
  
  private updateSignatureEmptyFlag(): void {
    if (this.isSignaturePadReady && this.signaturePad) {
      this.isSignatureEmptyFlag = this.signaturePad.isEmpty();
    } else {
      this.isSignatureEmptyFlag = true;
    }
  }
  
  saveAndContinue(): void {
    // Verificar que haya consentimiento
    if (!this.consent) {
      this.signatureError = true;
      return;
    }
    
    // Verificar que haya una firma
    if (this.isSignatureEmptyFlag) {
      this.signatureError = true;
      return;
    }
    
    this.signatureError = false;
    
    // Guardar datos
    this.dataStorageService.updateUserData({
      signature: this.signaturePad.toDataURL(),
      consent: this.consent
    });
    
    // Navegar al siguiente paso
    this.router.navigate(['/step2']);
  }

  confirmRestart(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translationService.translate('confirm.title'),
        message: this.translationService.translate('confirm.message')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataStorageService.clearUserData();
        this.clearSignature();
        this.consent = false;
        this.router.navigate(['/step1']);
      }
    });
  }
}