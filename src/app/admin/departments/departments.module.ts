// file: departments/departments.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,           // ✅ Needed for ngModel (if ever used)
    DepartmentsRoutingModule
  ],
  declarations: [
    ListComponent,
    AddEditComponent
  ]
})
export class DepartmentsModule {}
