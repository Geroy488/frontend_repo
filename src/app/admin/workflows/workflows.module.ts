// workflows.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // <-- add FormsModule
import { WorkflowsRoutingModule } from './workflows-routing.module';

import { WorkflowListComponent } from './list.component';
import { WorkflowAddEditComponent } from './add-edit.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,              // ✅ add this
    WorkflowsRoutingModule
  ],
  declarations: [
    WorkflowListComponent,
    WorkflowAddEditComponent
  ]
})
export class WorkflowsModule { }
