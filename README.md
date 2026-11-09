
# FORTNITE TREASURE ODDS — ULTIMATE SIMULATOR

> **Professional probability simulator and independent, community-driven mathematical calculator for the 2026 Treasure Hunters event.**

![Fortnite Treasure Odds](https://img.shields.io/badge/Version-1.0.0-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-28%20Tests%20Passed-4ade80?style=for-the-badge&logo=vitest)

---

## ⚖️ Disclaimer and Legal Terms

> **IMPORTANT:**
>
> - **Fortnite** is a registered trademark of **Epic Games, Inc.**
> - This project is an **independent, open-source, community-driven tool**, created by fans strictly for analytical, educational, and statistical purposes.
> - This software is an independent project developed without any relationship or affiliation with **Epic Games, Inc.** It is not sponsored, certified, endorsed, or associated with the company or any of its affiliates.
> - The application runs **100% locally in the user's browser**, using `localStorage`. It does not connect to game servers, interact with Fortnite files, modify matches, or grant real items to player accounts.

---

## 📌 Project Overview

**Fortnite Treasure Odds** is a high-performance analytical web application designed for community players, analysts, and content creators. It allows users to simulate and mathematically calculate the probabilities of obtaining **Pirate Shop Access** and the various weekly rewards available during the Treasure Hunters event.

The application runs **entirely on the client side (no backend, no paid APIs, no registration, and no secret keys)**.

---

## 🎲 Published Reference Drop Rates and Probabilities (November 7, 2026)

Simulator reference date: **November 9, 2026** (Week 2 active: Solid Gold Lil Uzi Vert & Gold Cadillac CT5-V Blackwing).

| Reward | Rarity | Base Denominator | Base Probability per Chest |
|:---|:---:|:---:|:---:|
| **Pirate Shop Access** | Supreme | `137,500` | `~0.00072727%` |
| **Weekly Golden Skin** | Supreme | `1,562,500` | `~0.00006400%` |
| **Weekly Vehicle and Wrap** | Supreme | `7,813` | `~0.01279918%` |
| **Weekly Pickaxe or Back Bling** | Major | `568` | `~0.17605634%` |
| **Weekly Jam Track** | Standard | `391` | `~0.25575448%` |
| **Weekly Loading Screen** | Standard | `272` | `~0.36764706%` |
| **Gizmo (any of the 5)** | Standard | `127` | `~0.78740157%` |

> **Mathematical note about Gizmos:** The `1/127` probability represents obtaining **any Gizmo**, not each of the five individually.
>
> **Duplicate rule:** Treasure rewards cannot be obtained more than once, except for Gizmos, which are stackable.

---

## 🚀 Requirements and Setup Commands

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 3. Run mathematical unit tests

```bash
npm test
```

Runs all 28 tests using Vitest, validating numerically stable formulas (`expm1`, `log1p`), analytical test cases, percentiles, squad calculations, and reproducible PRNG behavior.

### 4. Build for production

```bash
npm run build
```

---

## 🔬 Modules and Features

### 1. Main Dashboard

- Featured **Pirate Shop Access** card displaying probability per chest, recorded chests, median milestone, and multiplier selector.
- Current rotation banner: **Week 2 (November 8–15, 2026)** featuring Solid Gold Lil Uzi Vert and Cadillac CT5-V Blackwing.
- Rigorous educational explanation of the **Gambler's Fallacy**.

### 2. Exact Probability Calculator (`ExactCalculator.tsx`)

- Numerically stable formulas to prevent catastrophic cancellation:

  $$P = 1 - (1 - p)^n = -\text{Math.expm1}(n \cdot \text{Math.log1p}(-p))$$

- Statistical percentiles P10, P25, P50 (median: **95,308 chests** without a bonus, **47,654 chests** with a $\times 2$ multiplier), P75, P90 (**316,605 chests**), P95, and P99.
- Interactive charts powered by Recharts, supporting both linear and logarithmic scales.

### 3. Monte Carlo Simulator (Web Workers)

- Background execution through a **dedicated Web Worker** (`src/workers/monteCarlo.worker.ts`), allowing simulations of up to 100,000 or 1,000,000 attempts without blocking the user interface.
- Stochastic optimization using **geometric sampling**:

  $$K = \lceil \ln(1 - U) / \ln(1 - p) \rceil$$

- **95% Wilson Score confidence interval**, mathematically robust even when zero successes are observed.
- Reproducible seeded pseudorandom number generator (Mulberry32).

### 4. Squad Simulator

- Solo, Duo, Trio, and Squad (4 players) modes.
- Controls for chests per match, matches played, and average match duration.
- Exploration overlap and redundancy factor ($\alpha \in [0, 0.5]$).
- Mathematically demonstrates that the squad advantage comes from opening **more unique chests**, rather than multiplying the drop probability of an individual chest.

### 5. Treasure Hours Planner

- "What is my probability if I play 2 regular hours and 4 bonus hours?"
- Historical session records from November 7, 2026.
- Absolute probability gains in percentage points and time savings.

### 6. Inverse Probability Calculator and Goals

- Determines how many chests, matches, and days are required to reach a 20%, 50%, 80%, 90%, 95%, or 99% probability.
- Available-time calculator: "I have 15 hours this week. What are my chances?"
- Feasibility assessment based on the remaining time in the season.

### 7. Manual Chest Tracker and Log

- Quick-action buttons: `+1`, `+5`, `+10`, `Add Match`, `Undo`.
- Statistics for total chests, regular chests, bonus chests, and historical cumulative probability.
- **CSV** (Excel-compatible) and **JSON** export and import functionality.

### 8. Weekly Reward Catalog and Collection

- Weekly tabs (Week 1, active Week 2, and editable Weeks 3, 4, and 5).
- Checklist of obtained rewards and collection progress.
- Details of the 5 known Gizmos (Sprite Locator, Lucky Locator, Golden Firework, Extraction Accelerator, Portable Extractor).

### 9. Pirate Shop Planner

- Models the two reported 14-day availability windows (one in 2026 and another in 2027).
- Interactive 14-day visual calendar and countdown timer.
- V-Bucks wishlist manager with total monetary value calculations.
- Details of exclusions (real-money purchases, gifts, subscriptions, and Sidekick restrictions).

### 10. Interactive Chest Opening Minigame

- Interactive visual chest opening with animations, confetti particle effects, and reward reveals based on the reference drop rates.

### 11. Extras and Transparency

- "What if the drop rates changed?" simulation mode.
- Calculator for the risk of finishing the season without obtaining the desired reward.
- Comprehensive reference data and public sources page, including links and a glossary of statistical terminology.
- Bilingual support (Spanish / English) and accessible dark / light modes.

---

## 🛠️ Software Architecture

```text
fortnite-treasure-odds/
├── src/
│   ├── types/                # Strict TypeScript definitions
│   ├── config/
│   │   ├── constants.ts      # Base denominators, multipliers, and reference sources
│   │   ├── rewards.ts        # Reward and Gizmo catalog
│   │   └── locales.ts        # i18n dictionary (Spanish / English)
│   ├── math/
│   │   ├── probability.ts    # Exact mathematical engine (log1p, expm1, Wilson CI)
│   │   ├── models.ts         # Categorical and Independent models, duplicate prevention
│   │   ├── squad.ts          # Squad deduplication and performance
│   │   └── *.test.ts         # Vitest tests
│   ├── simulation/
│   │   └── prng.ts           # Reproducible pseudorandom generator (Mulberry32)
│   ├── workers/
│   │   └── monteCarlo.worker.ts # Web Worker for Monte Carlo simulations
│   ├── storage/
│   │   ├── localStorage.ts   # Local persistence layer
│   │   └── exportImport.ts   # JSON and CSV backup utilities
│   ├── components/
│   │   ├── common/          # Navbar, Card, Badge, Modal, Backup
│   │   ├── dashboard/       # PirateCard, EventBanner, QuickStats
│   │   ├── calculator/      # Interactive calculator with Recharts
│   │   ├── simulator/       # Monte Carlo view and Chest Opening Minigame
│   │   ├── squad/           # Squad simulator
│   │   ├── planner/         # Treasure Hours Planner
│   │   ├── inverse/         # Goals and effort calculator
│   │   ├── tracker/         # Manual tracking and history table
│   │   ├── collection/      # Editable reward collection and catalog
│   │   ├── pirateShop/      # Availability window planner and Wishlist
│   │   ├── sources/         # Reference sources and glossary
│   │   └── extras/          # What-If simulator and survival calculator
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React 18 entry point
│   └── index.css           # Tailwind directives and animations
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License

This project is distributed under the [MIT License](LICENSE).
