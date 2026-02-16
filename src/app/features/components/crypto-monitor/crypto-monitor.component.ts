/**
 * Componente Crypto Monitor.
 * Orquesta la lógica principal de la aplicación, recuperación de datos y gestión de estado.
 * Coordina entre el servicio de datos, el web worker para cálculos y los componentes de presentación.
 */
import { Component, OnInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CryptoDataService } from '../../../core/services/crypto-data.service';
import { WebWorkerService } from '../../../core/services/web-worker.service';
import { CryptoAsset } from '../../../core/models/crypto-asset.model';
import { CryptoCardComponent } from '../crypto-card/crypto-card.component';
import { AlertConfigComponent } from '../alert-config/alert-config.component';

@Component({
  selector: 'app-crypto-monitor',
  standalone: true,
  imports: [CommonModule, CryptoCardComponent, AlertConfigComponent],
  templateUrl: './crypto-monitor.component.html',
  styleUrl: './crypto-monitor.component.css'
})
export class CryptoMonitorComponent implements OnInit, OnDestroy {
  private statsSubscription?: Subscription;

  // Inject services directly
  private cryptoDataService = inject(CryptoDataService);
  private workerService = inject(WebWorkerService);

  assets = this.cryptoDataService.assets;

  topGainers = this.cryptoDataService.topGainers;

  topLosers = this.cryptoDataService.topLosers;

  triggeredAlerts = this.cryptoDataService.triggeredAlerts;

  isConnected = this.cryptoDataService.isConnected;

  constructor() {
    /**
     * Efecto que monitorea actualizaciones de activos y dispara cálculos estadísticos.
     * Despacha trabajos de cálculo al Web Worker para activos con historial suficiente.
     */
    effect(() => {
      const currentAssets = this.assets();

      currentAssets.forEach(asset => {
        if (asset.priceHistory.length >= 2) {
          this.workerService.calculateStats(
            asset.id,
            asset.priceHistory,
            10
          );
        }
      });
    });
  }

  ngOnInit(): void {
    /**
     * Se suscribe a los resultados de cálculos estadísticos del Web Worker.
     * Actualiza el estado del activo con el promedio móvil y volatilidad calculados.
     */
    this.statsSubscription = this.workerService.stats$.subscribe(result => {
      this.cryptoDataService.updateAssetStats(
        result.assetId,
        result.movingAverage,
        result.volatility
      );
    });
  }

  /**
   * Alterna el flujo de actualización de datos en tiempo real.
   */
  toggleUpdates(): void {
    this.cryptoDataService.toggleUpdates();
  }

  /**
   * Actualiza el umbral de alerta para un activo específico.
   * 
   * @param event - Objeto que contiene el ID del activo y el nuevo valor del umbral.
   */
  onThresholdChanged(event: { assetId: string; threshold: number | undefined }): void {
    this.cryptoDataService.setAlertThreshold(event.assetId, event.threshold);
  }

  /**
   * Retorna el conteo de activos con configuraciones de alerta activas.
   * @returns número de alertas configuradas.
   */
  getConfiguredAlertsCount(): number {
    return this.assets().filter(a => a.alertThreshold !== undefined).length;
  }

  /**
   * Función trackBy personalizada para optimizar el renderizado de listas.
   * Identifica items por su ID único de activo para prevenir reconstrucción innecesaria del DOM.
   * 
   * @param index - Índice del item en la lista.
   * @param asset - El item activo.
   * @returns El ID único del activo.
   */
  trackByAssetId(index: number, asset: CryptoAsset): string {
    return asset.id;
  }

  ngOnDestroy(): void {
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
  }
}
