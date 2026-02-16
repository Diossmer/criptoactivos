/**
 * Tipos del Router de Angular para la definición de rutas.
 */
import { Routes } from '@angular/router';

/**
 * Componente que muestra la lista de activos y sus estadísticas.
 */
import { CryptoMonitorComponent } from './features/components/crypto-monitor/crypto-monitor.component';

export const routes: Routes = [
  { path: '', component: CryptoMonitorComponent },
  { path: '**', redirectTo: '' }
];

