import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://127.0.0.1:8000'; // 👈 change this if your backend runs elsewhere

  constructor(private http: HttpClient) {}

  // ✅ Get all tasks
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks`);
  }

  // ✅ Add new task
  addTask(task: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, task);
  }

  // ✅ Update existing task
  updateTask(id: number, task: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tasks/${id}`, task);
  }

  // ✅ Delete task
  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/tasks/${id}`);
  }
}
