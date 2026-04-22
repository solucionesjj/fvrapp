import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CityCounty {
  city: string;
  county: string;
  display: string;
}
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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
    return date.toDateString();
  }
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};
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
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
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
  
  licenseCode = '';
  dateOfBirthObj: Date | null = null;
  firstName = '';
  surnames = '';
  address = '';
  sex = '';
  postalCode = '';
  city = '';
  
  formValid = false;
  
  // Lista de ciudades y condados de Florida ordenados alfabéticamente por ciudad
  floridaLocations: CityCounty[] = [
    { city: 'Apalachicola', county: 'Franklin', display: 'Apalachicola, Franklin' },
    { city: 'Arcadia', county: 'DeSoto', display: 'Arcadia, DeSoto' },
    { city: 'Bartow', county: 'Polk', display: 'Bartow, Polk' },
    { city: 'Blountstown', county: 'Calhoun', display: 'Blountstown, Calhoun' },
    { city: 'Bonifay', county: 'Holmes', display: 'Bonifay, Holmes' },
    { city: 'Bradenton', county: 'Manatee', display: 'Bradenton, Manatee' },
    { city: 'Bristol', county: 'Liberty', display: 'Bristol, Liberty' },
    { city: 'Bronson', county: 'Levy', display: 'Bronson, Levy' },
    { city: 'Brooksville', county: 'Hernando', display: 'Brooksville, Hernando' },
    { city: 'Bunnell', county: 'Flagler', display: 'Bunnell, Flagler' },
    { city: 'Bushnell', county: 'Sumter', display: 'Bushnell, Sumter' },
    { city: 'Chipley', county: 'Washington', display: 'Chipley, Washington' },
    { city: 'Clearwater', county: 'Pinellas', display: 'Clearwater, Pinellas' },
    { city: 'Crawfordville', county: 'Wakulla', display: 'Crawfordville, Wakulla' },
    { city: 'Cross City', county: 'Dixie', display: 'Cross City, Dixie' },
    { city: 'Dade City', county: 'Pasco', display: 'Dade City, Pasco' },
    { city: 'DeFuniak Springs', county: 'Walton', display: 'DeFuniak Springs, Walton' },
    { city: 'DeLand', county: 'Volusia', display: 'DeLand, Volusia' },
    { city: 'Everglades City', county: 'Collier', display: 'Everglades City, Collier' },
    { city: 'Fernandina Beach', county: 'Nassau', display: 'Fernandina Beach, Nassau' },
    { city: 'Fort Lauderdale', county: 'Broward', display: 'Fort Lauderdale, Broward' },
    { city: 'Fort Myers', county: 'Lee', display: 'Fort Myers, Lee' },
    { city: 'Fort Pierce', county: 'St. Lucie', display: 'Fort Pierce, St. Lucie' },
    { city: 'Fort Walton Beach', county: 'Okaloosa', display: 'Fort Walton Beach, Okaloosa' },
    { city: 'Gainesville', county: 'Alachua', display: 'Gainesville, Alachua' },
    { city: 'Green Cove Springs', county: 'Clay', display: 'Green Cove Springs, Clay' },
    { city: 'Inverness', county: 'Citrus', display: 'Inverness, Citrus' },
    { city: 'Jacksonville', county: 'Duval', display: 'Jacksonville, Duval' },
    { city: 'Jasper', county: 'Hamilton', display: 'Jasper, Hamilton' },
    { city: 'Key West', county: 'Monroe', display: 'Key West, Monroe' },
    { city: 'Kissimmee', county: 'Osceola', display: 'Kissimmee, Osceola' },
    { city: 'LaBelle', county: 'Hendry', display: 'LaBelle, Hendry' },
    { city: 'Lake Butler', county: 'Union', display: 'Lake Butler, Union' },
    { city: 'Lake City', county: 'Columbia', display: 'Lake City, Columbia' },
    { city: 'Live Oak', county: 'Suwannee', display: 'Live Oak, Suwannee' },
    { city: 'Macclenny', county: 'Baker', display: 'Macclenny, Baker' },
    { city: 'Madison', county: 'Madison', display: 'Madison, Madison' },
    { city: 'Marianna', county: 'Jackson', display: 'Marianna, Jackson' },
    { city: 'Mayo', county: 'Lafayette', display: 'Mayo, Lafayette' },
    { city: 'Miami', county: 'Miami-Dade', display: 'Miami, Miami-Dade' },
    { city: 'Milton', county: 'Santa Rosa', display: 'Milton, Santa Rosa' },
    { city: 'Monticello', county: 'Jefferson', display: 'Monticello, Jefferson' },
    { city: 'Moore Haven', county: 'Glades', display: 'Moore Haven, Glades' },
    { city: 'Ocala', county: 'Marion', display: 'Ocala, Marion' },
    { city: 'Okeechobee', county: 'Okeechobee', display: 'Okeechobee, Okeechobee' },
    { city: 'Orlando', county: 'Orange', display: 'Orlando, Orange' },
    { city: 'Palatka', county: 'Putnam', display: 'Palatka, Putnam' },
    { city: 'Panama City', county: 'Bay', display: 'Panama City, Bay' },
    { city: 'Pensacola', county: 'Escambia', display: 'Pensacola, Escambia' },
    { city: 'Perry', county: 'Taylor', display: 'Perry, Taylor' },
    { city: 'Punta Gorda', county: 'Charlotte', display: 'Punta Gorda, Charlotte' },
    { city: 'Quincy', county: 'Gadsden', display: 'Quincy, Gadsden' },
    { city: 'Sanford', county: 'Seminole', display: 'Sanford, Seminole' },
    { city: 'Sarasota', county: 'Sarasota', display: 'Sarasota, Sarasota' },
    { city: 'Sebring', county: 'Highlands', display: 'Sebring, Highlands' },
    { city: 'St. Augustine', county: 'St. Johns', display: 'St. Augustine, St. Johns' },
    { city: 'Starke', county: 'Bradford', display: 'Starke, Bradford' },
    { city: 'Stuart', county: 'Martin', display: 'Stuart, Martin' },
    { city: 'Tallahassee', county: 'Leon', display: 'Tallahassee, Leon' },
    { city: 'Tampa', county: 'Hillsborough', display: 'Tampa, Hillsborough' },
    { city: 'Tavares', county: 'Lake', display: 'Tavares, Lake' },
    { city: 'Titusville', county: 'Brevard', display: 'Titusville, Brevard' },
    { city: 'Trenton', county: 'Gilchrist', display: 'Trenton, Gilchrist' },
    { city: 'Vero Beach', county: 'Indian River', display: 'Vero Beach, Indian River' },
    { city: 'Wauchula', county: 'Hardee', display: 'Wauchula, Hardee' },
    { city: 'West Palm Beach', county: 'Palm Beach', display: 'West Palm Beach, Palm Beach' },
    { city: 'Wewahitchka', county: 'Gulf', display: 'Wewahitchka, Gulf' }
  ];
  
  countyControl = new FormControl('');
  filteredLocations: Observable<CityCounty[]> = new Observable<CityCounty[]>();
  
  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    public translationService: TranslationService
  ) {}
  
  ngOnInit(): void {
    // Inicializar el filtro de autocompletado
    this.filteredLocations = this.countyControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLocations(value || ''))
    );
    
    // Sincronizar el FormControl con el modelo
    this.countyControl.valueChanges.subscribe(value => {
      const displayStr = value || '';
      const match = this.floridaLocations.find(loc => loc.display === displayStr);
      
      if (match) {
        this.countyOfResidence = match.county;
        this.city = match.city;
      } else {
        // En caso de que se escriba manualmente
        this.countyOfResidence = displayStr;
        this.city = '';
      }
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
        
        // Cargar nuevos campos
        this.licenseCode = userData.licenseCode || '';
        this.firstName = userData.firstName || '';
        this.surnames = userData.surnames || '';
        this.address = userData.address || '';
        this.postalCode = userData.postalCode || '';
        this.city = userData.city || '';
        
        // Manejar el sexo
        if (userData.Sex === '1' || userData.Sex === 'M') {
          this.sex = '1';
        } else if (userData.Sex === '0' || userData.Sex === 'F') {
          this.sex = '0';
        } else {
          this.sex = '';
        }
        
        // Manejar la fecha de nacimiento
        if (userData.dateOfBirth) {
          if (userData.dateOfBirth.length === 8 && !userData.dateOfBirth.includes('-')) {
             this.dateOfBirthObj = this.parseDateString(userData.dateOfBirth);
          } else {
             this.dateOfBirthObj = new Date(userData.dateOfBirth);
             if (isNaN(this.dateOfBirthObj.getTime())) {
               this.dateOfBirthObj = null;
             }
          }
        }
        
        // Buscar si existe la combinación para establecer el display correcto
        const match = this.floridaLocations.find(
          loc => loc.county === userData.countyOfResidence && 
                 (!userData.city || loc.city === userData.city)
        );
        
        if (match) {
          this.countyControl.setValue(match.display);
        } else {
          this.countyControl.setValue(userData.countyOfResidence);
        }
        
        this.validateForm();
      }
    });
  }
  
  private _filterLocations(value: string): CityCounty[] {
    const filterValue = value.toLowerCase();
    return this.floridaLocations.filter(loc => 
      loc.display.toLowerCase().includes(filterValue)
    );
  }
  
  private parseDateString(dateStr: string): Date | null {
    if (!dateStr || dateStr.length !== 8) return null;
    const m = parseInt(dateStr.substring(0, 2), 10) - 1;
    const d = parseInt(dateStr.substring(2, 4), 10);
    const y = parseInt(dateStr.substring(4, 8), 10);
    if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
    return new Date(y, m, d);
  }

  private formatDateString(date: Date | null): string {
    if (!date) return '';
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const y = date.getFullYear().toString();
    return `${m}${d}${y}`;
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
      if (this.city.trim()) {
        updateData.city = this.city.trim();
      }
      
      updateData.licenseCode = this.licenseCode;
      updateData.firstName = this.firstName;
      updateData.surnames = this.surnames;
      updateData.address = this.address;
      updateData.postalCode = this.postalCode;
      updateData.Sex = this.sex;
      
      if (this.dateOfBirthObj) {
        updateData.dateOfBirth = this.formatDateString(this.dateOfBirthObj);
      } else {
        updateData.dateOfBirth = '';
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