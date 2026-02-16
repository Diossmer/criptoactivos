/**
 * Componente de configuración para umbrales de alerta.
 * Maneja la interfaz de usuario para establecer y borrar alertas de precio en criptoactivos.
 */
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoAsset } from '../../../core/models/crypto-asset.model';

@Component({
  selector: 'app-alert-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-config.component.html',
  styleUrl: './alert-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertConfigComponent {
  @Input({ required: true }) assets: CryptoAsset[] = [];

  @Output() thresholdChanged = new EventEmitter<{ assetId: string; threshold: number | undefined }>();

  /**
   * Procesa el cambio de valor del umbral para un activo específico.
   * Convierte la cadena de entrada a un número y emite el evento de actualización.
   * 
   * @param assetId - El identificador único del criptoactivo.
   * @param value - El nuevo valor del umbral como cadena.
   */
  onThresholdChange(assetId: string, value: string): void {
    let threshold = value ? parseFloat(value) : undefined;
    this.thresholdChanged.emit({ assetId, threshold });
  }

  /**
   * Elimina el umbral de alerta para un activo específico.
   * Emite un evento de actualización con un umbral indefinido.
   * 
   * @param assetId - El identificador único del criptoactivo a limpiar.
   */
  clearThreshold(assetId: string): void {
    this.thresholdChanged.emit({ assetId, threshold: undefined });
  }
}
