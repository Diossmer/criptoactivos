/**
 * Modelo StatsResult.
 * Representa los resultados de los cálculos estadísticos devueltos por el Web Worker.
 * Encapsula el promedio móvil, volatilidad y metadatos sobre el cálculo.
 */

export interface StatsResult {
  assetId: string;
  movingAverage: number;
  volatility: number;
  dataPoints: number;
  timestamp: number;
}

/**
 * Solicitud de Cálculo al Worker.
 * Carga útil enviada al Web Worker para iniciar el análisis estadístico.
 */
export interface WorkerRequest {
  type: 'calculate-stats';
  assetId: string;
  priceHistory: number[];
  windowSize?: number;
}

/**
 * Carga útil de Respuesta del Worker.
 * Representa el mensaje de respuesta estructurado del Web Worker.
 * Puede ser un resultado, un error o una señal de listo.
 */
export interface WorkerResponse {
  type: 'stats-result' | 'error' | 'ready';
  data?: StatsResult;
  error?: string;
}
