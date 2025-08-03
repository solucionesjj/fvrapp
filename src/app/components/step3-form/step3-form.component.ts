import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataStorageService } from '../../services/data-storage.service';
import { TranslationService } from '../../services/translation.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-step3-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './step3-form.component.html',
  styleUrls: ['./step3-form.component.scss']
})
export class Step3FormComponent implements OnInit {
  question1: boolean | null = null;
  question2: boolean | null = null;
  question3: boolean | null = null;
  countyOfResidence = '';
  email = '';
  phoneNumber = '';
  
  formValid = false;
  
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    public translationService: TranslationService
  ) {}
  
  ngOnInit(): void {
    // Cargar datos guardados si existen
    this.dataStorageService.getUserData().subscribe(userData => {
      if (userData) {
        this.question1 = userData.question1;
        this.question2 = userData.question2;
        this.question3 = userData.question3;
        this.countyOfResidence = userData.countyOfResidence;
        this.email = userData.email || '';
        this.phoneNumber = userData.phoneNumber || '';
        
        this.validateForm();
      }
    });
  }
  
  validateForm(): void {
    this.formValid = 
      this.question1 !== null && 
      this.question2 !== null && 
      this.question3 !== null && 
      this.countyOfResidence.trim().length > 0;
  }
  
  goBack(): void {
    this.router.navigate(['/step2']);
  }
  
  saveAndContinue(): void {
    if (this.formValid) {
      const updateData: any = {
        question1: !!this.question1,
        question2: !!this.question2,
        question3: !!this.question3,
        countyOfResidence: this.countyOfResidence
      };
      
      // Agregar campos opcionales solo si tienen valor
      if (this.email.trim()) {
        updateData.email = this.email.trim();
      }
      if (this.phoneNumber.trim()) {
        updateData.phoneNumber = this.phoneNumber.trim();
      }
      
      this.dataStorageService.updateUserData(updateData);
      
      this.router.navigate(['/step4']);
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