import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Employee } from '@app/_models/employee';
import { EmployeesService } from '@app/_services/employee.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  employees?: Employee[];
  employeeId?: [];

  constructor(private employeeService: EmployeesService) {}

  ngOnInit() {
    this.employeeService.getAll()
      .pipe(first())
      .subscribe((employees: Employee[]) => (this.employees = employees));
    
  }

  // ✅ No activate/deactivate methods here,
  // because status belongs to Account, not Employee
}
