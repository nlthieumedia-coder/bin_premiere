/**
 * Storage Service for managing persistence in the UXP panel
 */
window.StorageService = {
  PRESETS_KEY: "premiere_bin_builder_presets",

  /**
   * Save presets array to localStorage
   * @param {Array} presets 
   */
  savePresets(presets) {
    try {
      window.localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
      return true;
    } catch (e) {
      console.error("Failed to save presets to localStorage:", e);
      return false;
    }
  },

  /**
   * Load presets array from localStorage
   * @returns {Array|null}
   */
  loadPresets() {
    try {
      const data = window.localStorage.getItem(this.PRESETS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load presets from localStorage:", e);
    }
    return null;
  },

  /**
   * Clears storage
   */
  clearAll() {
    try {
      window.localStorage.removeItem(this.PRESETS_KEY);
      return true;
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
      return false;
    }
  }
};
