import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DataStorageService } from '../../services/data-storage.service';
import { TranslationService } from '../../services/translation.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-step3-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatAutocompleteModule
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
  
  // Lista de los 67 condados de Florida ordenados alfabéticamente
  floridaCounties: string[] = [
    'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun',
    'Charlotte', 'Citrus', 'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie',
    'Duval', 'Escambia', 'Flagler', 'Franklin', 'Gadsden', 'Gilchrist',
    'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands',
    'Hillsborough', 'Holmes', 'Indian River', 'Jackson', 'Jefferson',
    'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty', 'Madison',
    'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau',
    'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'Palm Beach', 'Pasco',
    'Pinellas', 'Polk', 'Putnam', 'Santa Rosa', 'Sarasota', 'Seminole',
    'St. Johns', 'St. Lucie', 'Sumter', 'Suwannee', 'Taylor', 'Union',
    'Volusia', 'Wakulla', 'Walton', 'Washington'
  ];
  
  countyControl = new FormControl('');
  filteredCounties: Observable<string[]> = new Observable<string[]>();
  
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    public translationService: TranslationService
  ) {}
  
  ngOnInit(): void {
    // Inicializar el filtro de autocompletado
    this.filteredCounties = this.countyControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCounties(value || ''))
    );
    
    // Sincronizar el FormControl con el modelo
    this.countyControl.valueChanges.subscribe(value => {
      this.countyOfResidence = value || '';
      this.validateForm();
    });
    
    // Cargar datos guardados si existen
    this.dataStorageService.getUserData().subscribe(userData => {
      if (userData) {
        this.question1 = userData.question1;
        this.question2 = userData.question2;
        this.question3 = userData.question3;
        this.countyOfResidence = userData.countyOfResidence;
        this.email = userData.email || '';
        this.phoneNumber = userData.phoneNumber || '';
        
        // Establecer el valor en el FormControl
        this.countyControl.setValue(userData.countyOfResidence);
        
        this.validateForm();
      }
    });
  }
  
  private _filterCounties(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.floridaCounties.filter(county => 
      county.toLowerCase().includes(filterValue)
    );
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