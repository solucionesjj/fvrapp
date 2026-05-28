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
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
    return date.toDateString();
  }

  override parse(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      // Remover espacios
      value = value.trim();

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let monthIndex = -1;
      let dayStr = '';
      let yearStr = '';

      // Intentar parsear formatos con mes de texto: "Mar/01/1988" o "Mar011988"
      const textWithSeparators = /^([A-Za-z]{3})\/(\d{1,2})\/(\d{4})$/.exec(value);
      const textWithoutSeparators = /^([A-Za-z]{3})(\d{2})(\d{4})$/.exec(value);

      if (textWithSeparators) {
        monthIndex = monthNames.findIndex(m => m.toLowerCase() === textWithSeparators[1].toLowerCase());
        dayStr = textWithSeparators[2];
        yearStr = textWithSeparators[3];
      } else if (textWithoutSeparators) {
        monthIndex = monthNames.findIndex(m => m.toLowerCase() === textWithoutSeparators[1].toLowerCase());
        dayStr = textWithoutSeparators[2];
        yearStr = textWithoutSeparators[3];
      } else {
        // Intentar parsear formatos numéricos: "03/06/1982" o "03061982"
        const numericWithSeparators = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
        const numericWithoutSeparators = /^(\d{2})(\d{2})(\d{4})$/.exec(value);

        if (numericWithSeparators) {
          monthIndex = parseInt(numericWithSeparators[1], 10) - 1;
          dayStr = numericWithSeparators[2];
          yearStr = numericWithSeparators[3];
        } else if (numericWithoutSeparators) {
          monthIndex = parseInt(numericWithoutSeparators[1], 10) - 1;
          dayStr = numericWithoutSeparators[2];
          yearStr = numericWithoutSeparators[3];
        }
      }

      if (monthIndex >= 0 && dayStr && yearStr) {
        const day = parseInt(dayStr, 10);
        const year = parseInt(yearStr, 10);

        if (day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
          return new Date(year, monthIndex, day);
        }
      }
    }

    return super.parse(value);
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
  currentFilteredLocations: CityCounty[] = [];

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
    { city: '', county: 'Franklin', display: 'Franklin' },
    { city: '', county: 'DeSoto', display: 'DeSoto' },
    { city: '', county: 'Polk', display: 'Polk' },
    { city: '', county: 'Calhoun', display: 'Calhoun' },
    { city: '', county: 'Holmes', display: 'Holmes' },
    { city: '', county: 'Manatee', display: 'Manatee' },
    { city: '', county: 'Liberty', display: 'Liberty' },
    { city: '', county: 'Levy', display: 'Levy' },
    { city: '', county: 'Hernando', display: 'Hernando' },
    { city: '', county: 'Flagler', display: 'Flagler' },
    { city: '', county: 'Sumter', display: 'Sumter' },
    { city: '', county: 'Washington', display: 'Washington' },
    { city: '', county: 'Pinellas', display: 'Pinellas' },
    { city: '', county: 'Wakulla', display: 'Wakulla' },
    { city: '', county: 'Dixie', display: 'Dixie' },
    { city: '', county: 'Pasco', display: 'Pasco' },
    { city: '', county: 'Walton', display: 'Walton' },
    { city: '', county: 'Volusia', display: 'Volusia' },
    { city: '', county: 'Collier', display: 'Collier' },
    { city: '', county: 'Nassau', display: 'Nassau' },
    { city: '', county: 'Broward', display: 'Broward' },
    { city: '', county: 'Lee', display: 'Lee' },
    { city: '', county: 'St. Lucie', display: 'St. Lucie' },
    { city: '', county: 'Okaloosa', display: 'Okaloosa' },
    { city: '', county: 'Alachua', display: 'Alachua' },
    { city: '', county: 'Clay', display: 'Clay' },
    { city: '', county: 'Citrus', display: 'Citrus' },
    { city: '', county: 'Duval', display: 'Duval' },
    { city: '', county: 'Hamilton', display: 'Hamilton' },
    { city: '', county: 'Monroe', display: 'Monroe' },
    { city: '', county: 'Osceola', display: 'Osceola' },
    { city: '', county: 'Hendry', display: 'Hendry' },
    { city: '', county: 'Union', display: 'Union' },
    { city: '', county: 'Columbia', display: 'Columbia' },
    { city: '', county: 'Suwannee', display: 'Suwannee' },
    { city: '', county: 'Baker', display: 'Baker' },
    { city: '', county: 'Madison', display: 'Madison' },
    { city: '', county: 'Jackson', display: 'Jackson' },
    { city: '', county: 'Lafayette', display: 'Lafayette' },
    { city: '', county: 'Miami-Dade', display: 'Miami-Dade' },
    { city: '', county: 'Santa Rosa', display: 'Santa Rosa' },
    { city: '', county: 'Jefferson', display: 'Jefferson' },
    { city: '', county: 'Glades', display: 'Glades' },
    { city: '', county: 'Marion', display: 'Marion' },
    { city: '', county: 'Okeechobee', display: 'Okeechobee' },
    { city: '', county: 'Orange', display: 'Orange' },
    { city: '', county: 'Putnam', display: 'Putnam' },
    { city: '', county: 'Bay', display: 'Bay' },
    { city: '', county: 'Escambia', display: 'Escambia' },
    { city: '', county: 'Taylor', display: 'Taylor' },
    { city: '', county: 'Charlotte', display: 'Charlotte' },
    { city: '', county: 'Gadsden', display: 'Gadsden' },
    { city: '', county: 'Seminole', display: 'Seminole' },
    { city: '', county: 'Sarasota', display: 'Sarasota' },
    { city: '', county: 'Highlands', display: 'Highlands' },
    { city: '', county: 'St. Johns', display: 'St. Johns' },
    { city: '', county: 'Bradford', display: 'Bradford' },
    { city: '', county: 'Martin', display: 'Martin' },
    { city: '', county: 'Leon', display: 'Leon' },
    { city: '', county: 'Hillsborough', display: 'Hillsborough' },
    { city: '', county: 'Lake', display: 'Lake' },
    { city: '', county: 'Brevard', display: 'Brevard' },
    { city: '', county: 'Gilchrist', display: 'Gilchrist' },
    { city: '', county: 'Indian River', display: 'Indian River' },
    { city: '', county: 'Hardee', display: 'Hardee' },
    { city: '', county: 'Palm Beach', display: 'Palm Beach' },
    { city: '', county: 'Gulf', display: 'Gulf' }
  ];


  // floridaLocations: CityCounty[] = [
  //   { city: 'Apalachicola', county: 'Franklin', display: 'Apalachicola, Franklin' },
  //   { city: 'Arcadia', county: 'DeSoto', display: 'Arcadia, DeSoto' },
  //   { city: 'Bartow', county: 'Polk', display: 'Bartow, Polk' },
  //   { city: 'Blountstown', county: 'Calhoun', display: 'Blountstown, Calhoun' },
  //   { city: 'Bonifay', county: 'Holmes', display: 'Bonifay, Holmes' },
  //   { city: 'Bradenton', county: 'Manatee', display: 'Bradenton, Manatee' },
  //   { city: 'Bristol', county: 'Liberty', display: 'Bristol, Liberty' },
  //   { city: 'Bronson', county: 'Levy', display: 'Bronson, Levy' },
  //   { city: 'Brooksville', county: 'Hernando', display: 'Brooksville, Hernando' },
  //   { city: 'Bunnell', county: 'Flagler', display: 'Bunnell, Flagler' },
  //   { city: 'Bushnell', county: 'Sumter', display: 'Bushnell, Sumter' },
  //   { city: 'Chipley', county: 'Washington', display: 'Chipley, Washington' },
  //   { city: 'Clearwater', county: 'Pinellas', display: 'Clearwater, Pinellas' },
  //   { city: 'Crawfordville', county: 'Wakulla', display: 'Crawfordville, Wakulla' },
  //   { city: 'Cross City', county: 'Dixie', display: 'Cross City, Dixie' },
  //   { city: 'Dade City', county: 'Pasco', display: 'Dade City, Pasco' },
  //   { city: 'DeFuniak Springs', county: 'Walton', display: 'DeFuniak Springs, Walton' },
  //   { city: 'DeLand', county: 'Volusia', display: 'DeLand, Volusia' },
  //   { city: 'Everglades City', county: 'Collier', display: 'Everglades City, Collier' },
  //   { city: 'Fernandina Beach', county: 'Nassau', display: 'Fernandina Beach, Nassau' },
  //   { city: 'Fort Lauderdale', county: 'Broward', display: 'Fort Lauderdale, Broward' },
  //   { city: 'Fort Myers', county: 'Lee', display: 'Fort Myers, Lee' },
  //   { city: 'Fort Pierce', county: 'St. Lucie', display: 'Fort Pierce, St. Lucie' },
  //   { city: 'Fort Walton Beach', county: 'Okaloosa', display: 'Fort Walton Beach, Okaloosa' },
  //   { city: 'Gainesville', county: 'Alachua', display: 'Gainesville, Alachua' },
  //   { city: 'Green Cove Springs', county: 'Clay', display: 'Green Cove Springs, Clay' },
  //   { city: 'Inverness', county: 'Citrus', display: 'Inverness, Citrus' },
  //   { city: 'Jacksonville', county: 'Duval', display: 'Jacksonville, Duval' },
  //   { city: 'Jasper', county: 'Hamilton', display: 'Jasper, Hamilton' },
  //   { city: 'Key West', county: 'Monroe', display: 'Key West, Monroe' },
  //   { city: 'Kissimmee', county: 'Osceola', display: 'Kissimmee, Osceola' },
  //   { city: 'LaBelle', county: 'Hendry', display: 'LaBelle, Hendry' },
  //   { city: 'Lake Butler', county: 'Union', display: 'Lake Butler, Union' },
  //   { city: 'Lake City', county: 'Columbia', display: 'Lake City, Columbia' },
  //   { city: 'Live Oak', county: 'Suwannee', display: 'Live Oak, Suwannee' },
  //   { city: 'Macclenny', county: 'Baker', display: 'Macclenny, Baker' },
  //   { city: 'Madison', county: 'Madison', display: 'Madison, Madison' },
  //   { city: 'Marianna', county: 'Jackson', display: 'Marianna, Jackson' },
  //   { city: 'Mayo', county: 'Lafayette', display: 'Mayo, Lafayette' },
  //   { city: 'Miami', county: 'Miami-Dade', display: 'Miami, Miami-Dade' },
  //   { city: 'Milton', county: 'Santa Rosa', display: 'Milton, Santa Rosa' },
  //   { city: 'Monticello', county: 'Jefferson', display: 'Monticello, Jefferson' },
  //   { city: 'Moore Haven', county: 'Glades', display: 'Moore Haven, Glades' },
  //   { city: 'Ocala', county: 'Marion', display: 'Ocala, Marion' },
  //   { city: 'Okeechobee', county: 'Okeechobee', display: 'Okeechobee, Okeechobee' },
  //   { city: 'Orlando', county: 'Orange', display: 'Orlando, Orange' },
  //   { city: 'Palatka', county: 'Putnam', display: 'Palatka, Putnam' },
  //   { city: 'Panama City', county: 'Bay', display: 'Panama City, Bay' },
  //   { city: 'Pensacola', county: 'Escambia', display: 'Pensacola, Escambia' },
  //   { city: 'Perry', county: 'Taylor', display: 'Perry, Taylor' },
  //   { city: 'Punta Gorda', county: 'Charlotte', display: 'Punta Gorda, Charlotte' },
  //   { city: 'Quincy', county: 'Gadsden', display: 'Quincy, Gadsden' },
  //   { city: 'Sanford', county: 'Seminole', display: 'Sanford, Seminole' },
  //   { city: 'Sarasota', county: 'Sarasota', display: 'Sarasota, Sarasota' },
  //   { city: 'Sebring', county: 'Highlands', display: 'Sebring, Highlands' },
  //   { city: 'St. Augustine', county: 'St. Johns', display: 'St. Augustine, St. Johns' },
  //   { city: 'Starke', county: 'Bradford', display: 'Starke, Bradford' },
  //   { city: 'Stuart', county: 'Martin', display: 'Stuart, Martin' },
  //   { city: 'Tallahassee', county: 'Leon', display: 'Tallahassee, Leon' },
  //   { city: 'Tampa', county: 'Hillsborough', display: 'Tampa, Hillsborough' },
  //   { city: 'Tavares', county: 'Lake', display: 'Tavares, Lake' },
  //   { city: 'Titusville', county: 'Brevard', display: 'Titusville, Brevard' },
  //   { city: 'Trenton', county: 'Gilchrist', display: 'Trenton, Gilchrist' },
  //   { city: 'Vero Beach', county: 'Indian River', display: 'Vero Beach, Indian River' },
  //   { city: 'Wauchula', county: 'Hardee', display: 'Wauchula, Hardee' },
  //   { city: 'Palm Beach', county: 'Palm Beach', display: 'Palm Beach, Palm Beach' },
  //   { city: 'Wewahitchka', county: 'Gulf', display: 'Wewahitchka, Gulf' }
  // ];
  countyControl = new FormControl('');
  filteredLocations: Observable<CityCounty[]> = new Observable<CityCounty[]>();

  constructor(
    private router: Router,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    public translationService: TranslationService
  ) { }

  ngOnInit(): void {
    // Inicializar el filtro de autocompletado
    this.filteredLocations = this.countyControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filtered = this._filterLocations(value || '');
        this.currentFilteredLocations = filtered;
        return filtered;
      })
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

  formatPhoneNumber(): void {
    // Remover todos los caracteres que no sean números
    const cleaned = this.phoneNumber.replace(/\D/g, '');

    // Limitar a 11 dígitos (1 + 10 dígitos de teléfono US)
    if (cleaned.length > 11) {
      this.phoneNumber = cleaned.substring(0, 11);
      return;
    }

    // Formatear: +1 (ABC) DEF-GHIJ
    if (cleaned.length === 0) {
      this.phoneNumber = '';
    } else if (cleaned.length <= 1) {
      this.phoneNumber = '+' + cleaned;
    } else if (cleaned.length <= 4) {
      this.phoneNumber = '+' + cleaned.substring(0, 1) + ' (' + cleaned.substring(1);
    } else if (cleaned.length <= 7) {
      this.phoneNumber = '+' + cleaned.substring(0, 1) + ' (' + cleaned.substring(1, 4) + ') ' + cleaned.substring(4);
    } else {
      this.phoneNumber = '+' + cleaned.substring(0, 1) + ' (' + cleaned.substring(1, 4) + ') ' + cleaned.substring(4, 7) + '-' + cleaned.substring(7, 11);
    }
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
      // Guardar teléfono sin formato (solo dígitos)
      if (this.phoneNumber.trim()) {
        const cleanedPhone = this.phoneNumber.replace(/\D/g, '');
        updateData.phoneNumber = cleanedPhone;
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

  onCountyBlur(): void {
    // Esperar un momento corto para permitir que si el usuario hizo clic en una opción específica, ese evento se procese antes.
    setTimeout(() => {
      const value = this.countyControl.value || '';
      const exactMatch = this.floridaLocations.some(
        loc => loc.display.toLowerCase() === value.toLowerCase() ||
               loc.county.toLowerCase() === value.toLowerCase()
      );
      
      if (!exactMatch && this.currentFilteredLocations.length > 0) {
        const selected = this.currentFilteredLocations[0];
        this.countyControl.setValue(selected.display);
      }
    }, 200);
  }
}