import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [CommonModule, RouterModule]
})
export class LayoutComponent {
  userName: string = '';
  isAdmin: boolean = false;
  public isSidebarOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('rol');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
  
      this.isAdmin = userRole === 'Administrador';
  
      this.userName = user.name || 'Usuario';
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleSidebar() { // <<< AÑADIR ESTA FUNCIÓN
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
