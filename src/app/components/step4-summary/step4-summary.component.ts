import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataStorageService } from '../../services/data-storage.service';
import { TranslationService } from '../../services/translation.service';
import { UserData } from '../../models/user-data.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-step4-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './step4-summary.component.html',
  styleUrls: ['./step4-summary.component.scss']
})
export class Step4SummaryComponent implements OnInit {
  userData: UserData | null = null;
  isSubmitting = false;
  
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
    });
  }
  
  goBack(): void {
    this.router.navigate(['/step3']);
  }
  
  submitData(): void {
    if (!this.userData) {
      this.snackBar.open('No hay datos para enviar', 'Cerrar', { duration: 3000 });
      return;
    }
    
    this.isSubmitting = true;
    
    // Simular envío a base de datos
    this.dataStorageService.saveToDatabase(this.userData).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Datos enviados correctamente', 'OK', { duration: 3000 });
          this.router.navigate(['/step5']);
        } else {
          this.snackBar.open('Error al enviar los datos', 'Cerrar', { duration: 3000 });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error al enviar datos:', error);
        this.snackBar.open('Error al enviar los datos: ' + (error.message || 'Desconocido'), 'Cerrar', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }
  
  // Métodos auxiliares para mostrar datos en la interfaz
  getYesNoText(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return this.translationService.translate('step4.no_answer');
    return value ? this.translationService.translate('common.yes') : this.translationService.translate('common.no');
  }
  
  // Verificar si todos los datos necesarios están completos
  isDataComplete(): boolean {
    return !!this.userData &&
      !!this.userData.signature &&
      this.userData.consent === true &&
      this.userData.licenseId !== null &&
      this.userData.question1 !== null &&
      this.userData.question2 !== null &&
      this.userData.question3 !== null &&
      !!this.userData.countyOfResidence;
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

  gender(gender: string) {
    if(gender === '1') {
      return this.translationService.translate('step4.gender.male');
    } else if(gender === '2') {
      return this.translationService.translate('step4.gender.female');
    } else {
      return this.translationService.translate('step4.gender.other');
    }
  }

  formatDateDDMMYYYYtoDDMMMYYYY(dateStr: string) {
  // Extraer día, mes y año
  const month = dateStr.slice(0, 2);
  const day = dateStr.slice(2, 4);
  const year = dateStr.slice(4, 8);

  // Crear un objeto Date (meses en JavaScript van de 0 a 11)
  const date = new Date(`${year}-${month}-${day}`);

  // Obtener el nombre corto del mes (ej. "Nov")
  let shortMonth: string;
  if(this.translationService.getCurrentLanguage() === 'es'){
    shortMonth = date.toLocaleString('es-ES', { month: 'short' });
  } else {
    shortMonth = date.toLocaleString('en-US', { month: 'short' });
  }

  // Construir la fecha formateada
  return `${shortMonth}/${day}/${year}`;
}
}