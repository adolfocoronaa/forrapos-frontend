import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../components/dashboard/dashboard-stats.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://forrapos-api-backend-fqfkhkgvebd6deah.mexicocentral-01.azurewebsites.net/api/dashboard/estadisticas';

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }
}
