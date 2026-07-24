import { Plus, X } from 'lucide-react';
import { useMindMapStore } from '../store/useMindMapStore';
import { useT } from '../i18n';

export default function TabBar() {
  const t = useT();
  const tabOrder = useMindMapStore((s) => s.tabOrder);
  const activeTabId = useMindMapStore((s) => s.activeTabId);
  const tabs = useMindMapStore((s) => s.tabs);
  const mapTitle = useMindMapStore((s) => s.mapTitle);
  const isDirty = useMindMapStore((s) => s.isDirty);
  const switchTab = useMindMapStore((s) => s.switchTab);
  const closeTab = useMindMapStore((s) => s.closeTab);
  const openNewTab = useMindMapStore((s) => s.openNewTab);

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const dirty = id === activeTabId ? isDirty : (tabs[id]?.isDirty ?? false);
    if (dirty && !confirm(t.tabs.confirmClose)) return;
    closeTab(id);
  };

  return (
    <div className="pm-tabbar">
      {tabOrder.map((id) => {
        const active = id === activeTabId;
        const title = active ? mapTitle : (tabs[id]?.mapTitle ?? '');
        const dirty = active ? isDirty : (tabs[id]?.isDirty ?? false);
        return (
          <div
            key={id}
            className={`pm-tab${active ? ' active' : ''}`}
            onClick={() => switchTab(id)}
            title={title}
          >
            <span className="pm-tab-title">{title}</span>
            {dirty && <span className="pm-tab-dirty-dot" />}
            <button className="pm-tab-close" onClick={(e) => handleClose(e, id)} title={t.tabs.closeTab}>
              <X size={12} />
            </button>
          </div>
        );
      })}
      <button className="pm-tab-add" onClick={() => openNewTab()} title={t.tabs.newTab}>
        <Plus size={14} />
      </button>
    </div>
  );
}
