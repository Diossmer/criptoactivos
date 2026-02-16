/**
 * Servicio Web Worker.
 * Gestiona la comunicación con el Web Worker en segundo plano para cálculos estadísticos pesados.
 * Puente entre el hilo principal y el worker usando Observables de RxJS.
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerRequest, WorkerResponse, StatsResult } from '../models/stats-result.model';

@Injectable({
  providedIn: 'root'
})
export class WebWorkerService {
  private worker?: Worker;
  private statsSubject = new Subject<StatsResult>();

  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.initializeWorker();
  }

  /**
   * Inicializa la instancia del Web Worker y configura los manejadores de mensajes.
   * Verifica el soporte del navegador e instancia el worker desde la fábrica.
   */
  private initializeWorker(): void {
    // Verificar si el navegador soporta Web Workers
    if (typeof Worker !== 'undefined') {
      try {
        // Crear el worker usando la ruta al archivo
        this.worker = new Worker(
          new URL('../workers/crypto-stats.worker', import.meta.url),
          { type: 'module' }
        );

        // Configurar el listener de mensajes
        this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          this.handleWorkerMessage(event.data);
        };

        // Manejar errores del worker
        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
        };

        console.log('✅ Web Worker initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Web Worker:', error);
      }
    } else {
      console.warn('⚠️ Web Workers are not supported in this browser');
    }
  }

  /**
   * Procesa los mensajes entrantes del Web Worker.
   * Emite resultados válidos a través del subject de estadísticas o registra errores.
   * 
   * @param response - El objeto de respuesta del worker.
   */
  private handleWorkerMessage(response: WorkerResponse): void {
    if (response.type === 'stats-result' && response.data) {
      // Emitir resultado vía Subject
      this.statsSubject.next(response.data);
    } else if (response.type === 'error') {
      console.error('Worker calculation error:', response.error);
    } else if (response.type === 'ready') {
      console.log('✅ Worker is ready to receive messages');
    }
  }

  /**
   * Despacha una solicitud de cálculo estadístico al Web Worker.
   * 
   * @param assetId - El identificador único del criptoactivo.
   * @param priceHistory - Array de precios históricos.
   * @param windowSize - El tamaño de la ventana de promedio móvil (por defecto: 10).
   */
  public calculateStats(
    assetId: string,
    priceHistory: number[],
    windowSize: number = 10
  ): void {
    if (!this.worker) {
      console.warn('Worker not initialized, cannot calculate stats');
      return;
    }

    const request: WorkerRequest = {
      type: 'calculate-stats',
      assetId,
      priceHistory,
      windowSize
    };

    // Enviar mensaje al worker
    this.worker.postMessage(request);
  }

  /**
   * Limpia recursos cuando el servicio se destruye.
   * Termina el worker y completa el subject.
   */
  public ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
      console.log('🛑 Worker terminated');
    }
    this.statsSubject.complete();
  }
}
