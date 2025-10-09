import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '@app/_models/request';

@Injectable({ providedIn: 'root' })   // ✅ must be here
export class RequestsService {
  private apiUrl = 'https://group-project-api-x1mr.onrender.com/requests';
  //private apiUrl = 'http://localhost:4000/requests';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl);
  }

  getById(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`);
  }

   // ✅ NEW: get requests by employee ID
  getByEmployeeId(employeeId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}?employeeId=${employeeId}`);
  }

  create(request: Request): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  update(id: number, request: Request): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }
}
