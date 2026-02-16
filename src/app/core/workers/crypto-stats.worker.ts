/**
 * Web Worker para cálculos estadísticos de criptomonedas.
 * Descarga tareas computacionales pesadas del hilo principal para asegurar la respuesta de la UI.
 */
import { WorkerRequest, WorkerResponse, StatsResult } from '../models/stats-result.model';

/**
 * Calcula el Promedio Móvil Simple (SMA) para un conjunto dado de precios.
 * Proporciona una indicación suavizada de la tendencia del precio promediando puntos de datos recientes.
 * 
 * @param prices - Array de valores históricos de precios.
 * @param windowSize - El número de puntos de datos a incluir en el promedio (por defecto: 10).
 * @returns El promedio móvil calculado.
 */
function calculateMovingAverage(prices: number[], windowSize: number = 10): number {
  if (prices.length === 0) return 0;

  // Usa todos los datos disponibles si hay menos puntos que el tamaño de la ventana
  const effectiveWindow = Math.min(windowSize, prices.length);

  // Extrae los N precios más recientes
  const recentPrices = prices.slice(-effectiveWindow);

  // Suma todos los precios en la ventana
  const sum = recentPrices.reduce((acc, price) => acc + price, 0);

  // Calcula el promedio
  return sum / recentPrices.length;
}

/**
 * Calcula la Volatilidad (Desviación Estándar) del historial de precios.
 * Mide la dispersión de los puntos de datos de precios respecto a su valor medio.
 * 
 * Fórmula: σ = √(Σ(xi - μ)² / n)
 * 
 * @param prices - Array de valores históricos de precios.
 * @returns La volatilidad calculada (desviación estándar).
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  // Paso 1: Calcular la media (μ)
  const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;

  // Paso 2: Calcular la suma de las diferencias al cuadrado Σ(xi - μ)²
  const squaredDifferences = prices.reduce((acc, price) => {
    const difference = price - mean;
    return acc + (difference * difference);
  }, 0);

  // Paso 3: Calcular la varianza (diferencias al cuadrado / n)
  const variance = squaredDifferences / prices.length;

  // Paso 4: Calcular la desviación estándar (raíz cuadrada de la varianza)
  return Math.sqrt(variance);
}

/**
 * Listener de eventos de mensaje para el Web Worker.
 * Maneja las solicitudes de cálculo entrantes del hilo principal y devuelve resultados estadísticos.
 * 
 * @param event - El evento de mensaje que contiene la solicitud del worker.
 */
self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    if (request.type === 'calculate-stats') {
      const { assetId, priceHistory, windowSize = 10 } = request;

      // Validación: requiere al menos 2 puntos de datos
      if (!priceHistory || priceHistory.length < 2) {
        const errorResponse: WorkerResponse = {
          type: 'error',
          error: 'Insufficient price data for calculations'
        };
        self.postMessage(errorResponse);
        return;
      }

      // Realizar cálculos
      const movingAverage = calculateMovingAverage(priceHistory, windowSize);
      const volatility = calculateVolatility(priceHistory);

      // Construir carga útil del resultado
      const result: StatsResult = {
        assetId,
        movingAverage,
        volatility,
        dataPoints: priceHistory.length,
        timestamp: Date.now()
      };

      // Enviar respuesta al hilo principal
      const response: WorkerResponse = {
        type: 'stats-result',
        data: result
      };

      self.postMessage(response);
    }
  } catch (error) {
    // Manejar errores inesperados durante el procesamiento
    const errorResponse: WorkerResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error in worker'
    };
    self.postMessage(errorResponse);
  }
});

/**
 * Inicializa el worker.
 * Mensaje específico para señalar al hilo principal que está listo.
 */
self.postMessage({ type: 'ready' });
