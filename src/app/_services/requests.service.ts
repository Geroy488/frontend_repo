import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '@app/_models/request';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private apiUrl = `${environment.apiUrl}/requests`; // ✅ consistent with your environments

  constructor(private http: HttpClient) {}

  getAll(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl);
  }

  getById(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`);
  }

  getByEmployeeId(employeeId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}?employeeId=${employeeId}`);
  }

  create(request: any, user?: any): Observable<any> {
    // Send both request and user info to backend
    return this.http.post(this.apiUrl, { ...request, user });
  }

  update(id: number, request: Request): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }
}
