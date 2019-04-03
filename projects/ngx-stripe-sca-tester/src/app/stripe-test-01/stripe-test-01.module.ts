import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NgxStripeModule } from 'ngx-stripe-sca';

import { SharedModule } from '../shared/shared.module';
import { Test01Component } from './stripe-test-01.component';

const routes: Routes = [
  {
    path: '',
    component: Test01Component
  }
];

@NgModule({
  declarations: [Test01Component],
  imports: [
    CommonModule,
    NgxStripeModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class StripeTest01Module {}
