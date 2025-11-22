import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EstadisticasService } from '../../services/statistics.service';
import {
  ReporteVentas,
  ReporteCompras,
  ReporteFinanciero,
} from './statistics.model';

// Importa Chart.js
import { Chart, registerables } from 'chart.js';
import { from } from 'rxjs';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [EstadisticasService], // Añade el servicio
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class EstadisticasComponent implements OnInit, AfterViewInit, OnDestroy {
  // Pestaña activa
  activeTab: 'ventas' | 'compras' | 'finanzas' = 'ventas';

  // Datos para las pestañas
  reporteVentas: ReporteVentas | null = null;
  reporteCompras: ReporteCompras | null = null;
  reporteFinanciero: ReporteFinanciero | null = null;

  // Instancias de las gráficas (para poder destruirlas)
  private charts: Chart[] = [];

  constructor(private estadisticasService: EstadisticasService) {
    // Registra todos los componentes de Chart.js
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Carga los datos de la primera pestaña al iniciar
    this.cargarDatosVentas();
  }

  ngAfterViewInit(): void {
    // Las gráficas se renderizan *después* de que la vista se inicialice
    // y los datos se hayan cargado.
  }

  ngOnDestroy(): void {
    // Destruye todas las gráficas al salir del componente para evitar fugas de memoria
    this.charts.forEach((chart) => chart.destroy());
  }

  /**
   * Cambia la pestaña activa y carga los datos correspondientes.
   */
  seleccionarPestana(pestana: 'ventas' | 'compras' | 'finanzas'): void {
    this.activeTab = pestana;
    this.destruirGraficas(); // Limpia gráficas anteriores

    // Carga datos bajo demanda
    if (pestana === 'ventas' && !this.reporteVentas) {
      this.cargarDatosVentas();
    } else if (pestana === 'compras' && !this.reporteCompras) {
      this.cargarDatosCompras();
    } else if (pestana === 'finanzas' && !this.reporteFinanciero) {
      this.cargarDatosFinancieros();
    } else {
      // Si los datos ya estaban cargados, simplemente vuelve a renderizar las gráficas
      // Usamos un pequeño timeout para asegurar que el DOM de la pestaña esté visible
      setTimeout(() => this.renderizarGraficasActuales(), 0);
    }
  }

  private cargarDatosVentas(): void {
    this.estadisticasService.getReporteVentas().subscribe((data) => {
      this.reporteVentas = data;
      // Espera a que el DOM se actualice y luego renderiza
      setTimeout(() => this.renderizarGraficasVentas(), 0);
    });
  }

  private cargarDatosCompras(): void {
    this.estadisticasService.getReporteCompras().subscribe((data) => {
      this.reporteCompras = data;
      setTimeout(() => this.renderizarGraficasCompras(), 0);
    });
  }

  private cargarDatosFinancieros(): void {
    this.estadisticasService.getReporteFinanciero().subscribe((data) => {
      this.reporteFinanciero = data;
      setTimeout(() => this.renderizarGraficasFinanzas(), 0);
    });
  }

  private destruirGraficas(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }

  /**
   * Renderiza las gráficas de la pestaña activa.
   */
  private renderizarGraficasActuales(): void {
    if (this.activeTab === 'ventas') this.renderizarGraficasVentas();
    if (this.activeTab === 'compras') this.renderizarGraficasCompras();
    if (this.activeTab === 'finanzas') this.renderizarGraficasFinanzas();
  }

  // --- Métodos para renderizar las gráficas ---

  private renderizarGraficasVentas(): void {
    if (!this.reporteVentas) return;

    // Gráfica 1: Ventas por Mes (Líneas)
    const ctxVentasMes = document.getElementById(
      'chartVentasPorMes'
    ) as HTMLCanvasElement;
    if (ctxVentasMes) {
      this.charts.push(
        new Chart(ctxVentasMes, {
          type: 'line',
          data: {
            labels: this.reporteVentas.ventasPorMes.map((d) => d.periodo),
            datasets: [
              {
                label: 'Ventas Totales',
                data: this.reporteVentas.ventasPorMes.map((d) => d.total),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
              },
            ],
          },
        })
      );
    }

    // Gráfica 2: Top Productos (Barras)
    const ctxTopProductos = document.getElementById(
      'chartTopProductosVendidos'
    ) as HTMLCanvasElement;
    if (ctxTopProductos) {
      this.charts.push(
        new Chart(ctxTopProductos, {
          type: 'bar',
          data: {
            labels: this.reporteVentas.topProductosVendidos.map(
              (d) => d.etiqueta
            ),
            datasets: [
              {
                label: 'Unidades Vendidas',
                data: this.reporteVentas.topProductosVendidos.map(
                  (d) => d.valor
                ),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
              },
            ],
          },
          options: { indexAxis: 'y' }, // Barras horizontales
        })
      );
    }
  }

  private renderizarGraficasCompras(): void {
    if (!this.reporteCompras) return;

    // Gráfica 1: Compras por Mes (Líneas)
    const ctxComprasMes = document.getElementById(
      'chartComprasPorMes'
    ) as HTMLCanvasElement;
    if (ctxComprasMes) {
      this.charts.push(
        new Chart(ctxComprasMes, {
          type: 'line',
          data: {
            labels: this.reporteCompras.comprasPorMes.map((d) => d.periodo),
            datasets: [
              {
                label: 'Compras Totales',
                data: this.reporteCompras.comprasPorMes.map((d) => d.total),
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: true,
              },
            ],
          },
        })
      );
    }
  }

  private renderizarGraficasFinanzas(): void {
    if (!this.reporteFinanciero) return;

    // Gráfica 1: Ingresos vs Costos (Barras agrupadas)
    const ctxFinanzas = document.getElementById(
      'chartFinanzas'
    ) as HTMLCanvasElement;
    if (ctxFinanzas) {
      this.charts.push(
        new Chart(ctxFinanzas, {
          type: 'bar',
          data: {
            labels: this.reporteFinanciero.ingresosMensuales.map(
              (d) => d.periodo
            ),
            datasets: [
              {
                label: 'Ingresos (Ventas)',
                data: this.reporteFinanciero.ingresosMensuales.map(
                  (d) => d.total
                ),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
              },
              {
                label: 'Costos (Compras)',
                data: this.reporteFinanciero.costosMensuales.map(
                  (d) => d.total
                ),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
              },
              {
                label: 'Ganancia Bruta',
                data: this.reporteFinanciero.gananciaMensual.map(
                  (d) => d.total
                ),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
              },
            ],
          },
          options: {
            scales: {
              x: { stacked: false }, // No apiladas
              y: { stacked: false },
            },
          },
        })
      );
    }
  }
}
