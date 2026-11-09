# FORTNITE TREASURE ODDS — SIMULADOR DEFINITIVO

> **Simulador probabilístico profesional y calculadora matemática oficial para el evento Fortnite Treasure Hunters (Cazatesoros), iniciado el 1 de noviembre de 2026.**

![Fortnite Treasure Odds](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-28%20Tests%20Passed-4ade80?style=for-the-badge&logo=vitest)

---

## 📌 Descripción del Proyecto

**Fortnite Treasure Odds** es una aplicación web de alto rendimiento orientada a jugadores de Fortnite, analistas y creadores de contenido. Permite simular y calcular con rigor matemático las probabilidades exactas de conseguir la codiciada **Ficha de Acceso a la Tienda Pirata (Pirate Shop Access)** y todas las demás recompensas del evento Cazatesoros 2026.

La aplicación funciona **completamente en el cliente (sin backend, sin APIs de pago, sin registro y sin claves secretas)** y persiste todos tus datos localmente en `localStorage`.

---

## 🎲 Tasas Oficiales Confirmadas (Epic Games — 7 de noviembre de 2026)

Fecha de referencia del simulador: **9 de noviembre de 2026** (Semana 2 activa: Solid Gold Lil Uzi Vert & Cadillac CT5-V Blackwing dorado).

| Recompensa | Rareza | Denominador Oficial | Probabilidad Base por Cofre |
|:---|:---:|:---:|:---:|
| **Pirate Shop Access** | Supreme | `137.500` | `~0,00072727%` |
| **Aspecto dorado semanal** | Supreme | `1.562.500` | `~0,00006400%` |
| **Vehículo y vinilo semanal** | Supreme | `7.813` | `~0,01279918%` |
| **Pico o mochila semanal** | Major | `568` | `~0,17605634%` |
| **Jam Track semanal** | Standard | `391` | `~0,25575448%` |
| **Pantalla de carga semanal** | Standard | `272` | `~0,36764706%` |
| **Gizmo (cualquiera de los 5)** | Standard | `127` | `~0,78740157%` |

> **Nota matemática sobre Gizmos:** La probabilidad de `1/127` corresponde a obtener **un Gizmo cualquiera**, no a cada uno de los 5 individualmente.
> **Regla de duplicados:** Los tesoros no pueden obtenerse repetidamente, salvo los Gizmos, que son acumulables.

---

## 🚀 Requisitos y Comandos de Ejecución

### 1. Instalación de dependencias:
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo:
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:5173`.

### 3. Ejecutar pruebas unitarias matemáticas:
```bash
npm test
```
Ejecuta los 28 tests con Vitest, validando las fórmulas numéricamente estables (`expm1`, `log1p`), casos de prueba obligatorios, percentiles, escuadrones y PRNG reproducible.

### 4. Compilar para producción:
```bash
npm run build
```

---

## 🔬 Módulos y Funcionalidades

### 1. Dashboard Principal
- Tarjeta destacada de la **Ficha de la Tienda Pirata** con probabilidad por cofre, cofres registrados, hito de la mediana y selector de multiplicador.
- Banner de la rotación actual: **Semana 2 (8–15 de noviembre de 2026)** con Solid Gold Lil Uzi Vert y Cadillac CT5-V Blackwing.
- Aviso educativo riguroso sobre la **Falacia del Jugador**.

### 2. Calculadora de Probabilidades Exactas
- Fórmulas numéricamente estables para evitar cancelación catastrófica:
  $$P = 1 - (1 - p)^n = -\text{Math.expm1}(n \cdot \text{Math.log1p}(-p))$$
- Cálculo para sesiones mixtas:
  $$P = 1 - \prod (1 - p_i)^{n_i} = -\text{Math.expm1}\left(\sum n_i \cdot \text{Math.log1p}(-p_i)\right)$$
- Percentiles estadísticos P10, P25, P50 (mediana: **95.308 cofres** sin bono, **47.654 cofres** con $\times 2$), P75, P90 (**316.605 cofres**), P95 y P99.
- Gráficos interactivos con Recharts en escala lineal y logarítmica.

### 3. Simulador Monte Carlo (Web Workers)
- Ejecución en segundo plano mediante un **Web Worker dedicado** (`src/workers/monteCarlo.worker.ts`), permitiendo simular hasta 100.000 o 1.000.000 de intentos sin bloquear la interfaz.
- Optimización stocástica con **muestreo geométrico**:
  $$K = \lceil \ln(1 - U) / \ln(1 - p) \rceil$$
- Intervalo de confianza de **Wilson Score al 95%**, matemáticamente robusto incluso cuando se obtienen 0 éxitos.
- Generador pseudoaleatorio reproducible basado en semilla (Mulberry32).

### 4. Simulador de Escuadrones
- Modos Solo, Dúo, Trío y Escuadrón (4 jugadores).
- Control de cofres por partida, partidas jugadas y tiempo medio.
- Factor de solapamiento y redundancia de exploración ($\alpha \in [0, 0.5]$).
- Demuestra matemáticamente que la ventaja del escuadrón surge de abrir **más cofres únicos**, y no de multiplicar la probabilidad de un cofre individual.

### 5. Planificador de Horas del Tesoro
- "¿Qué probabilidad tengo si juego 2 horas normales y 4 horas con bonus?"
- Registro histórico de las sesiones del 7 de noviembre de 2026.
- Ganancia absoluta en puntos porcentuales y ahorro de tiempo.

### 6. Calculadora Inversa y Objetivos
- Determina cuántos cofres, partidas y días se necesitan para alcanzar el 20%, 50%, 80%, 90%, 95% o 99%.
- Calculadora de esfuerzo disponible: "¿Tengo 15 horas esta semana, qué posibilidades tengo?".
- Evaluación de viabilidad en función del tiempo restante de la temporada.

### 7. Registro y Tracker Manual de Cofres
- Botones de acción rápida: `+1`, `+5`, `+10`, `Añadir Partida`, `Deshacer`.
- Estadísticas de cofres totales, normales, con bonus y probabilidad acumulada histórica.
- Exportación e importación en **CSV** (compatible con Excel) y **JSON**.

### 8. Catálogo y Colección Semanal
- Pestañas por semana (Semana 1, Semana 2 activa, y Semanas 3, 4 y 5 editables).
- Checklist de premios conseguidos y progreso de colección.
- Detalle de los 5 Gizmos conocidos (Sprite Locator, Lucky Locator, Golden Firework, Extraction Accelerator, Portable Extractor).

### 9. Planificador de la Tienda Pirata
- Modelado de las 2 ventanas de 14 días (una en 2026 y otra en 2027).
- Calendario visual interactivo de 14 días y cuenta regresiva.
- Gestor de Wishlist en paVos (V-Bucks) con cálculo de valor económico total.
- Detalle de exclusiones confirmadas (dinero real, regalos, suscripciones, restricciones de Sidekicks).

### 10. Minijuego Interactivo de Apertura de Cofres
- Apertura visual interactiva con animaciones, efectos de partículas con confetti y revelación según las tasas oficiales reales.

### 11. Extras y Transparencia
- Modo "¿Qué pasaría si Epic aumentara las probabilidades?".
- Calculadora de riesgo de terminar la temporada a cero.
- Página completa de datos y fuentes con enlaces oficiales a Epic Games, Fortnite Status, Fortnite.gg y VGC.
- Glosario de términos estadísticos.
- Soporte bilingüe (Español / Inglés) y modo oscuro / claro.

---

## 🛠️ Arquitectura del Software

```
fortnite-treasure-odds/
├── src/
│   ├── types/               # Definiciones de TypeScript estrictas
│   ├── config/
│   │   ├── constants.ts     # Denominadores oficiales, multiplicadores y fuentes
│   │   ├── rewards.ts       # Catálogo inicial de recompensas y Gizmos
│   │   └── locales.ts       # Diccionario i18n (Español / Inglés)
│   ├── math/
│   │   ├── probability.ts   # Motor matemático exacto (log1p, expm1, Wilson CI)
│   │   ├── models.ts        # Modelos Categórico e Independiente, bloqueo de duplicados
│   │   ├── squad.ts         # Deduplicación y rendimiento de escuadrones
│   │   └── *.test.ts        # Pruebas con Vitest
│   ├── simulation/
│   │   └── prng.ts          # Generador pseudoaleatorio reproducible (Mulberry32)
│   ├── workers/
│   │   └── monteCarlo.worker.ts # Web Worker para simulaciones Monte Carlo
│   ├── storage/
│   │   ├── localStorage.ts  # Capa de persistencia local
│   │   └── exportImport.ts  # Utilidades de backup JSON y CSV
│   ├── components/
│   │   ├── common/          # Navbar, Card, Badge, Modal, Backup
│   │   ├── dashboard/       # PirateCard, EventBanner, QuickStats
│   │   ├── calculator/      # Calculadora interactiva con Recharts
│   │   ├── simulator/       # Vista Monte Carlo y Minijuego de Apertura
│   │   ├── squad/           # Simulador de escuadrones
│   │   ├── planner/         # Planificador de Horas del Tesoro
│   │   ├── inverse/         # Calculadora de objetivos y esfuerzo
│   │   ├── tracker/         # Registro manual y tabla de historial
│   │   ├── collection/      # Colección y catálogo editable
│   │   ├── pirateShop/      # Planificador de ventanas y Wishlist
│   │   ├── sources/         # Fuentes oficiales y glosario
│   │   └── extras/          # Simulador What-If y calculadora de supervivencia
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada React 18
│   └── index.css            # Tailwind directives y animaciones
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚖️ Descargo de Responsabilidad

*Fortnite es una marca registrada de Epic Games, Inc.* Este software es un proyecto independiente de análisis probabilístico y simulación estocástica desarrollado con fines informativos y educativos. No está afiliado ni respaldado por Epic Games, Inc., y no modifica de ninguna manera los clientes ni los servidores del juego.

