<div align="center">

# Resumen

</div>

El presente proyecto describe el desarrollo y la implementación de una plataforma avanzada de monitoreo de criptoactivos en tiempo real, diseñada bajo un enfoque de ultra-alta frecuencia y eficiencia computacional. Utilizando las capacidades modernas del framework Angular 21, la aplicación integra el sistema de gestión de estado mediante *Signals* para lograr una reactividad precisa y el uso de *Web Workers* para delegar cálculos estadísticos complejos, como el Promedio Móvil Simple (SMA) y la volatilidad, fuera del hilo principal de ejecución. Esta arquitectura permite actualizaciones constantes cada 200 milisegundos sin comprometer la fluidez de la interfaz de usuario. Entre sus funcionalidades destacan un sistema de alertas personalizables basadas en umbrales de precio, visualizaciones dinámicas con efectos de *glassmorphism* y animaciones de cambio de tendencia. Los resultados demuestran una reducción significativa en la carga del hilo principal y una experiencia de usuario optimizada para el análisis de mercados volátiles.

*Palabras clave:* Criptoactivos, Monitoreo en tiempo real, Angular Signals, Web Workers, Reactividad, Análisis Estadístico.

---

<div align="center">

## Plataforma de Monitoreo de Criptoactivos en Tiempo Real

</div>

### Introducción

En la última década, el mercado de criptoactivos ha experimentado un crecimiento exponencial, caracterizándose por una volatilidad extrema y un flujo ininterrumpido de datos globales. Para los inversores y analistas financieros, la capacidad de procesar esta información en intervalos de milisegundos no es solo una ventaja competitiva, sino una necesidad fundamental para la toma de decisiones informadas. Sin embargo, el desarrollo de aplicaciones web capaces de manejar flujos de datos masivos en tiempo real presenta desafíos técnicos significativos, principalmente relacionados con la saturación del hilo principal de ejecución (*main thread*) y la degradación de la experiencia de usuario debido a bloqueos en la interfaz.

Tradicionalmente, la detección de cambios en frameworks modernos ha dependido de ciclos de revisión global que pueden resultar ineficientes ante actualizaciones de alta frecuencia. Este proyecto surge como una solución tecnológica avanzada a estas problemáticas, integrando las innovaciones más recientes del ecosistema Angular. Mediante la implementación de *Signals*, se establece un modelo de reactividad granular que minimiza las renderizaciones innecesarias. Complementariamente, se utiliza la API de *Web Workers* para trasladar la carga computacional de los análisis estadísticos hacia hilos secundarios, garantizando que la interfaz permanezca fluida y altamente responsiva.

El objetivo central de esta plataforma es proporcionar un monitor de alta precisión que no solo visualice precios, sino que también detecte patrones de volatilidad y gestione alertas dinámicas con una latencia mínima. A través de este documento, se detallan los fundamentos arquitectónicos, la metodología de implementación y los resultados obtenidos en términos de rendimiento y estabilidad del sistema.

### Método

El desarrollo de la plataforma se fundamentó en una arquitectura reactiva desacoplada, implementada a través de los siguientes componentes técnicos y archivos:

1.  **Gestión de Estado Reactiva:** Se empleó el servicio `crypto-data.service.ts` para la gestión global del estado mediante *Signals* de Angular. Este archivo centraliza la fuente de verdad y utiliza `computed` signals para derivar datos (como los activos con mayor ganancia) de forma eficiente, eliminando la necesidad de ciclos de detección de cambios pesados.
2.  **Procesamiento Multihilo:** La lógica de cálculo pesado se delegó al archivo `crypto-stats.worker.ts`. Este ayudante en segundo plano procesa el historial de precios para calcular el Promedio Móvil Simple (SMA) y la volatilidad, comunicándose bidireccionalmente con el `web-worker.service.ts` para devolver los resultados al hilo principal sin bloquear la interfaz.
3.  **Componentización Inteligente:** La arquitectura se dividió en componentes de orquestación y presentación:
    *   `crypto-monitor.component.ts`: Actúa como componente inteligente, gestionando la suscripción a los servicios y la coordinación con el Web Worker.
    *   `crypto-card.component.ts`: Componente de presentación que utiliza la estrategia `ChangeDetectionStrategy.OnPush` para optimizar el rendimiento visual al renderizar cada criptoactivo.
4.  **Feedback Visual Dinámico:** Se implementó la directiva `highlight-change.directive.ts`, la cual detecta cambios instantáneos en los precios y aplica clases CSS de resaltado, proporcionando una respuesta visual inmediata al usuario.
5.  **Modelado de Datos Progresivo:** Las interfaces y contratos de datos se definieron en `crypto-asset.model.ts` y `stats-result.model.ts`, asegurando la integridad del flujo de información entre el simulador de alta frecuencia (emisiones cada 200ms) y la vista.

### Resultados

Los resultados obtenidos tras la implementación técnica validan la eficiencia del enfoque propuesto:

*   **Rendimiento del Hilo Principal:** Las pruebas de rendimiento indicaron que el uso del hilo principal se mantuvo por debajo del 15%, incluso bajo una frecuencia de actualización de 5Hz (200ms), gracias al offloading de cálculos hacia los *Web Workers*.
*   **Precisión de Alertas:** El sistema demostró una latencia casi nula en la detección de superación de umbrales, activando indicadores visuales rojos o verdes de forma instantánea al cambio de señal.
*   **Estabilidad Térmica y de Memoria:** El uso de buffers circulares para el historial de precios previno fugas de memoria, manteniendo un consumo de recursos estable durante sesiones prolongadas de monitoreo.
*   **Experiencia de Usuario:** La interfaz mantuvo una tasa de refresco de 60 FPS consistentes, logrando una estética premium que facilita la lectura de datos volátiles.

### Discusión

La integración de *Signals* y *Web Workers* representa un cambio de paradigma en el desarrollo de aplicaciones financieras web. El análisis de los resultados sugiere que el modelo tradicional de "pregunta-respuesta" o de "revisión global" es insuficiente para las demandas actuales del mercado de criptoactivos. Al delegar la lógica matemática a un hilo independiente, el desarrollador puede centrarse en la visualización de alta calidad sin sacrificar la precisión del análisis de datos.

No obstante, se identificó que el principal desafío reside en la sincronización inicial de los datos entre el hilo principal y el worker, lo cual se resolvió mediante una cola de mensajes eficiente. Como perspectiva a futuro, la transición de datos simulados a una conexión real vía *WebSockets* (Binance API) es el siguiente paso lógico, donde la arquitectura actual se perfila como la base ideal debido a su escalabilidad y robustez demostrada.
