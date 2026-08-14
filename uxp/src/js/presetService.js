/**
 * Preset Service for managing presets CRUD
 */
window.PresetService = {
  customPresets: [],

  /**
   * Initialize custom presets from storage
   */
  init() {
    const stored = window.StorageService.loadPresets();
    if (stored) {
      this.customPresets = stored;
    } else {
      this.customPresets = [];
    }
  },

  /**
   * Get all presets combined (default + custom)
   * @returns {Array}
   */
  getAllPresets() {
    return [...window.DefaultPresets, ...this.customPresets];
  },

  /**
   * Get a preset by its ID
   * @param {string} id 
   * @returns {Object|null}
   */
  getPresetById(id) {
    const all = this.getAllPresets();
    return all.find(p => p.id === id) || null;
  },

  /**
   * Save (add or update) a custom preset
   * @param {Object} preset 
   */
  saveCustomPreset(preset) {
    // Ensure we don't overwrite a default preset
    const isDefault = window.DefaultPresets.some(p => p.id === preset.id);
    if (isDefault) {
      // If it has the same ID as a default, force a new ID for the custom copy
      preset.id = "custom_" + Date.now();
    }

    const index = this.customPresets.findIndex(p => p.id === preset.id);
    if (index !== -1) {
      this.customPresets[index] = preset;
    } else {
      this.customPresets.push(preset);
    }
    
    return window.StorageService.savePresets(this.customPresets);
  },

  /**
   * Delete a custom preset
   * @param {string} id 
   */
  deletePreset(id) {
    // Cannot delete default presets
    const isDefault = window.DefaultPresets.some(p => p.id === id);
    if (isDefault) return false;

    this.customPresets = this.customPresets.filter(p => p.id !== id);
    return window.StorageService.savePresets(this.customPresets);
  },

  /**
   * Duplicate any preset (default or custom)
   * @param {string} id 
   * @returns {Object|null} The duplicated preset
   */
  duplicatePreset(id) {
    const preset = this.getPresetById(id);
    if (!preset) return null;

    // Deep clone
    const clone = JSON.parse(JSON.stringify(preset));
    clone.id = "custom_" + Date.now();
    clone.name = `${clone.name} (Copy)`;
    
    this.customPresets.push(clone);
    window.StorageService.savePresets(this.customPresets);
    return clone;
  }
};
