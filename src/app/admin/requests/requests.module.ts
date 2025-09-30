// file: src/app/admin/requests/requests.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RequestsRoutingModule } from './requests-routing.module';
import { RequestsListComponent } from './list.component';
import { RequestAddEditComponent } from './add-edit.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RequestsRoutingModule
  ],
  declarations: [
    RequestsListComponent,
    RequestAddEditComponent
  ]
})
export class RequestsModule {}
