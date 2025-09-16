import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '@app/_models/employee';  // 👈 use the new type
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private baseUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  // ✅ return AccountWithEmployee[] instead of Employee[]
  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  // ✅ same for getById
  getById(id: string | number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  // when creating, you’ll likely send employee data (with accountId)
  create(employee: any) {
    return this.http.post(this.baseUrl, employee);
  }

  // updating also accepts partial employee/account data
  update(id: string | number, employee: any) {
    return this.http.put(`${this.baseUrl}/${id}`, employee);
  }

  delete(id: string | number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
