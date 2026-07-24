export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'vivid',
    name: 'Vivid',
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ec4899'],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#fca5a5', '#fdba74', '#fde68a', '#bbf7d0', '#a5f3fc', '#c7d2fe', '#e9d5ff', '#fbcfe8'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#0c4a6e', '#0369a1', '#0891b2', '#0d9488', '#14b8a6', '#38bdf8', '#67e8f9', '#a5f3fc'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#7c2d12', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#facc15', '#eab308', '#f59e0b'],
  },
  {
    id: 'earth',
    name: 'Earth',
    colors: ['#365314', '#3f6212', '#4d7c0f', '#65a30d', '#84cc16', '#a3e635', '#78716c', '#a8a29e'],
  },
  {
    id: 'monochrome',
    name: 'Monochrome Blue',
    colors: ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
];
