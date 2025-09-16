import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

const routes: Routes = [
  { path: '', component: ListComponent },           // /employees
  { path: 'add', component: AddEditComponent },     // /employees/add
  { path: 'edit/:id', component: AddEditComponent } // /employees/edit/EMP001
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule {}
