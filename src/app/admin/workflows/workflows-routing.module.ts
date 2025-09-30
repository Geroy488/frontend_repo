import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowListComponent } from './list.component';
import { WorkflowAddEditComponent } from './add-edit.component';

const routes: Routes = [
  { path: ':employeeId', component: WorkflowListComponent },
  { path: ':employeeId/add', component: WorkflowAddEditComponent },
  { path: ':employeeId/edit/:id', component: WorkflowAddEditComponent }
];  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule { }
