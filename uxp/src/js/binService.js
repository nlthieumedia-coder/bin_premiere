/**
 * Bin Service for managing the working bin tree state in-memory
 */
window.BinService = {
  currentPreset: null,

  /**
   * Load a preset as the active editing target
   * @param {Object} preset 
   */
  loadPreset(preset) {
    if (!preset) {
      this.currentPreset = {
        id: "custom_" + Date.now(),
        name: "New Preset",
        bins: []
      };
    } else {
      // Deep clone to isolate UI edits from saved data
      this.currentPreset = JSON.parse(JSON.stringify(preset));
    }
  },

  /**
   * Get current working preset
   * @returns {Object|null}
   */
  getCurrentPreset() {
    return this.currentPreset;
  },

  /**
   * Helper to find a bin by ID recursively in a list of bins
   * @param {Array} bins 
   * @param {string} id 
   * @returns {Object|null}
   */
  _findBinByIdRecursive(bins, id) {
    for (const bin of bins) {
      if (bin.id === id) return bin;
      if (bin.children && bin.children.length > 0) {
        const found = this._findBinByIdRecursive(bin.children, id);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Find a bin in the current active preset
   * @param {string} id 
   * @returns {Object|null}
   */
  findBin(id) {
    if (!this.currentPreset || !this.currentPreset.bins) return null;
    return this._findBinByIdRecursive(this.currentPreset.bins, id);
  },

  /**
   * Add a new bin. If parentId is null, adds to root.
   * @param {string|null} parentId 
   * @param {string} name 
   * @returns {Object} The newly created bin
   */
  addBin(parentId = null, name = "New Bin") {
    if (!this.currentPreset) {
      this.loadPreset(null);
    }

    const newBin = {
      id: "bin_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      name: name,
      enabled: true,
      expanded: true,
      children: []
    };

    if (!parentId) {
      this.currentPreset.bins.push(newBin);
    } else {
      const parent = this.findBin(parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newBin);
        parent.expanded = true; // Auto expand parent
      } else {
        // Fallback to root if parent not found
        this.currentPreset.bins.push(newBin);
      }
    }

    return newBin;
  },

  /**
   * Recursive helper to delete a bin by ID from a list of bins
   */
  _deleteBinRecursive(bins, id) {
    for (let i = 0; i < bins.length; i++) {
      if (bins[i].id === id) {
        bins.splice(i, 1);
        return true;
      }
      if (bins[i].children && bins[i].children.length > 0) {
        const deleted = this._deleteBinRecursive(bins[i].children, id);
        if (deleted) return true;
      }
    }
    return false;
  },

  /**
   * Delete a bin by ID from the active preset
   * @param {string} id 
   * @returns {boolean}
   */
  deleteBin(id) {
    if (!this.currentPreset || !this.currentPreset.bins) return false;
    return this._deleteBinRecursive(this.currentPreset.bins, id);
  },

  /**
   * Update the name of a bin
   * @param {string} id 
   * @param {string} name 
   */
  updateBinName(id, name) {
    const bin = this.findBin(id);
    if (bin) {
      bin.name = name;
      return true;
    }
    return false;
  },

  /**
   * Set enabling state recursively for a bin and optionally all its children
   * @param {string} id 
   * @param {boolean} enabled 
   */
  setBinEnabled(id, enabled) {
    const bin = this.findBin(id);
    if (bin) {
      bin.enabled = enabled;
      if (enabled) {
        // If enabling, also ensure parents are enabled
        this._enableParentsRecursive(id);
      } else {
        // If disabling, disable all children
        this._setChildrenEnabledRecursive(bin.children, false);
      }
      return true;
    }
    return false;
  },

  _enableParentsRecursive(childId) {
    if (!this.currentPreset || !this.currentPreset.bins) return;
    const parent = this._findParentOfBinRecursive(this.currentPreset.bins, childId);
    if (parent) {
      parent.enabled = true;
      this._enableParentsRecursive(parent.id);
    }
  },

  _setChildrenEnabledRecursive(bins, enabled) {
    if (!bins) return;
    for (const bin of bins) {
      bin.enabled = enabled;
      this._setChildrenEnabledRecursive(bin.children, enabled);
    }
  },

  _findParentOfBinRecursive(bins, childId) {
    for (const bin of bins) {
      if (bin.children && bin.children.some(c => c.id === childId)) {
        return bin;
      }
      if (bin.children && bin.children.length > 0) {
        const found = this._findParentOfBinRecursive(bin.children, childId);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Toggle expand/collapse state
   * @param {string} id 
   * @param {boolean} expanded 
   */
  setBinExpanded(id, expanded) {
    const bin = this.findBin(id);
    if (bin) {
      bin.expanded = expanded;
      return true;
    }
    return false;
  }
};
