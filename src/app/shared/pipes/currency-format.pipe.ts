/**
 * Pipe de Formato de Moneda.
 * Transforma valores numéricos en cadenas de moneda formateadas (USD).
 * Maneja la precisión decimal dinámicamente basado en la magnitud del valor.
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cryptoCurrency',
  standalone: true
})
export class CryptoCurrencyPipe implements PipeTransform {
  /**
   * Transforma un número en una cadena formateada como moneda.
   * 
   * @param value - El valor numérico a formatear.
   * @param decimals - El número de lugares decimales (por defecto: 2).
   * @returns La cadena de moneda formateada.
   */
  transform(value: number | undefined, decimals: number = 2): string {
    if (value === undefined || value === null) {
      return '$0.00';
    }

    // Para precios muy pequeños (< $1), muestra más decimales
    const effectiveDecimals = value < 1 ? 4 : decimals;

    // Formatear con separadores de miles y decimales
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: effectiveDecimals,
      maximumFractionDigits: effectiveDecimals
    }).format(value);
  }
}
