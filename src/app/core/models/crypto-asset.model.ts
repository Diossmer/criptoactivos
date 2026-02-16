/**
 * Modelo CryptoAsset.
 * Representa un activo de criptomoneda con sus datos financieros y estado asociados.
 */

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  priceHistory: number[];
  alertThreshold?: number;
  isAlertTriggered: boolean;
  movingAverage?: number;
  volatility?: number;
  lastUpdate: number;
}
