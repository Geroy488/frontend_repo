// file: departments/departments-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

const routes: Routes = [
  { path: '', component: ListComponent },           // /departments
  { path: 'add', component: AddEditComponent },     // /departments/add
  { path: 'edit/:id', component: AddEditComponent } // /departments/edit/1
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentsRoutingModule {}
