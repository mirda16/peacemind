import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useMindMapStore } from './store/useMindMapStore';
import MindMapCanvas from './components/MindMapCanvas';
import Toolbar from './components/Toolbar';
import StylePanel from './components/StylePanel';
import ExportDialog from './components/ExportDialog';
import ContextMenu from './components/ContextMenu';
import { useFileOps } from './hooks/useFileOps';
import { useAutoSave } from './hooks/useAutoSave';
import SearchBar from './components/SearchBar';
import TemplateModal from './components/TemplateModal';

interface CtxMenu {
  x: number;
  y: number;
  nodeId?: string;
}

export default function App() {
  const theme = useMindMapStore((s) => s.theme);
  const newMap = useMindMapStore((s) => s.newMap);
  const isDirty = useMindMapStore((s) => s.isDirty);
  const sketchMode = useMindMapStore((s) => s.sketchMode);

  const setSearchQuery = useMindMapStore((s) => s.setSearchQuery);
  useAutoSave();
  const { saveMap, openMap } = useFileOps();

  const [showExport, setShowExport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 's') {
        e.preventDefault();
        saveMap(e.shiftKey);
      }
      if (e.key === 'o') {
        e.preventDefault();
        if (isDirty && !confirm('Mapa má neuložené změny. Přesto otevřít jinou?')) return;
        openMap();
      }
      if (e.key === 'n') {
        e.preventDefault();
        if (isDirty && !confirm('Mapa má neuložené změny. Přesto vytvořit novou?')) return;
        newMap();
      }
      if (e.key === 'e') {
        e.preventDefault();
        setShowExport(true);
      }
      if (e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveMap, openMap, newMap, isDirty]);

  const handleContextMenu = (e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  return (
    <ReactFlowProvider>
      <div className={sketchMode ? 'pm-sketch-mode' : undefined} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Toolbar onShowExport={() => setShowExport(true)} onShowTemplates={() => setShowTemplates(true)} />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          <MindMapCanvas onContextMenu={handleContextMenu} />
          {showSearch && <SearchBar onClose={closeSearch} />}
          <StylePanel />
        </div>
      </div>

      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
      {showTemplates && (
        <TemplateModal
          onClose={() => setShowTemplates(false)}
          onConfirmDirty={() => {
            if (!isDirty) return true;
            return confirm('Mapa má neuložené změny. Přesto načíst šablonu?');
          }}
        />
      )}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          nodeId={ctxMenu.nodeId}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </ReactFlowProvider>
  );
}
