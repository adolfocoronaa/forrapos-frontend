// components/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from './dashboard-stats.model';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  isAdmin = false;
  userName = '';
  stats: DashboardStats | null = null;
  loading = false;
  error = '';
  private pollSub: Subscription | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('rol');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.isAdmin = userRole === 'Administrador';
      this.userName = user.name || 'Usuario';
    }

    this.loadStats();

    // optional: poll every 30s to keep dashboard fresh
    this.pollSub = interval(30000).subscribe(() => this.loadStats());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadStats() {
    this.loading = true;
    this.error = '';
    this.dashboardService.getEstadisticas()
      .pipe(
        catchError(err => {
          console.error('Error fetching dashboard', err);
          this.error = 'No se pudieron cargar las estadísticas';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe((data) => {
        this.loading = false;
        if (data) {
          this.stats = data;
        }
      });
  }

  // helper to format date
  formatShortDate(iso: string) {
    try {
      return formatDate(iso, 'dd/MM/yyyy HH:mm', 'es-MX');
    } catch {
      return iso;
    }
  }
}
