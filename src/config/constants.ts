import { RewardCategory } from '../types';

export const BASE_DENOMINATORS: Record<RewardCategory, number> = {
  pirate_shop: 137500,
  golden_skin: 1562500,
  vehicle_decal: 7813,
  pickaxe_backpack: 568,
  jam_track: 391,
  loading_screen: 272,
  gizmo: 127,
};

export const REFERENCE_SOURCES = [
  {
    id: 'fortnite-status-odds',
    title: 'Fortnite Status (Publicación de Probabilidades en X)',
    url: 'https://x.com/FortniteStatus/status/2119202610322227327',
    date: '2026-11-07',
    verified: true,
    certainty: 'public_data' as const,
    description: 'Publicación en la cuenta pública de estado del juego con las tasas base por cofre para partidas estándar.',
  },
  {
    id: 'fortnite-blog-announcement',
    title: 'Artículo informativo Cazatesoros (Noticias de Fortnite)',
    url: 'https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time?lang=es-ES',
    date: '2026-11-01',
    verified: true,
    certainty: 'public_data' as const,
    description: 'Anuncio general del evento, mecánicas descritas para grupos y fechas generales de la temporada.',
  },
  {
    id: 'fortnite-gg-database',
    title: 'Fortnite.gg (Base de datos comunitaria de recompensas)',
    url: 'https://fortnite.gg/treasure-hunt',
    date: '2026-11-08',
    verified: true,
    certainty: 'third_party' as const,
    description: 'Compilación comunitaria de cosméticos, rotaciones semanales y detalles de elementos cosméticos.',
  },
  {
    id: 'vgc-token-guide',
    title: 'VGC (Video Games Chronicle) - Guía Pirate Shop Access Token',
    url: 'https://www.videogameschronicle.com/news/fortnite-pirate-shop-access-token-guide/',
    date: '2026-11-08',
    verified: true,
    certainty: 'third_party' as const,
    description: 'Análisis independiente sobre las ventanas de 14 días para 2026 y 2027, y restricciones de objetos.',
  },
];

export const HISTORIC_SESSIONS = [
  {
    id: 'session-2026-11-07-1',
    name: 'Hora del Tesoro 1 (7 nov 2026)',
    nameEn: 'Treasure Hour 1 (Nov 7, 2026)',
    date: '2026-11-07T16:00:00Z',
    multipliers: {
      pirate_shop: 1.5,
      golden_skin: 7.5,
      vehicle_decal: 10.0,
      pickaxe_backpack: 1.0,
      jam_track: 1.0,
      loading_screen: 1.0,
      gizmo: 1.0,
    },
    status: 'historical' as const,
    notes: 'Primera sesión con bonus multiplicadores anunciados públicamente.',
  },
  {
    id: 'session-2026-11-07-2',
    name: 'Hora del Tesoro 2 (7 nov 2026)',
    nameEn: 'Treasure Hour 2 (Nov 7, 2026)',
    date: '2026-11-07T21:00:00Z',
    multipliers: {
      pirate_shop: 2.0,
      golden_skin: 10.0,
      vehicle_decal: 10.0,
      pickaxe_backpack: 1.0,
      jam_track: 1.0,
      loading_screen: 1.0,
      gizmo: 1.0,
    },
    status: 'historical' as const,
    notes: 'Segunda sesión: Ficha x2, Skin x10, Vehículo mantuvo x10 según reportes.',
  },
];

export const EVENT_DATES = {
  startDate: '2026-11-01T00:00:00Z',
  referenceDate: '2026-11-09T10:00:00Z',
  week1: { start: '2026-11-01T00:00:00Z', end: '2026-11-08T00:00:00Z' },
  week2: { start: '2026-11-08T00:00:00Z', end: '2026-11-15T00:00:00Z' },
  week3: { start: '2026-11-15T00:00:00Z', end: '2026-11-22T00:00:00Z' },
  week4: { start: '2026-11-22T00:00:00Z', end: '2026-11-29T00:00:00Z' },
  week5: { start: '2026-11-29T00:00:00Z', end: '2026-12-06T00:00:00Z' },
};
