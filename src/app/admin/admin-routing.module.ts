import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';

const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);
const employeesModule = () => import('./employees/employees.module').then(x => x.EmployeesModule); // ✅ add this

const routes: Routes = [
    { path: '', component: SubNavComponent, outlet: 'subnav' },
    
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: OverviewComponent },
            { path: 'accounts', loadChildren: accountsModule },
            { path: 'employees', loadChildren: employeesModule }  // ✅ now valid
        ]
    },

      // ✅ Add this line only
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
