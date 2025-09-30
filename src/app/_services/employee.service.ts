import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Employee } from '@app/_models/employee';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private baseUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  // 🔹 Get all employees
  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  // 🔹 Get all employees (active + inactive) for requests
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiUrl}/requests/all-employees`);
  }

  // 🔹 Get single employee by ID
  getById(id: number | string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  // 🔹 Get next auto-generated employeeId
  getNextId(): Observable<{ nextId: string }> {
    return this.http.get<{ nextId: string }>(`${this.baseUrl}/next-id`);
  }

  // 🔹 Get all departments (for dropdowns)
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/departments`);
  }

  // 🔹 Create new employee
  create(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  // 🔹 Update existing employee (e.g. transfer department)
  update(id: number | string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee);
  }

  // 🔹 Delete employee
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
