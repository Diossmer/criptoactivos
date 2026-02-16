/**
 * Servicio de Datos Cripto.
 * Servicio central que gestiona los feeds de precios en tiempo real y el estado de los datos.
 * Implementa gestión de estado basada en Signals para reactividad eficiente.
 * 
 * Arquitectura:
 * - Usa RxJS interval para actualizaciones periódicas.
 * - Integra con lógica de simulación para fluctuación de precios.
 * - Expone signals computados para estado derivado (ganadores, perdedores, alertas).
 */
import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CryptoAsset } from '../models/crypto-asset.model';
import { simulatePriceChange, calculateChangePercent } from '../../shared/utils/price-simulator';

/**
 * Esquema de configuración para criptomonedas monitoreadas.
 */
interface CryptoConfig {
  id: string;
  name: string;
  symbol: string;
  binanceSymbol: string;
  initialPrice: number;
  volatility: number;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoDataService implements OnDestroy {
  private updateSubscription?: Subscription;
  private readonly UPDATE_INTERVAL = 1000;
  private readonly PRICE_HISTORY_SIZE = 20;

  private readonly cryptoConfigs: CryptoConfig[] = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      symbol: 'BTC',
      binanceSymbol: 'BTCUSDT',
      initialPrice: 43250.00,
      volatility: 0.002
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'ETH',
      binanceSymbol: 'ETHUSDT',
      initialPrice: 2280.50,
      volatility: 0.003
    },
    {
      id: 'BNB',
      name: 'Binance Coin',
      symbol: 'BNB',
      binanceSymbol: 'BNBUSDT',
      initialPrice: 315.75,
      volatility: 0.004
    },
    {
      id: 'SOL',
      name: 'Solana',
      symbol: 'SOL',
      binanceSymbol: 'SOLUSDT',
      initialPrice: 98.45,
      volatility: 0.005
    },
    {
      id: 'ADA',
      name: 'Cardano',
      symbol: 'ADA',
      binanceSymbol: 'ADAUSDT',
      initialPrice: 0.52,
      volatility: 0.006
    },
    {
      id: 'XRP',
      name: 'Ripple',
      symbol: 'XRP',
      binanceSymbol: 'XRPUSDT',
      initialPrice: 0.58,
      volatility: 0.005
    }
  ];

  private readonly rawAssets = signal<CryptoAsset[]>(this.initializeAssets());

  /**
   * Signal Computado - Mayores Ganadores > 5%.
   */
  public readonly topGainers = computed(() => {
    return this.rawAssets()
      .filter(asset => asset.changePercent > 5)
      .sort((a, b) => b.changePercent - a.changePercent);
  });

  /**
   * Signal Computado - Mayores Perdedores < -5%.
   */
  public readonly topLosers = computed(() => {
    return this.rawAssets()
      .filter(asset => asset.changePercent < -5)
      .sort((a, b) => a.changePercent - b.changePercent);
  });

  /**
   * Signal Computado - Alertas Activas.
   */
  public readonly triggeredAlerts = computed(() => {
    return this.rawAssets().filter(asset => asset.isAlertTriggered);
  });

  public readonly assets = this.rawAssets.asReadonly();

  public readonly isConnected = signal<boolean>(true);

  constructor() {
    this.startPriceUpdates();
  }

  /**
   * Inicializa activos con valores de configuración por defecto.
   * 
   * @returns Array inicial de objetos CryptoAsset.
   */
  private initializeAssets(): CryptoAsset[] {
    return this.cryptoConfigs.map(config => ({
      id: config.id,
      name: config.name,
      symbol: config.symbol,
      price: config.initialPrice,
      previousPrice: config.initialPrice,
      changePercent: 0,
      priceHistory: [config.initialPrice],
      isAlertTriggered: false,
      lastUpdate: Date.now()
    }));
  }

  /**
   * Inicia la suscripción de actualización periódica de precios.
   */
  private startPriceUpdates(): void {
    if (this.updateSubscription && !this.updateSubscription.closed) {
      return;
    }

    this.updateSubscription = interval(this.UPDATE_INTERVAL).subscribe(() => {
      this.updatePrices();
    });

    this.isConnected.set(true);
    console.log(`✅ Price updates started (every ${this.UPDATE_INTERVAL}ms)`);
  }

  /**
   * Pausa la suscripción de actualización de precios.
   */
  public pauseUpdates(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = undefined;
    }
    this.isConnected.set(false);
    console.log('⏸️ Price updates paused');
  }

  /**
   * Reanuda la suscripción de actualización de precios.
   */
  public resumeUpdates(): void {
    this.startPriceUpdates();
  }

  /**
   * Alterna entre estados de actualización pausado y activo.
   */
  public toggleUpdates(): void {
    if (this.isConnected()) {
      this.pauseUpdates();
    } else {
      this.resumeUpdates();
    }
  }

  /**
   * Actualiza precios para todas las criptomonedas monitoreadas.
   * Simula volatilidad, actualiza historial y verifica umbrales de alerta.
   */
  private updatePrices(): void {
    const currentAssets = this.rawAssets();

    const updatedAssets = currentAssets.map((asset, index) => {
      const config = this.cryptoConfigs[index];

      // Guarda precio anterior
      const previousPrice = asset.price;

      // Simula nuevo precio con volatilidad específica
      const newPrice = simulatePriceChange(asset.price, config.volatility);

      // Calcula cambio porcentual
      const changePercent = calculateChangePercent(newPrice, previousPrice);

      // Actualiza historial de precios (mantiene últimos N)
      const updatedHistory = [...asset.priceHistory, newPrice];
      if (updatedHistory.length > this.PRICE_HISTORY_SIZE) {
        updatedHistory.shift(); // Elimina el más antiguo
      }

      // Verifica si se activó el umbral de alerta
      const isAlertTriggered = asset.alertThreshold !== undefined &&
        newPrice >= asset.alertThreshold;

      return {
        ...asset,
        previousPrice,
        price: newPrice,
        changePercent,
        priceHistory: updatedHistory,
        isAlertTriggered,
        lastUpdate: Date.now()
      };
    });

    // Actualiza signal - dispara signals computados
    this.rawAssets.set(updatedAssets);
  }

  /**
   * Establece un umbral de alerta de precio para un activo específico.
   * 
   * @param assetId - El identificador único del activo.
   * @param threshold - El umbral de precio a establecer, o undefined para limpiar.
   */
  public setAlertThreshold(assetId: string, threshold: number | undefined): void {
    const currentAssets = this.rawAssets();

    const updatedAssets = currentAssets.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          alertThreshold: threshold,
          isAlertTriggered: threshold !== undefined && asset.price >= threshold
        };
      }
      return asset;
    });

    this.rawAssets.set(updatedAssets);
  }

  /**
   * Actualiza los datos estadísticos (promedio móvil, volatilidad) para un activo específico.
   * 
   * @param assetId - El identificador único del activo.
   * @param movingAverage - El promedio móvil calculado.
   * @param volatility - La volatilidad calculada.
   */
  public updateAssetStats(assetId: string, movingAverage: number, volatility: number): void {
    const currentAssets = this.rawAssets();

    const updatedAssets = currentAssets.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          movingAverage,
          volatility
        };
      }
      return asset;
    });

    this.rawAssets.set(updatedAssets);
  }

  /**
   * Recupera un activo específico por su ID.
   * 
   * @param assetId - El identificador único del activo.
   * @returns El objeto CryptoAsset o undefined si no se encuentra.
   */
  public getAssetById(assetId: string): CryptoAsset | undefined {
    return this.rawAssets().find(asset => asset.id === assetId);
  }

  /**
   * Limpia recursos cuando el servicio se destruye.
   */
  ngOnDestroy(): void {
    this.pauseUpdates();
  }
}
