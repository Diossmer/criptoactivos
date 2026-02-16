/**
 * Utilidad de Simulador de Precios.
 * Genera fluctuaciones de precios realistas para propósitos de simulación.
 * Simula volatilidad del mercado e inercia sin dependencias de API externas.
 */

/**
 * Genera una fluctuación de precio realista basada en el precio actual y volatilidad.
 * 
 * @param currentPrice - El precio base.
 * @param volatilityFactor - Coeficiente de volatilidad (ej: 0.001 = 0.1%).
 * @returns El nuevo precio simulado.
 */
export function simulatePriceChange(
  currentPrice: number,
  volatilityFactor: number = 0.002
): number {
  // Generar cambio aleatorio dentro del rango de volatilidad
  const randomChange = (Math.random() - 0.5) * 2 * volatilityFactor;

  // Aplicar cambio
  const newPrice = currentPrice * (1 + randomChange);

  // Redondear a 4 decimales para precisión con activos de bajo valor
  return Math.round(newPrice * 10000) / 10000;
}

/**
 * Calcula el cambio porcentual entre dos puntos de precio.
 * 
 * @param currentPrice - El precio actual.
 * @param previousPrice - El precio de referencia.
 * @returns El cambio porcentual redondeado a dos decimales.
 */
export function calculateChangePercent(
  currentPrice: number,
  previousPrice: number
): number {
  if (previousPrice === 0) return 0;

  const change = ((currentPrice - previousPrice) / previousPrice) * 100;

  // Redondear a 2 decimales
  return Math.round(change * 100) / 100;
}
