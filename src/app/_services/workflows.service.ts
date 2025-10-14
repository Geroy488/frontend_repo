import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workflow } from '@app/_models/workflow';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkflowsService {
  private apiUrl = `${environment.apiUrl}/workflows`;  // ✅ use environment
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.apiUrl);
  }

  getById(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.apiUrl}/${id}`);
  }

  getByEmployeeId(employeeId: string): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  create(workflow: Workflow): Observable<any> {
    return this.http.post(this.apiUrl, workflow);
  }

  update(id: number, workflow: Partial<Workflow>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, workflow);
  }
}
