/**
 * UI Service - Handles DOM manipulation and UI logic
 */
window.UIService = {
  // DOM Elements
  presetDropdown: null,
  presetNameInput: null,
  binTreeContainer: null,
  statusContainer: null,
  savePresetBtn: null,
  deletePresetBtn: null,
  duplicatePresetBtn: null,
  createBinsBtn: null,
  captureCurrentBtn: null,
  addTopBinBtn: null,

  /**
   * Initialize UI elements and bind event handlers
   */
  init() {
    this.presetDropdown = document.getElementById("preset-dropdown");
    this.presetNameInput = document.getElementById("preset-name-input");
    this.binTreeContainer = document.getElementById("bin-tree-container");
    this.statusContainer = document.getElementById("status-container");
    
    this.savePresetBtn = document.getElementById("save-preset-btn");
    this.deletePresetBtn = document.getElementById("delete-preset-btn");
    this.duplicatePresetBtn = document.getElementById("duplicate-preset-btn");
    this.createBinsBtn = document.getElementById("create-bins-btn");
    this.captureCurrentBtn = document.getElementById("capture-current-btn");
    this.addTopBinBtn = document.getElementById("add-top-bin-btn");

    this.bindEvents();
    
    // Initial Render
    this.refreshPresetsDropdown();
    this.loadSelectedPreset();
  },

  /**
   * Bind event handlers using delegation where appropriate
   */
  bindEvents() {
    // Preset change handler
    this.presetDropdown.addEventListener("change", () => {
      this.loadSelectedPreset();
    });

    // Rename preset field change
    this.presetNameInput.addEventListener("input", (e) => {
      const preset = window.BinService.getCurrentPreset();
      if (preset) {
        preset.name = e.target.value;
      }
    });

    // Add Top-Level Bin
    this.addTopBinBtn.addEventListener("click", () => {
      window.BinService.addBin(null, "NEW_BIN");
      this.renderBinTree();
      this.showStatus("Added new top-level bin.", "info");
    });

    // Save Preset
    this.savePresetBtn.addEventListener("click", () => {
      const current = window.BinService.getCurrentPreset();
      if (!current) return;

      const newName = this.presetNameInput.value.trim();
      if (!newName) {
        this.showStatus("Preset name cannot be empty.", "error");
        return;
      }

      current.name = newName;
      
      const success = window.PresetService.saveCustomPreset(current);
      if (success) {
        // Find saved preset (if it was a default, it got a new custom ID)
        const all = window.PresetService.getAllPresets();
        const savedPreset = all.find(p => p.name === newName) || current;
        
        this.refreshPresetsDropdown(savedPreset.id);
        window.BinService.loadPreset(savedPreset);
        this.renderBinTree();
        this.showStatus(`Preset "${newName}" saved successfully!`, "success");
      } else {
        this.showStatus("Failed to save preset.", "error");
      }
    });

    // Duplicate Preset
    this.duplicatePresetBtn.addEventListener("click", () => {
      const preset = window.BinService.getCurrentPreset();
      if (!preset) return;

      const clone = window.PresetService.duplicatePreset(preset.id);
      if (clone) {
        this.refreshPresetsDropdown(clone.id);
        window.BinService.loadPreset(clone);
        this.renderBinTree();
        this.showStatus(`Duplicated to "${clone.name}".`, "success");
      } else {
        this.showStatus("Failed to duplicate preset.", "error");
      }
    });

    // Delete Preset
    this.deletePresetBtn.addEventListener("click", () => {
      const preset = window.BinService.getCurrentPreset();
      if (!preset) return;

      // Check if it's default
      const isDefault = window.DefaultPresets.some(p => p.id === preset.id);
      if (isDefault) {
        this.showStatus("Cannot delete default presets.", "error");
        return;
      }

      const success = window.PresetService.deletePreset(preset.id);
      if (success) {
        this.showStatus(`Preset "${preset.name}" deleted.`, "success");
        this.refreshPresetsDropdown();
        this.loadSelectedPreset();
      } else {
        this.showStatus("Failed to delete preset.", "error");
      }
    });

    // Create Bins in Premiere
    this.createBinsBtn.addEventListener("click", async () => {
      const current = window.BinService.getCurrentPreset();
      if (!current || !current.bins || current.bins.length === 0) {
        this.showStatus("No bins to create. Add some bins first.", "warning");
        return;
      }

      this.showStatus("Creating bins in Premiere...", "info");
      
      try {
        if (!window.PremiereService.isAvailable()) {
          this.showStatus("Premiere API not available. Make sure you are running in Premiere Pro.", "error");
          return;
        }

        const project = await window.PremiereService.getActiveProject();
        if (!project) {
          this.showStatus("No active project open in Premiere Pro.", "error");
          return;
        }

        const stats = await window.PremiereService.createBins(current.bins);
        
        let message = `Created: ${stats.created} bins | Skipped: ${stats.skipped} existing bins`;
        let type = "success";
        if (stats.errors > 0) {
          message += ` | Errors: ${stats.errors}`;
          type = "warning";
        }
        
        this.showStatus(message, type);
      } catch (err) {
        this.showStatus(`Error: ${err.message}`, "error");
      }
    });

    // Capture Current Bin Structure
    this.captureCurrentBtn.addEventListener("click", async () => {
      this.showStatus("Capturing current project bins...", "info");
      
      try {
        if (!window.PremiereService.isAvailable()) {
          this.showStatus("Premiere API not available. Cannot capture.", "error");
          return;
        }

        const bins = await window.PremiereService.captureCurrentStructure();
        if (!bins) {
          this.showStatus("Could not access project bins. Ensure a project is open.", "error");
          return;
        }

        if (bins.length === 0) {
          this.showStatus("No bins found in the active project.", "warning");
          return;
        }

        // Create a custom captured preset
        const capturedPreset = {
          id: "captured_" + Date.now(),
          name: "Captured Workflow",
          bins: bins
        };

        window.BinService.loadPreset(capturedPreset);
        this.presetNameInput.value = capturedPreset.name;
        this.renderBinTree();
        this.showStatus("Captured project structure! Name and click Save Preset to keep it.", "success");
      } catch (err) {
        this.showStatus(`Capture failed: ${err.message}`, "error");
      }
    });

    // Delegate tree node actions
    this.binTreeContainer.addEventListener("click", (e) => {
      const row = e.target.closest(".tree-row");
      if (!row) return;
      
      const binId = row.dataset.id;

      // Collapse / Expand toggle
      if (e.target.classList.contains("tree-toggle")) {
        const bin = window.BinService.findBin(binId);
        if (bin && bin.children && bin.children.length > 0) {
          window.BinService.setBinExpanded(binId, !bin.expanded);
          this.renderBinTree();
        }
      }

      // Add child bin
      if (e.target.closest(".add-child-btn")) {
        window.BinService.addBin(binId, "SUB_BIN");
        this.renderBinTree();
        this.showStatus("Added sub-bin.", "info");
      }

      // Delete bin
      if (e.target.closest(".delete-bin-btn")) {
        window.BinService.deleteBin(binId);
        this.renderBinTree();
        this.showStatus("Deleted bin.", "info");
      }
    });

    // Delegate checkbox changes
    this.binTreeContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("tree-checkbox")) {
        const row = e.target.closest(".tree-row");
        if (row) {
          const binId = row.dataset.id;
          const checked = e.target.checked;
          window.BinService.setBinEnabled(binId, checked);
          this.renderBinTree();
        }
      }
    });

    // Delegate text renaming input
    this.binTreeContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("tree-name-input")) {
        const row = e.target.closest(".tree-row");
        if (row) {
          const binId = row.dataset.id;
          const newName = e.target.value.trim().toUpperCase(); // Auto uppercase like typical editor structures
          if (newName) {
            window.BinService.updateBinName(binId, newName);
            // Re-render to show correctly styled name
            this.renderBinTree();
          } else {
            // Revert back
            this.renderBinTree();
          }
        }
      }
    });
  },

  /**
   * Refreshes the list of presets in the dropdown
   * @param {string|null} selectId 
   */
  refreshPresetsDropdown(selectId = null) {
    const presets = window.PresetService.getAllPresets();
    
    // Save current selection if not specified
    const activeId = selectId || this.presetDropdown.value || (presets[0] && presets[0].id);

    this.presetDropdown.innerHTML = "";
    
    // Create menu items inside sp-menu
    const spMenu = document.createElement("sp-menu");
    
    presets.forEach(preset => {
      const isDefault = window.DefaultPresets.some(p => p.id === preset.id);
      const suffix = isDefault ? "" : " (User)";
      const item = document.createElement("sp-menu-item");
      item.value = preset.id;
      item.textContent = preset.name + suffix;
      
      if (preset.id === activeId) {
        item.setAttribute("selected", "true");
      }
      
      spMenu.appendChild(item);
    });

    this.presetDropdown.appendChild(spMenu);
    
    // Update value attribute on picker
    if (activeId) {
      this.presetDropdown.setAttribute("value", activeId);
    }
  },

  /**
   * Loads the preset currently selected in the dropdown
   */
  loadSelectedPreset() {
    const presetId = this.presetDropdown.value;
    const preset = window.PresetService.getPresetById(presetId);
    
    if (preset) {
      window.BinService.loadPreset(preset);
      this.presetNameInput.value = preset.name;
      
      // Update delete button state: only allow deleting custom user presets
      const isDefault = window.DefaultPresets.some(p => p.id === preset.id);
      if (isDefault) {
        this.deletePresetBtn.setAttribute("disabled", "true");
      } else {
        this.deletePresetBtn.removeAttribute("disabled");
      }

      this.renderBinTree();
    }
  },

  /**
   * Render the bin tree to the UI
   */
  renderBinTree() {
    const preset = window.BinService.getCurrentPreset();
    if (!preset || !preset.bins) {
      this.binTreeContainer.innerHTML = `<div class="tree-empty">No bins defined. Click [+ ADD BIN] below to start.</div>`;
      return;
    }

    if (preset.bins.length === 0) {
      this.binTreeContainer.innerHTML = `<div class="tree-empty">No bins defined. Click [+ ADD BIN] below to start.</div>`;
      return;
    }

    this.binTreeContainer.innerHTML = this.buildTreeHTML(preset.bins, 0);
  },

  /**
   * Recursive HTML generator for tree rendering
   */
  buildTreeHTML(bins, depth) {
    let html = "";
    
    bins.forEach(bin => {
      const hasChildren = bin.children && bin.children.length > 0;
      const isExpanded = bin.expanded !== false;
      const arrowChar = isExpanded ? "▼" : "▶";
      const indent = depth * 16;
      
      html += `
        <div class="tree-node" style="--depth: ${depth}">
          <div class="tree-row ${bin.enabled ? '' : 'is-disabled'}" data-id="${bin.id}">
            <div class="tree-indent" style="width: ${indent}px"></div>
            
            <div class="tree-toggle ${hasChildren ? '' : 'is-empty'}">
              ${hasChildren ? arrowChar : ""}
            </div>
            
            <sp-checkbox class="tree-checkbox" ${bin.enabled ? 'checked' : ''}></sp-checkbox>
            
            <input type="text" class="tree-name-input" value="${bin.name}" placeholder="BIN_NAME" />
            
            <div class="tree-actions">
              <button class="action-btn add-child-btn" title="Add Child Bin">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path fill="currentColor" d="M9 4H6V1a1 1 0 0 0-2 0v3H1a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0V6h3a1 1 0 0 0 0-2z"/>
                </svg>
              </button>
              <button class="action-btn delete-bin-btn" title="Delete Bin">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path fill="currentColor" d="M1.5 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1h-7v-1zm1 2h5v4.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-4.5z"/>
                </svg>
              </button>
            </div>
          </div>
          ${hasChildren && isExpanded ? `<div class="tree-children">${this.buildTreeHTML(bin.children, depth + 1)}</div>` : ""}
        </div>
      `;
    });

    return html;
  },

  /**
   * Display status feedback in status area
   * @param {string} message 
   * @param {string} type 'success' | 'error' | 'warning' | 'info'
   */
  showStatus(message, type = "info") {
    this.statusContainer.className = `status-box status-${type}`;
    
    let prefix = "ℹ ";
    if (type === "success") prefix = "✓ ";
    if (type === "error") prefix = "✕ ";
    if (type === "warning") prefix = "⚠ ";

    this.statusContainer.textContent = prefix + message;
    
    // Auto clear info/success status after 5 seconds, keep warnings/errors persistent
    if (type === "success" || type === "info") {
      if (this.statusTimeout) clearTimeout(this.statusTimeout);
      this.statusTimeout = setTimeout(() => {
        this.statusContainer.className = "status-box status-idle";
        this.statusContainer.textContent = "Ready";
      }, 5000);
    }
  }
};
