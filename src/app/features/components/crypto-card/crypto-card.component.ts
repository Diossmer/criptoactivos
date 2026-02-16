/**
 * Componente Crypto Card.
 * Muestra información individual de un activo de criptomoneda.
 * Utiliza estrategias de detección de cambios y directivas para un rendimiento óptimo y respuesta visual.
 */
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoAsset } from '../../../core/models/crypto-asset.model';
import { HighlightChangeDirective } from '../../directives/highlight-change.directive';
import { CryptoCurrencyPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, HighlightChangeDirective, CryptoCurrencyPipe],
  templateUrl: './crypto-card.component.html',
  styleUrl: './crypto-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoCardComponent {
  @Input({ required: true }) asset!: CryptoAsset;

  /**
   * Genera un mensaje descriptivo para la alerta activa.
   * 
   * @returns Una cadena que describe por qué se activó la alerta, o una cadena vacía si está inactiva.
   */
  getAlertMessage(): string {
    if (!this.asset.isAlertTriggered || this.asset.alertThreshold === undefined) {
      return '';
    }

    const currentPrice = this.asset.price.toFixed(2);
    const threshold = this.asset.alertThreshold.toFixed(2);

    return `El precio de ${this.asset.name} ($${currentPrice}) ha superado el umbral configurado de $${threshold}`;
  }
}
