/**
 * Storage Service - Manages persistent JSON template data in localStorage
 */
window.StorageService = {
  PRESETS_KEY: "premiereBinBuilder.templates.v1",

  /**
   * Save templates array to localStorage
   * @param {Array} templates 
   * @returns {boolean} Success status
   */
  save: function (templates) {
    try {
      window.localStorage.setItem(this.PRESETS_KEY, JSON.stringify(templates));
      return true;
    } catch (e) {
      console.error("Failed to save templates to localStorage:", e);
      return false;
    }
  },

  /**
   * Load templates array from localStorage
   * @returns {Array|null} Saved templates or null on empty/corrupted data
   */
  load: function () {
    try {
      var data = window.localStorage.getItem(this.PRESETS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to parse templates from localStorage (data may be corrupted):", e);
    }
    return null;
  },

  /**
   * Clears storage key
   * @returns {boolean} Success status
   */
  clear: function () {
    try {
      window.localStorage.removeItem(this.PRESETS_KEY);
      return true;
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
      return false;
    }
  }
};
