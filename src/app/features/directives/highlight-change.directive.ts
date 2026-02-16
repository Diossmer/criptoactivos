/**
 * Directiva Highlight Change.
 * Aplica animaciones visuales de destello a los elementos cuando su valor numérico cambia.
 * Indica cambios positivos (verde) o negativos (rojo) basados en la comparación de valores.
 */
import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlightChange]',
  standalone: true
})
export class HighlightChangeDirective implements OnChanges {
  @Input() currentPrice!: number;

  @Input() previousPrice!: number;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  /**
   * Detecta cambios en las propiedades de entrada y dispara la animación si corresponde.
   * 
   * @param changes - Las propiedades cambiadas.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Verifica si currentPrice cambió y no es el primer cambio
    if (changes['currentPrice'] && !changes['currentPrice'].firstChange) {
      const current = changes['currentPrice'].currentValue;
      const previous = this.previousPrice;

      // Compara precios y aplica la animación correspondiente
      if (current > previous) {
        this.flashGreen();
      } else if (current < previous) {
        this.flashRed();
      }
    }
  }

  /**
   * Aplica la animación de destello verde para indicar un aumento de precio.
   * Agrega la clase 'flash-green' y la elimina después de la duración de la animación.
   */
  private flashGreen(): void {
    this.renderer.addClass(this.el.nativeElement, 'flash-green');

    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, 'flash-green');
    }, 500);
  }

  /**
   * Aplica la animación de destello rojo para indicar una disminución de precio.
   * Agrega la clase 'flash-red' y la elimina después de la duración de la animación.
   */
  private flashRed(): void {
    this.renderer.addClass(this.el.nativeElement, 'flash-red');

    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, 'flash-red');
    }, 500);
  }
}
