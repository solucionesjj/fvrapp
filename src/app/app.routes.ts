import { Routes } from '@angular/router';
import { Step1SignatureComponent } from './components/step1-signature/step1-signature.component';
import { Step2BarcodeComponent } from './components/step2-barcode/step2-barcode.component';
import { Step3FormComponent } from './components/step3-form/step3-form.component';
import { Step4SummaryComponent } from './components/step4-summary/step4-summary.component';
import { Step5PdfComponent } from './components/step5-pdf/step5-pdf.component';

export const routes: Routes = [
  { path: '', redirectTo: 'step1', pathMatch: 'full' },
  { path: 'step1', component: Step1SignatureComponent },
  { path: 'step2', component: Step2BarcodeComponent },
  { path: 'step3', component: Step3FormComponent },
  { path: 'step4', component: Step4SummaryComponent },
  { path: 'step5', component: Step5PdfComponent },
  { path: '**', redirectTo: 'step1' }
];
