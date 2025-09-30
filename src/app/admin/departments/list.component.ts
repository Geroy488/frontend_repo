import { Component, OnInit } from '@angular/core';
import { DepartmentsService } from '@app/_services/department.service';
import { Department } from '@app/_models/department';

@Component({
  selector: 'app-departments-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  departments: Department[] = [];

  constructor(private departmentService: DepartmentsService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
      },
      error: (err: any) => console.error('Error loading departments', err)
    });
  }
}
