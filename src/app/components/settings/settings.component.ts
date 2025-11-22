import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service'; // Ajusta la ruta
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  
  // Creamos un observable para usarlo en la plantilla
  public isDarkMode$: Observable<boolean>;

  constructor(private settingsService: SettingsService) {
    this.isDarkMode$ = this.settingsService.isDarkMode$.asObservable();
  }

  // Métodos para establecer el tema explícitamente
  setLightMode() {
    this.settingsService.setTheme('light');
  }

  setDarkMode() {
    this.settingsService.setTheme('dark');
  }
}