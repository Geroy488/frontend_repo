// src/app/_services/position.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Position } from '@app/_models/position';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PositionsService {
  private baseUrl = `${environment.apiUrl}/positions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Position[]> {
    return this.http.get<Position[]>(this.baseUrl);
  }

  getEnabled(): Observable<Position[]> {
  return this.http.get<Position[]>(`${this.baseUrl}/enabled`);
  }

  getById(id: string | number): Observable<Position> {
    return this.http.get<Position>(`${this.baseUrl}/${id}`);
  }
 
  toggleStatus(id: number | string): Observable<Position> {
  return this.http.put<Position>(`${this.baseUrl}/${id}/status`, {});
 }

  create(position: Partial<Position>): Observable<Position> {
    return this.http.post<Position>(this.baseUrl, position);
  }

  update(id: string | number, position: Partial<Position>): Observable<Position> {
    return this.http.put<Position>(`${this.baseUrl}/${id}`, position);
  }

  // delete(id: string | number): Observable<void> {
  //   return this.http.delete<void>(`${this.baseUrl}/${id}`);
  // }
}
