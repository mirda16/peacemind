export type Lang = 'en' | 'cs';

export interface Translations {
  toolbar: {
    new: string; open: string; save: string; export: string;
    insertGroup: string; insertText: string; insertRect: string; insertRoundedRect: string; insertEllipse: string;
    shortcuts: string; toggleTheme: string; renameHint: string; toggleNotes: string;
    newTooltip: string; openTooltip: string; saveTooltip: string;
    zoomIn: string; zoomOut: string; fitView: string;
    confirmNew: string; confirmOpen: string;
    layout: string; layoutLR: string; layoutRL: string; layoutTB: string; layoutBT: string; layoutRadial: string;
    search: string;
  };
  search: {
    placeholder: string; noResults: string; resultOf: string;
  };
  contextMenu: {
    addChild: string; addSibling: string; editText: string;
    copyNode: string; copyWithSubtree: string; detachFromParent: string;
    deleteNode: string; noNodeHint: string;
  };
  panel: {
    mapStyle: string; edgesAll: string; applyAll: string; applyAllTooltip: string;
    thickness: string; animated: string; variableWidth: string; tapered: string;
    lineType: string; shape: string; fillColor: string; textAndBorder: string;
    text: string; border: string; typography: string; size: string;
    boldTooltip: string; italicTooltip: string; borderThickness: string;
    nodeIcon: string; nodeImage: string; changeImage: string; insertImage: string;
    checklist: string; clearChecklist: string; addChecklistItem: string;
    nodeEdges: string; customColor: string; imageFilter: string;
  };
  shapes: { rounded: string; rectangle: string; ellipse: string; circle: string; pill: string };
  help: { title: string; shortcuts: { keys: string[]; desc: string }[] };
  exportDialog: {
    title: string;
    pngTitle: string; pngDesc: string;
    svgTitle: string; svgDesc: string;
    pdfTitle: string; pdfDesc: string;
    exportDone: string; exportFailed: string;
  };
  node: { addChild: string; expand: string; collapse: string; newItem: string; addItem: string; remove: string; toggleNote: string; notePlaceholder: string; noteLabel: string; urlLabel: string; urlPlaceholder: string; openUrl: string };
  defaults: { rootLabel: string; newNode: string; mapTitle: string; freeText: string; group: string };
  presets: Record<string, { name: string; description: string }>;
}

const en: Translations = {
  toolbar: {
    new: 'New', open: 'Open', save: 'Save', export: 'Export',
    insertGroup: 'Group', insertText: 'Text', insertRect: 'Insert rectangle',
    insertRoundedRect: 'Insert rounded rectangle', insertEllipse: 'Insert ellipse',
    shortcuts: 'Keyboard shortcuts', toggleTheme: 'Toggle theme',
    renameHint: 'Click to rename', toggleNotes: 'Show / hide all notes',
    newTooltip: 'New map (Ctrl+N)', openTooltip: 'Open (Ctrl+O)', saveTooltip: 'Save (Ctrl+S)',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', fitView: 'Fit view (Ctrl+0)',
    confirmNew: 'Map has unsaved changes. Create new anyway?',
    confirmOpen: 'Map has unsaved changes. Open another?',
    layout: 'Auto layout', layoutLR: 'Left → Right', layoutRL: 'Right → Left',
    layoutTB: 'Top → Bottom', layoutBT: 'Bottom → Top', layoutRadial: 'Radial',
    search: 'Search (Ctrl+F)',
  },
  search: {
    placeholder: 'Search nodes…', noResults: 'No results', resultOf: 'of',
  },
  contextMenu: {
    addChild: 'Add child', addSibling: 'Add sibling', editText: 'Edit text',
    copyNode: 'Copy node', copyWithSubtree: 'Copy with subtree',
    detachFromParent: 'Detach from parent', deleteNode: 'Delete node',
    noNodeHint: 'Click a node for actions',
  },
  panel: {
    mapStyle: 'Map style', edgesAll: 'Edges (all)', applyAll: 'Apply all',
    applyAllTooltip: 'Apply to all existing edges',
    thickness: 'Thickness', animated: 'Animated', variableWidth: 'Variable width',
    tapered: 'Tapered (like XMind)', lineType: 'Line type', shape: 'Shape',
    fillColor: 'Fill color', textAndBorder: 'Text & border color',
    text: 'Text', border: 'Border', typography: 'Typography', size: 'Size',
    boldTooltip: 'Bold', italicTooltip: 'Italic', borderThickness: 'Border thickness',
    nodeIcon: 'Node icon', nodeImage: 'Node image', changeImage: 'Change',
    insertImage: 'Insert image', checklist: 'Checklist', clearChecklist: 'Clear',
    addChecklistItem: 'Add item', nodeEdges: 'Edges from node',
    customColor: 'Custom color', imageFilter: 'Image',
  },
  shapes: {
    rounded: '⬜ Rounded', rectangle: '🔲 Rect', ellipse: '⭕ Ellipse',
    circle: '● Circle', pill: '💊 Pill',
  },
  help: {
    title: 'Keyboard shortcuts',
    shortcuts: [
      { keys: ['Tab'], desc: 'Add child to selected node' },
      { keys: ['Enter'], desc: 'Add sibling next to node' },
      { keys: ['F2'], desc: 'Edit node text' },
      { keys: ['Delete'], desc: 'Delete node (and children)' },
      { keys: ['Esc'], desc: 'Cancel selection / editing' },
      { keys: ['Ctrl', 'Z'], desc: 'Undo' },
      { keys: ['Ctrl', 'Y'], desc: 'Redo' },
      { keys: ['Ctrl', 'S'], desc: 'Save map' },
      { keys: ['Ctrl', 'Shift', 'S'], desc: 'Save as…' },
      { keys: ['Ctrl', 'O'], desc: 'Open map' },
      { keys: ['Ctrl', 'N'], desc: 'New map' },
      { keys: ['Ctrl', 'E'], desc: 'Export' },
      { keys: ['Ctrl', '0'], desc: 'Fit all' },
      { keys: ['Scroll'], desc: 'Zoom in / out' },
      { keys: ['Click + drag'], desc: 'Pan canvas (middle button)' },
      { keys: ['2× click'], desc: 'Edit node text' },
      { keys: ['Right click'], desc: 'Context menu' },
    ],
  },
  exportDialog: {
    title: 'Export map',
    pngTitle: 'PNG image', pngDesc: 'Raster image, good for sharing',
    svgTitle: 'SVG vectors', svgDesc: 'Vector format, infinitely scalable',
    pdfTitle: 'PDF document', pdfDesc: 'Good for printing and sharing',
    exportDone: '✓ {{fmt}} export complete',
    exportFailed: '✗ {{fmt}} export failed or cancelled',
  },
  node: {
    addChild: 'Add child (Tab)', expand: 'Expand', collapse: 'Collapse',
    newItem: 'New item', addItem: '+ Add item', remove: 'Remove',
    toggleNote: 'Show / hide note', notePlaceholder: 'Add a note…',
    noteLabel: 'Note', urlLabel: 'URL link', urlPlaceholder: 'https://…', openUrl: 'Open URL',
  },
  defaults: { rootLabel: 'Main topic', newNode: 'New node', mapTitle: 'New map', freeText: 'Text', group: 'Group' },
  presets: {
    klasicky:      { name: 'Classic',       description: 'Rounded nodes, smooth lines' },
    organicky:     { name: 'Organic',       description: 'Thicker branches at root, thinner at leaves' },
    profesionalni: { name: 'Professional',  description: 'Angular nodes, right-angle lines' },
    bublinovy:     { name: 'Bubble',        description: 'Ellipses, rainbow colors per branch' },
    nakresleno:    { name: 'Sketch',        description: 'Hand-drawn style like Excalidraw' },
    minimalista:   { name: 'Minimalist',    description: 'Clean lines, no borders, pastel' },
  },
};

const cs: Translations = {
  toolbar: {
    new: 'Nová', open: 'Otevřít', save: 'Uložit', export: 'Export',
    insertGroup: 'Skupina', insertText: 'Text', insertRect: 'Vložit obdélník',
    insertRoundedRect: 'Vložit zaoblený obdélník', insertEllipse: 'Vložit elipsu',
    shortcuts: 'Klávesové zkratky', toggleTheme: 'Přepnout téma',
    renameHint: 'Klikni pro přejmenování', toggleNotes: 'Zobrazit / skrýt všechny poznámky',
    newTooltip: 'Nová mapa (Ctrl+N)', openTooltip: 'Otevřít (Ctrl+O)', saveTooltip: 'Uložit (Ctrl+S)',
    zoomIn: 'Přiblížit', zoomOut: 'Oddálit', fitView: 'Zobrazit vše (Ctrl+0)',
    confirmNew: 'Mapa má neuložené změny. Přesto vytvořit novou?',
    confirmOpen: 'Mapa má neuložené změny. Přesto otevřít jinou?',
    layout: 'Auto rozložení', layoutLR: 'Zleva doprava', layoutRL: 'Zprava doleva',
    layoutTB: 'Shora dolů', layoutBT: 'Zdola nahoru', layoutRadial: 'Radiálně',
    search: 'Hledat (Ctrl+F)',
  },
  search: {
    placeholder: 'Hledat uzly…', noResults: 'Žádné výsledky', resultOf: 'z',
  },
  contextMenu: {
    addChild: 'Přidat potomka', addSibling: 'Přidat sourozence', editText: 'Upravit text',
    copyNode: 'Kopírovat uzel', copyWithSubtree: 'Kopírovat se stromem',
    detachFromParent: 'Odpojit od rodiče', deleteNode: 'Smazat uzel',
    noNodeHint: 'Klikněte na uzel pro akce',
  },
  panel: {
    mapStyle: 'Styl mapy', edgesAll: 'Hrany (všechny)', applyAll: 'Aplikovat vše',
    applyAllTooltip: 'Aplikovat na všechny existující hrany',
    thickness: 'Tloušťka', animated: 'Animovaná', variableWidth: 'Proměnná šíře',
    tapered: 'Tapered (zužující se jako XMind)', lineType: 'Typ čáry', shape: 'Tvar',
    fillColor: 'Barva pozadí', textAndBorder: 'Barva textu a ohraničení',
    text: 'Text', border: 'Rámeček', typography: 'Typografie', size: 'Velikost',
    boldTooltip: 'Tučné', italicTooltip: 'Kurzíva', borderThickness: 'Tloušťka rámečku',
    nodeIcon: 'Ikona uzlu', nodeImage: 'Obrázek v uzlu', changeImage: 'Změnit',
    insertImage: 'Vložit obrázek', checklist: 'Zaškrtávací seznam', clearChecklist: 'Vymazat',
    addChecklistItem: 'Přidat položku', nodeEdges: 'Hrany od uzlu',
    customColor: 'Vlastní barva', imageFilter: 'Obrázek',
  },
  shapes: {
    rounded: '⬜ Oblé', rectangle: '🔲 Rect', ellipse: '⭕ Elipsa',
    circle: '● Kruh', pill: '💊 Pilulka',
  },
  help: {
    title: 'Klávesové zkratky',
    shortcuts: [
      { keys: ['Tab'], desc: 'Přidat potomka vybraného uzlu' },
      { keys: ['Enter'], desc: 'Přidat sourozence vedle uzlu' },
      { keys: ['F2'], desc: 'Upravit text uzlu' },
      { keys: ['Delete'], desc: 'Smazat uzel (a potomky)' },
      { keys: ['Esc'], desc: 'Zrušit výběr / editaci' },
      { keys: ['Ctrl', 'Z'], desc: 'Zpět (Undo)' },
      { keys: ['Ctrl', 'Y'], desc: 'Vpřed (Redo)' },
      { keys: ['Ctrl', 'S'], desc: 'Uložit mapu' },
      { keys: ['Ctrl', 'Shift', 'S'], desc: 'Uložit jako…' },
      { keys: ['Ctrl', 'O'], desc: 'Otevřít mapu' },
      { keys: ['Ctrl', 'N'], desc: 'Nová mapa' },
      { keys: ['Ctrl', 'E'], desc: 'Exportovat' },
      { keys: ['Ctrl', '0'], desc: 'Zobrazit celou mapu' },
      { keys: ['Scroll'], desc: 'Přiblížení / oddálení' },
      { keys: ['Klik + tah'], desc: 'Posun po plátně (střední tlačítko)' },
      { keys: ['2× klik'], desc: 'Upravit text uzlu' },
      { keys: ['Prav. klik'], desc: 'Kontextové menu' },
    ],
  },
  exportDialog: {
    title: 'Exportovat mapu',
    pngTitle: 'PNG obrázek', pngDesc: 'Rastrový obrázek, vhodný pro sdílení',
    svgTitle: 'SVG vektory', svgDesc: 'Vektorový formát, lze libovolně škálovat',
    pdfTitle: 'PDF dokument', pdfDesc: 'Vhodný pro tisk a sdílení dokumentů',
    exportDone: '✓ Export {{fmt}} dokončen',
    exportFailed: '✗ Export {{fmt}} selhal nebo zrušen',
  },
  node: {
    addChild: 'Přidat potomka (Tab)', expand: 'Rozbalit', collapse: 'Sbalit',
    newItem: 'Nová položka', addItem: '+ Přidat položku', remove: 'Odebrat',
    toggleNote: 'Zobrazit / skrýt poznámku', notePlaceholder: 'Přidat poznámku…',
    noteLabel: 'Poznámka', urlLabel: 'URL odkaz', urlPlaceholder: 'https://…', openUrl: 'Otevřít URL',
  },
  defaults: { rootLabel: 'Hlavní téma', newNode: 'Nový uzel', mapTitle: 'Nová mapa', freeText: 'Text', group: 'Skupina' },
  presets: {
    klasicky:      { name: 'Klasický',       description: 'Zaoblené uzly, plynulé čáry' },
    organicky:     { name: 'Organický',      description: 'Větve silnější u kořene, tenčí u listů' },
    profesionalni: { name: 'Profesionální',  description: 'Hranaté uzly, pravoúhlé čáry' },
    bublinovy:     { name: 'Bublinový',      description: 'Elipsy, duhové barvy dle větve' },
    nakresleno:    { name: 'Nakresleno',     description: 'Ručně kreslený styl jako Excalidraw' },
    minimalista:   { name: 'Minimalistický', description: 'Čisté linie, bez rámečků, pastelové' },
  },
};

export const TRANSLATIONS: Record<Lang, Translations> = { en, cs };
