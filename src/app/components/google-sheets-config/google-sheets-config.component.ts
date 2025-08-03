import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { GOOGLE_SHEETS_CONFIG } from '../../config/google-sheets.config';

@Component({
  selector: 'app-google-sheets-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <mat-card class="config-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>settings</mat-icon>
          Configuración de Google Sheets
        </mat-card-title>
        <mat-card-subtitle>
          Configure las credenciales para conectar con Google Sheets
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="config-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Key</mat-label>
            <input matInput [(ngModel)]="config.apiKey" placeholder="AIzaSy...">
            <mat-hint>Obtenida de Google Cloud Console</mat-hint>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Client ID</mat-label>
            <input matInput [(ngModel)]="config.clientId" placeholder="123456789012-...apps.googleusercontent.com">
            <mat-hint>ID de cliente OAuth 2.0</mat-hint>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Spreadsheet ID</mat-label>
            <input matInput [(ngModel)]="config.spreadsheetId" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms">
            <mat-hint>ID de tu Google Sheet (de la URL)</mat-hint>
          </mat-form-field>
          
          <div class="status-section">
            <h3>Estado de la configuración:</h3>
            <div class="status-item">
              <mat-icon [color]="isConfigured() ? 'primary' : 'warn'">
                {{ isConfigured() ? 'check_circle' : 'error' }}
              </mat-icon>
              <span>{{ isConfigured() ? 'Configurado' : 'No configurado' }}</span>
            </div>
            
            <div class="status-item" *ngIf="apiInitialized">
              <mat-icon [color]="userAuthenticated ? 'primary' : 'warn'">
                {{ userAuthenticated ? 'check_circle' : 'error' }}
              </mat-icon>
              <span>{{ userAuthenticated ? 'Autenticado' : 'No autenticado' }}</span>
            </div>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="testConnection()" [disabled]="!isConfigured()">
          <mat-icon>cloud_sync</mat-icon>
          Probar conexión
        </button>
        
        <button mat-raised-button color="accent" (click)="authenticate()" 
                [disabled]="!isConfigured() || !apiInitialized">
          <mat-icon>login</mat-icon>
          Autenticar
        </button>
      </mat-card-actions>
    </mat-card>
    
    <mat-card class="instructions-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>help</mat-icon>
          Instrucciones
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <ol>
          <li>Ve a <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
          <li>Crea un proyecto o selecciona uno existente</li>
          <li>Habilita la Google Sheets API</li>
          <li>Crea credenciales (API Key y OAuth 2.0 Client ID)</li>
          <li>Crea una Google Sheet y obtén su ID</li>
          <li>Ingresa las credenciales arriba y prueba la conexión</li>
        </ol>
        
        <p><strong>Nota:</strong> Para instrucciones detalladas, consulta el archivo GOOGLE_SHEETS_SETUP.md</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .config-card {
      max-width: 600px;
      margin: 20px auto;
    }
    
    .instructions-card {
      max-width: 600px;
      margin: 20px auto;
    }
    
    .config-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .status-section {
      margin-top: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }
    
    mat-card-actions {
      display: flex;
      gap: 12px;
    }
    
    ol {
      padding-left: 20px;
    }
    
    li {
      margin: 8px 0;
    }
    
    a {
      color: #1976d2;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class GoogleSheetsConfigComponent implements OnInit {
  config = {
    apiKey: '',
    clientId: '',
    spreadsheetId: ''
  };
  
  apiInitialized = false;
  userAuthenticated = false;
  
  constructor(
    public googleSheetsService: GoogleSheetsService,
    private snackBar: MatSnackBar
  ) {}
  
  async ngOnInit(): Promise<void> {
    // Cargar configuración actual
    this.config = {
      apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
      clientId: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
      spreadsheetId: GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID
    };
    
    // Verificar estado de inicialización y autenticación
    await this.updateStatus();
  }
  
  private async updateStatus(): Promise<void> {
    try {
      this.apiInitialized = await this.googleSheetsService.isApiInitialized();
      this.userAuthenticated = await this.googleSheetsService.isAuthenticated();
    } catch (error) {
      this.apiInitialized = false;
      this.userAuthenticated = false;
    }
  }
  
  isConfigured(): boolean {
    return this.config.apiKey !== 'YOUR_GOOGLE_API_KEY_HERE' &&
           this.config.clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' &&
           this.config.spreadsheetId !== 'YOUR_SPREADSHEET_ID_HERE' &&
           this.config.apiKey.length > 0 &&
           this.config.clientId.length > 0 &&
           this.config.spreadsheetId.length > 0;
  }
  
  async testConnection(): Promise<void> {
    if (!this.isConfigured()) {
      this.snackBar.open('Por favor, configure todas las credenciales primero', 'Cerrar', { duration: 3000 });
      return;
    }
    
    try {
      // Verificar si la API está inicializada
      const isInitialized = await this.googleSheetsService.isApiInitialized();
      if (isInitialized) {
        this.snackBar.open('Conexión exitosa con Google Sheets API', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.snackBar.open('Error: API no inicializada', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
      // Actualizar estado
      await this.updateStatus();
    } catch (error) {
      console.error('Error al probar la conexión:', error);
      this.snackBar.open('Error al probar la conexión', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  async authenticate(): Promise<void> {
    try {
      const success = await this.googleSheetsService.signIn();
      if (success) {
        this.snackBar.open('Autenticación exitosa', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Actualizar estado después de la autenticación
        await this.updateStatus();
      } else {
        this.snackBar.open('Error en la autenticación', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    } catch (error) {
      console.error('Error durante la autenticación:', error);
      this.snackBar.open('Error durante la autenticación', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}