import { useMindMapStore } from '../store/useMindMapStore';
import { TRANSLATIONS, type Lang } from './translations';
export type { Lang } from './translations';

export function useT() {
  const language = useMindMapStore((s) => s.language);
  return TRANSLATIONS[language];
}

export function getT(lang: Lang) {
  return TRANSLATIONS[lang];
}
