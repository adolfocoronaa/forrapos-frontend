// src/app/services/settings.service.ts
import { Injectable, RendererFactory2, Renderer2, Inject, PLATFORM_ID } from '@angular/core'; // 👈 Importa Inject y PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // 👈 Importa isPlatformBrowser
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private renderer: Renderer2 | null = null; // 👈 Puede ser null si está en el servidor
  public isDarkMode$ = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean; // 👈 Para guardar el estado

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object // 👈 Inyecta el PLATFORM_ID
  ) {
    // Comprueba si estamos en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Solo crea el renderer si estamos en el navegador
      this.renderer = this.rendererFactory.createRenderer(null, null);
    }
  }

  /**
   * Inicializa el tema al cargar la aplicación.
   */
  initializeTheme() {
    // 🛑 ¡GUARDIA! No hacer nada si no estamos en el navegador
    if (!this.isBrowser) {
      return;
    }

    // De aquí en adelante, es seguro usar localStorage y window
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme) {
      this.setTheme(storedTheme);
    } else {
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Cambia el tema de la aplicación.
   */
  setTheme(theme: Theme) {
    // 🛑 ¡GUARDIA! No hacer nada si no estamos en el navegador
    if (!this.isBrowser || !this.renderer) {
      return;
    }

    const isDark = theme === 'dark';
    
    // 1. Guarda en localStorage
    localStorage.setItem('theme', theme);

    // 2. Actualiza el BehaviorSubject
    this.isDarkMode$.next(isDark);

    // 3. Aplica la clase al <body>
    if (isDark) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  /**
   * Método simple para "intercalar" el tema actual.
   */
  toggleTheme() {
    // La guardia ya está dentro de setTheme()
    const currentIsDark = this.isDarkMode$.value;
    this.setTheme(currentIsDark ? 'light' : 'dark');
  }
}