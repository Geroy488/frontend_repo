import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PositionsRoutingModule } from './positions-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PositionsRoutingModule
  ],
  declarations: [
    ListComponent,
    AddEditComponent
  ]
})
export class PositionsModule {}
