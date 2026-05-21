# PeaceMind

A desktop mind mapping application built with Tauri v2, React, and React Flow. Create, organize, and visualize your ideas with an intuitive node-based interface.

**Features:**
- Nodes with customizable shapes, colors, fonts, icons, and images
- Checklists inside nodes
- Multiple edge styles (bezier, straight, step, tapered/organic)
- Style panel for fine-grained appearance control
- Group and free-shape overlay objects
- Collapse/expand node subtrees
- Undo/redo (100 levels)
- Save/open maps as JSON
- Export to PNG, SVG, or PDF
- English / Czech UI

---

## Running from source

### Prerequisites

| Tool | Version | Link |
|------|---------|------|
| Node.js | 18 or newer | https://nodejs.org |
| Rust + Cargo | stable | https://rustup.rs |
| Tauri CLI dependencies | see below | |

**Linux — install system dependencies (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

**Windows** — no extra system dependencies needed beyond Node.js and Rust.

---

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/mirda16/peacemind.git
cd peacemind

# 2. Install JavaScript dependencies
npm install
```

### Run in development mode

```bash
npm run tauri dev
```

This opens the app with hot-reload. Changes to frontend files are reflected instantly.

### Build a release binary

```bash
npm run tauri build
```

The compiled installer/binary will be in `src-tauri/target/release/bundle/`.

---

## Recommended IDE

[VS Code](https://code.visualstudio.com/) with these extensions:
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
