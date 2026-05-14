import { Routes } from '@angular/router';
import { Step1SignatureComponent } from './components/step1-signature/step1-signature.component';
import { Step2BarcodeComponent } from './components/step2-barcode/step2-barcode.component';
import { Step3FormComponent } from './components/step3-form/step3-form.component';
import { Step4SummaryComponent } from './components/step4-summary/step4-summary.component';
import { Step5PdfComponent } from './components/step5-pdf/step5-pdf.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'step1', pathMatch: 'full' },
  { path: 'step1', component: Step1SignatureComponent, canMatch: [AuthGuard] },
  { path: 'step2', component: Step2BarcodeComponent, canMatch: [AuthGuard] },
  { path: 'step3', component: Step3FormComponent, canMatch: [AuthGuard] },
  { path: 'step4', component: Step4SummaryComponent, canMatch: [AuthGuard] },
  { path: 'step5', component: Step5PdfComponent, canMatch: [AuthGuard] },
  { path: '**', redirectTo: 'step1' }
];
