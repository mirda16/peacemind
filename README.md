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

### Prerequisites — Windows

1. **Install Node.js** — download the LTS installer from https://nodejs.org and run it (leave all options at default).

2. **Install Rust** — download `rustup-init.exe` from https://rustup.rs, run it, press `1` (default install) and Enter. **Restart your PC** after it finishes.

### Prerequisites — Linux (Ubuntu/Debian)

1. **Install Node.js** — https://nodejs.org (LTS)

2. **Install Rust** — https://rustup.rs

3. **Install system dependencies:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

---

### Setup & run

```bash
# 1. Clone the repository (or download and extract the ZIP from GitHub)
git clone https://github.com/mirda16/peacemind.git
cd peacemind

# 2. Install JavaScript dependencies (takes ~1 minute)
npm install

# 3. Start the app
npm run tauri dev
```

> **Note:** The first run compiles the Rust backend which takes **5–10 minutes**. Subsequent runs are much faster.

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
