# PremiereBinBuilder

**PremiereBinBuilder** is a premium Adobe Premiere Pro UXP panel extension designed to help editors build organized bin (folder) structures quickly and consistently. Instead of manually creating folder structures for every new project, editors can choose standard presets (e.g., YouTube Documentary, Shorts, Podcast, Commercial), customize the folders inline, and automatically construct them in their Premiere Pro project with a single click.

---

## Features

- **Built with UXP (Unified Extensibility Platform):** Modern Premiere Pro architecture matching Adobe's latest guidelines (targeting Premiere Pro 25.6+).
- **Default Workflows:** Shipped with standard industry folder templates:
  - *YouTube Documentary*
  - *YouTube Shorts*
  - *Podcast*
  - *Commercial Project*
- **Custom Preset Builder:**
  - Add nested folders (sub-bins) and root-level folders.
  - Interactive expand/collapse nodes.
  - Smart checkmark propagation: checking a nested sub-folder auto-enables its parent folders; unchecking a parent auto-disables all children.
  - Rename folders directly inline (automatically sanitized to uppercase format).
- **Preset CRUD:** Save, Duplicate, and Delete custom configurations persistently via standard `localStorage`.
- **Duplicate Prevention:** Avoids duplicate bin creation if folders with the same name already exist in the target hierarchy.
- **Undo Safe:** Grouped inside a unified transaction, enabling editors to hit `Ctrl + Z` to undo the entire creation in one step.
- **Capture Current Structure:** Scans the active project's bins recursively and loads them into the panel as a template layout that can be named and saved as a user preset.

---

## Requirements

- **Adobe Premiere Pro 25.6.0+**
- **Adobe UXP Developer Tool (UDT)** (for development and packaging)

---

## Development Setup

To load and run the plugin during development:

1. **Enable Developer Mode in Premiere Pro:**
   - In Premiere Pro, go to **Preferences > Plugins**.
   - Check the box to **Enable developer mode**.
   - Restart Premiere Pro.

2. **Configure UXP Developer Tool (UDT):**
   - Launch the **UXP Developer Tool**.
   - Click the **Add Plugin** button.
   - Navigate to this folder and select the [manifest.json](file:///d:/Nguồn/bin/manifest.json) file.
   - The plugin will now appear in your UDT dashboard.

3. **Load the Plugin:**
   - With Premiere Pro open, click **Load** next to the plugin in UDT.
   - In Premiere Pro, open the panel via: **Window > UXP Plugins > PremiereBinBuilder**.
   - To monitor logs and debug, click **Watch** or **Debug** in the UDT dashboard.

---

## Project Architecture

```text
premiere-bin-builder/
├── manifest.json            # Extension configuration and host definitions
├── README.md                # Documentation and setup guides
└── src/
    ├── index.html           # Main HTML layout using native Adobe Spectrum UXP widgets
    ├── css/
    │   └── styles.css       # Custom stylesheets for the tree view & dark theme matching Premiere
    ├── data/
    │   └── defaultPresets.js # Predefined folder templates
    └── js/
        ├── app.js           # Plugin bootstrapper & UXP lifecycle handler
        ├── premiere.js      # Wrapper for Premiere Pro UXP DOM, transactions, and project items
        ├── storageService.js# Thin wrapper around localStorage for persistence
        ├── presetService.js # Business logic for preset CRUD and duplication
        ├── binService.js    # Tree data manipulation & checkmark propagation logic
        └── ui.js            # UI renderer & event delegation controller
```

---

## Packaging for Distribution (`.ccx`)

To compile the extension into a single `.ccx` file so other editors can double-click and install it:

1. Open the **UXP Developer Tool**.
2. Find **PremiereBinBuilder** in your dashboard.
3. Click the menu icon (three dots) next to the plugin and select **Package...** or **Build...** (depending on your UDT version).
4. Select the output directory.
5. UDT will compile the project and generate a `.ccx` file (e.g., `com.antigravity.premierebinbuilder-1.0.0.ccx`).
6. Editors can double-click this file to install it directly using the **Creative Cloud Desktop App**.
