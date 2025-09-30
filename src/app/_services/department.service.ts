import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '@app/_models/department';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  private baseUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  /** Fetch all departments */
  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseUrl);
  }

  /** Fetch a single department by ID */
  getById(id: string | number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${id}`);
  }

  /** Create new department */
  create(department: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, department);
  }

  /** Update department */
  update(id: string | number, department: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/${id}`, department);
  }

  /** Delete department */
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
