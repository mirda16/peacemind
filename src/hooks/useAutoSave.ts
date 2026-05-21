import { useEffect, useRef } from 'react';
import { useMindMapStore } from '../store/useMindMapStore';
import { useFileOps } from './useFileOps';

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function useAutoSave() {
  const { saveMap } = useFileOps();
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const { isDirty, currentFilePath } = useMindMapStore.getState();
      if (isDirty && currentFilePath) {
        saveMap().then((ok) => {
          if (ok) lastSaveRef.current = Date.now();
        });
      }
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [saveMap]);
}
