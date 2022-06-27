import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule
];

@NgModule({
  declarations: [],
  imports: [
    modules,
    ToastrModule.forRoot()
  ],
  exports: [
    ...modules, ToastrModule
  ]
})
export class SharedModule { }
