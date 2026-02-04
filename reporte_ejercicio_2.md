> [!IMPORTANT]
> Criptoactivos </br>
> Prog III Mod I-Sec 6y7B: </br>
> punto de evaluación: 6 pts </br>
> Diossmer Villamizar </br>
> 21310567

# Manual Técnico: Plataforma de Monitoreo de Criptoactivos en Tiempo Real

---

## 1. Descripción del Ejercicio
**Objetivo:** Construir una aplicación que procese un feed de precios (simulado) y realice cálculos estadísticos complejos en el cliente sin bloquear el hilo principal.

### Requisitos Funcionales
1.  **Listado de Activos:** Mostrar al menos 5 criptomonedas con actualización cada 200ms.
2.  **Sistema de Alertas Dinámicas:** El usuario define un umbral de precio; si se supera, la tarjeta cambia visualmente.

### Especificaciones Técnicas
1.  **State Management con Signals:** Uso de `WritableSignal` y `computed`.
2.  **Web Workers:** Delegar cálculos pesados (Promedio Móvil, Volatilidad).
3.  **Optimizaciones:** Uso obligatorio de `trackBy` y `OnPush`.

---

## 2. Preparación del Entorno (Mise en place)

Antes de cocinar código, necesitamos nuestros utensilios.

**Versiones Utilizadas:**
-   **Angular:** v17+ (Para soporte de Signals y Standalone Components).
-   **Node.js:** v18.13.0+ (LTS recomendado).

### Paso 1: Instalación

> **¿Cómo?**
> Ejecuta estos comandos en tu terminal.

1.  **Clonar el proyecto:**
    ```bash
    git clone https://github.com/Diossmer/criptoactivos.git
    cd criptoactivos
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar:**
    ```bash
    npm start
    ```

---

## 3. Estructura del Proyecto (El Mapa)

> **Explicación Feynman:**
> Imagina una casa. `src/app` es la casa.
> *   `core`: Son los cimientos y tuberías (Servicios y Modelos) que nadie ve pero hacen que todo funcione.
> *   `features`: Son las habitaciones (la Sala de Monitoreo).
> *   `shared`: Son cosas comunes como los cubiertos (Pipes) que se usan en cualquier habitación.

### Estructura de Carpetas Explicada
```text
src/app/
├── core/                  # EL CEREBRO Y LAS REGLAS
│   ├── models/            # Contratos (Interfaces)
│   ├── services/          # Lógica de negocio (Gestores de datos)
│   └── workers/           # Trabajadores pesados (Web Worker)
├── features/              # LAS PANTALLAS
│   └── crypto-monitor/    # Funcionalidad principal
│       └── components/    # Piezas visuales (Tarjetas, Listas)
└── shared/                # HERRAMIENTAS COMUNES
    ├── pipes/             # Transformadores de texto
    └── utils/             # Funciones matemáticas puras
```

---

## 4. Paso a Paso de la Implementación (El "Manual")

Aquí explicamos **Cómo**, **Por qué** y **Para qué** de cada pieza clave que programamos.

### PASO 1: Los Modelos (El Contrato)
**Ubicación:** `src/app/core/models/crypto-asset.model.ts`

*   **¿Qué hicimos?** Definimos una interfaz `CryptoAsset`.
*   **¿Por qué?** TypeScript necesita reglas. No podemos trabajar con "cualquier cosa".
*   **¿Para qué?** Para que si intentamos usar una criptomoneda sin precio, el código grite "¡Error!" antes de que el usuario lo note.

### PASO 2: El Web Worker (El Ayudante del Sótano)
**Ubicación:** `src/app/core/workers/crypto-stats.worker.ts`

*   **¿Cómo se creó?** Comando `ng generate web-worker app`.
*   **Concepto Feynman:** Imagina que eres un Chef (Hilo Principal). Si te pones a pelar 500 papas (cálculos matemáticos) dejas de cocinar los platos principales. ¿La solución? Le envías las papas al ayudante del sótano (Web Worker). Él las pela y te las devuelve listas. Tú nunca dejaste de cocinar.
*   **Código clave:**
    ```typescript
    addEventListener('message', ({ data }) => {
      // Recibe historial de precios -> Calcula Volatilidad -> Devuelve resultado
      const response = { volatility: calculateVolatility(data.prices) };
      postMessage(response);
    });
    ```

### PASO 3: CryptoDataService (El Corazón Reactivo)
**Ubicación:** `src/app/core/services/crypto-data.service.ts`

*   **Concepto Feynman (Signals):** Antes, para saber si el precio cambiaba, Angular tenía que preguntar puerta por puerta "¿Cambió algo?" (Dirty Checking). Con **Signals**, el precio es como una alarma. Cuando cambia, notifica *instantáneamente* solo a quien le interesa.
*   **¿Cómo funciona?**
    1.  Calcula precios nuevos cada 200ms.
    2.  Usa `rawAssets = signal([...])` como fuente de verdad.
    3.  Usa `computed(() => ...)` para filtrar Ganadores/Perdedores automáticamente.
*   **Característica Especial:** El botón **Toggle**.
    *   Métodos `pauseUpdates()` y `resumeUpdates()` para que el usuario pueda "congelar el tiempo" y analizar datos.

### PASO 4: Componentes Inteligentes vs Tontos

> **Diferencia Feynman:**
> *   **Smart (Manager):** Tiene el teléfono, llama a proveedores (Servicios), gestiona al personal y toma decisiones.
> *   **Dumb (Mesero):** Solo recibe el plato (Datos) y lo lleva a la mesa. No decide qué ingredientes lleva.

#### A. CryptoMonitor (Smart Component)
**Ubicación:** `src/app/features/crypto-monitor/components/crypto-monitor/`
*   **Misión:** Orquestar todo.
*   **Lógica:**
    *   Inyecta el servicio de datos y el worker.
    *   Usa `effect()`: "Cuando cambien los precios, mándale los datos al Worker automáticamente".
    *   Maneja el estado de "En Vivo" o "Pausado".

#### B. CryptoCard (Dumb Component)
**Ubicación:** `src/app/features/crypto-monitor/components/crypto-card/`
*   **Misión:** Verse bien.
*   **Optimización (`OnPush`):** Le dice a Angular: "No me revises a menos que mi plato (Input) haya cambiado". Esto ahorra muchísimos recursos.

### PASO 5: La Directiva de Resaltado (El Efecto Visual)
**Ubicación:** `src/app/features/crypto-monitor/directives/highlight-change.directive.ts`

*   **¿Qué hace?** Cuando el precio cambia:
    *   Sube 📈 -> Pone el fondo verde momentáneamente.
    *   Baja 📉 -> Pone el fondo rojo momentáneamente.
*   **¿Por qué una directiva?** Para poder reutilizar este comportamiento en cualquier etiqueta HTML sin repetir código CSS/JS.

---

## 5. Resumen de Funcionalidad Final

Al finalizar estos pasos, el sistema funciona así:

1.  El **Service** genera precios simulados cada 0.2 segundos.
2.  Actualiza un **Signal**.
3.  El **Componente Inteligente** detecta el cambio, actualiza la vista y envía datos al **Worker**.
4.  El **Worker** calcula estadísticas complejas en segundo plano y las devuelve.
5.  El **Usuario** puede pausar todo con el botón del header para leer con calma.
6.  Si una cripto cruza el **Umbral de Alerta**, se ilumina en la pantalla.

---

> Hecho con ❤️ y Angular Signals para Criptoactivos.
