import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Employee } from '@app/_models/employee';
import { EmployeesService } from '@app/_services/employee.service';
import { DepartmentsService } from '@app/_services/department.service'; // ✅ import
import { Department } from '@app/_models/department'; // ✅ import

@Component({
  selector: 'app-employees-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  employees?: Employee[];
  departments: Department[] = [];   // ✅ store full department objects

  selectedEmployee: Employee | null = null;
  selectedDepartment: number | null = null; // ✅ use departmentId
  // 🔹 Needed for the modal
  // selectedEmployee: Employee | null = null;
  // selectedDepartment: string = '';
  // departments: string[] = ['Engineering', 'Marketing'];

    constructor(
    private employeeService: EmployeesService,
    private departmentsService: DepartmentsService // ✅ inject
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments(); // ✅ fetch departments
  }

  loadEmployees() {
    this.employeeService.getAll()
      .pipe(first())
      .subscribe({
        next: (employees) => {
          this.employees = employees;
        },
        error: (err) => console.error('Error loading employees', err)
      });
  }
  
  loadDepartments() {
  this.departmentsService.getAll()
    .pipe(first())
    .subscribe({
      next: (departments) => this.departments = departments,
      error: (err) => console.error('Error loading departments', err)
    });
}
  // 🔹 Open modal
   openTransferModal(employee: Employee) {
    this.selectedEmployee = employee;
    this.selectedDepartment = null; // reset

    const modal = document.getElementById('transferModal');
    if (modal) {
      const modalInstance = new (window as any).bootstrap.Modal(modal);
      modalInstance.show();
    }
  }

   transferEmployee() {
    if (!this.selectedEmployee || !this.selectedDepartment) return;

    const updatedEmployee = {
      ...this.selectedEmployee,
      departmentId: this.selectedDepartment   // ✅ link by ID
    };

    this.employeeService.update(this.selectedEmployee.employeeId, updatedEmployee)
      .subscribe({
        next: () => {
          this.loadEmployees();
          const modal = document.getElementById('transferModal');
          if (modal) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
          }
        },
        error: (err) => console.error('Transfer failed', err)
      });
  }
}
