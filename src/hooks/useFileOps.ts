import { open, save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { PeaceMindFile } from '../types/mindmap';
import { useMindMapStore } from '../store/useMindMapStore';
import { pushRecentFile } from './useRecentFiles';

export function useFileOps() {
  const store = useMindMapStore();

  const saveMap = async (forceSaveAs = false): Promise<boolean> => {
    const { nodes, edges, mapTitle, theme, currentFilePath, currentStyleId } = useMindMapStore.getState();
    let filePath = currentFilePath;

    if (!filePath || forceSaveAs) {
      filePath = await save({
        defaultPath: `${mapTitle}.peacemind`,
        filters: [{ name: 'PeaceMind mapa', extensions: ['peacemind'] }],
      });
      if (!filePath) return false;
    }

    const data: PeaceMindFile = {
      version: '1.0',
      title: mapTitle,
      nodes,
      edges,
      viewport: useMindMapStore.getState().viewport,
      theme,
      styleId: currentStyleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await invoke<void>('write_file', { path: filePath, content: JSON.stringify(data, null, 2) });
      store.setCurrentFilePath(filePath);
      store.setIsDirty(false);
      pushRecentFile({ path: filePath, title: mapTitle, savedAt: new Date().toISOString() });
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  };

  const openMap = async (): Promise<boolean> => {
    const filePath = await open({
      filters: [{ name: 'PeaceMind mapa', extensions: ['peacemind'] }],
      multiple: false,
    });
    if (!filePath || Array.isArray(filePath)) return false;

    try {
      const raw = await invoke<string>('read_file', { path: filePath });
      const data: PeaceMindFile = JSON.parse(raw);
      store.loadMap(data.nodes, data.edges, data.title, data.theme);
      if (data.styleId) store.applyStylePreset(data.styleId);
      store.setCurrentFilePath(filePath);
      pushRecentFile({ path: filePath, title: data.title, savedAt: data.updatedAt });
      return true;
    } catch (e) {
      console.error('Open failed:', e);
      return false;
    }
  };

  return { saveMap, openMap };
}
