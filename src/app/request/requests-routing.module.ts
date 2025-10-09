// file: src/app/requests/requests-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestsListComponent } from './list.component';
import { RequestAddEditComponent } from './add-edit.component';

const routes: Routes = [
  { path: '', component: RequestsListComponent },
  { path: 'add', component: RequestAddEditComponent },
  { path: 'edit/:id', component: RequestAddEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule {}
