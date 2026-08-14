/**
 * Template UI - Manages rendering and interactions of the Template List and Editor Tree
 */
window.TemplateUI = {
  activeTemplate: null,
  isDirty: false,
  
  // Cache DOM containers
  listContainer: null,
  treeContainer: null,
  activeTitleEl: null,
  saveBtn: null,
  addRootBtn: null,
  
  init: function () {
    this.listContainer = document.getElementById("template-list-container");
    this.treeContainer = document.getElementById("bin-tree-container");
    this.activeTitleEl = document.getElementById("active-template-title");
    this.saveBtn = document.getElementById("save-changes-btn");
    this.addRootBtn = document.getElementById("add-root-bin-btn");
    
    this.bindTreeEvents();
  },

  /**
   * Loads a template into the active editor
   * @param {string} id 
   */
  loadTemplate: function (id) {
    var tpl = window.TemplateService.getById(id);
    if (tpl) {
      this.activeTemplate = tpl;
      this.isDirty = false;
      this.checkDirty();
      this.renderBinTree();
      this.renderTemplateList();
    }
  },

  /**
   * Saves the current active edits
   */
  saveChanges: function () {
    if (!this.activeTemplate) return false;
    
    // Validate empty template name
    var nameInput = document.getElementById("active-template-name-input");
    var newName = nameInput ? nameInput.value.trim() : this.activeTemplate.name;
    if (!newName) {
      return { success: false, error: "Template name cannot be empty" };
    }
    
    this.activeTemplate.name = newName;
    
    var success = window.TemplateService.save(this.activeTemplate);
    if (success) {
      this.isDirty = false;
      this.checkDirty();
      this.renderTemplateList();
      return { success: true };
    }
    return { success: false, error: "Failed to save to storage" };
  },

  /**
   * Refreshes the scrollable vertical template list
   */
  renderTemplateList: function () {
    if (!this.listContainer) return;
    
    var templates = window.TemplateService.getAll();
    this.listContainer.innerHTML = "";
    
    if (templates.length === 0) {
      this.listContainer.innerHTML = "<div class=\"list-empty\">No templates</div>";
      return;
    }
    
    var self = this;
    templates.forEach(function (tpl) {
      var item = document.createElement("div");
      
      // Determine active highlight classes
      var isActive = self.activeTemplate && self.activeTemplate.id === tpl.id;
      item.className = "template-list-item" + (isActive ? " active" : "");
      item.dataset.id = tpl.id;
      
      // Indicator dots
      var indicator = document.createElement("span");
      indicator.className = "indicator-dot" + (isActive ? " active" : "");
      indicator.textContent = isActive ? "●" : "○";
      item.appendChild(indicator);
      
      // Text label
      var label = document.createElement("span");
      label.className = "template-label";
      label.textContent = tpl.name;
      item.appendChild(label);
      
      self.listContainer.appendChild(item);
    });
  },

  /**
   * Renders the interactive bin tree structure of the active template
   */
  renderBinTree: function () {
    if (!this.treeContainer || !this.activeTemplate) {
      this.treeContainer.innerHTML = "<div class=\"tree-empty\">No active template selected</div>";
      return;
    }

    // Load active name into the edit field
    var nameInput = document.getElementById("active-template-name-input");
    if (nameInput) {
      nameInput.value = this.activeTemplate.name;
    }

    var bins = this.activeTemplate.bins;
    if (!bins || bins.length === 0) {
      this.treeContainer.innerHTML = "<div class=\"tree-empty\">No bins defined. Click [+ Add Root Bin] to start.</div>";
      return;
    }

    this.treeContainer.innerHTML = this.buildTreeHTML(bins, 0);
  },

  /**
   * Recursive tree builder HTML
   */
  buildTreeHTML: function (bins, depth) {
    var html = "";
    var self = this;
    
    bins.forEach(function (bin) {
      var hasChildren = bin.children && bin.children.length > 0;
      var isExpanded = bin.expanded !== false;
      var arrowChar = isExpanded ? "▼" : "▶";
      var indent = depth * 16;
      
      html += "<div class=\"tree-node\" style=\"--depth: " + depth + "\">" +
        "<div class=\"tree-row " + (bin.enabled ? "" : "is-disabled") + "\" data-id=\"" + bin.id + "\">" +
          "<div class=\"tree-indent\" style=\"width: " + indent + "px\"></div>" +
          "<div class=\"tree-toggle " + (hasChildren ? "" : "is-empty") + "\">" + (hasChildren ? arrowChar : "") + "</div>" +
          "<input type=\"checkbox\" class=\"tree-checkbox\" " + (bin.enabled ? "checked" : "") + " />" +
          "<input type=\"text\" class=\"tree-name-input\" value=\"" + bin.name + "\" placeholder=\"BIN_NAME\" />" +
          "<div class=\"tree-actions\">" +
            "<button class=\"action-btn add-child-btn\" title=\"Add Child Bin\">" +
              "<svg width=\"10\" height=\"10\" viewBox=\"0 0 10 10\"><path fill=\"currentColor\" d=\"M9 4H6V1a1 1 0 0 0-2 0v3H1a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0V6h3a1 1 0 0 0 0-2z\"/></svg>" +
            "</button>" +
            "<button class=\"action-btn delete-bin-btn\" title=\"Delete Bin\">" +
              "<svg width=\"10\" height=\"10\" viewBox=\"0 0 10 10\"><path fill=\"currentColor\" d=\"M1.5 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1h-7v-1zm1 2h5v4.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-4.5z\"/></svg>" +
            "</button>" +
          "</div>" +
        "</div>" +
        (hasChildren && isExpanded ? "<div class=\"tree-children\">" + self.buildTreeHTML(bin.children, depth + 1) + "</div>" : "") +
      "</div>";
    });

    return html;
  },

  /**
   * Bind DOM event listeners for the tree editor
   */
  bindTreeEvents: function () {
    var self = this;
    
    // Delegate tree clicks
    this.treeContainer.addEventListener("click", function (e) {
      var row = e.target.closest(".tree-row");
      if (!row) return;
      
      var binId = row.dataset.id;

      // Expand/Collapse
      if (e.target.classList.contains("tree-toggle")) {
        var bin = self.findBin(binId);
        if (bin && bin.children && bin.children.length > 0) {
          bin.expanded = (bin.expanded === false);
          self.renderBinTree();
        }
      }

      // Add child bin
      if (e.target.closest(".add-child-btn")) {
        self.addBin(binId, "SUB_BIN");
      }

      // Delete bin
      if (e.target.closest(".delete-bin-btn")) {
        self.deleteBin(binId);
      }
    });

    // Delegate checkbox changes
    this.treeContainer.addEventListener("change", function (e) {
      if (e.target.classList.contains("tree-checkbox")) {
        var row = e.target.closest(".tree-row");
        if (row) {
          var binId = row.dataset.id;
          self.toggleBinEnabled(binId, e.target.checked);
        }
      }
    });

    // Delegate inline text renaming input
    this.treeContainer.addEventListener("change", function (e) {
      if (e.target.classList.contains("tree-name-input")) {
        var row = e.target.closest(".tree-row");
        if (row) {
          var binId = row.dataset.id;
          var newName = e.target.value.trim().toUpperCase(); // Format to uppercase for editor structures
          if (newName) {
            self.renameBin(binId, newName);
          } else {
            self.renderBinTree(); // Revert back
          }
        }
      }
    });
  },

  /**
   * Recursive tree search by ID
   */
  _findBinByIdRecursive: function (bins, id) {
    for (var i = 0; i < bins.length; i++) {
      if (bins[i].id === id) return bins[i];
      if (bins[i].children && bins[i].children.length > 0) {
        var found = this._findBinByIdRecursive(bins[i].children, id);
        if (found) return found;
      }
    }
    return null;
  },

  findBin: function (id) {
    if (!this.activeTemplate || !this.activeTemplate.bins) return null;
    return this._findBinByIdRecursive(this.activeTemplate.bins, id);
  },

  /**
   * Add a bin to tree
   */
  addBin: function (parentId, name) {
    if (!this.activeTemplate) return;
    
    var newBin = {
      id: "bin_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      name: name || "NEW_BIN",
      enabled: true,
      expanded: true,
      children: []
    };

    if (!parentId) {
      this.activeTemplate.bins.push(newBin);
    } else {
      var parent = this.findBin(parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newBin);
        parent.expanded = true; // Auto expand parent
      }
    }

    this.checkDirty();
    this.renderBinTree();
  },

  /**
   * Delete a bin from tree
   */
  _deleteBinRecursive: function (bins, id) {
    for (var i = 0; i < bins.length; i++) {
      if (bins[i].id === id) {
        bins.splice(i, 1);
        return true;
      }
      if (bins[i].children && bins[i].children.length > 0) {
        var deleted = this._deleteBinRecursive(bins[i].children, id);
        if (deleted) return true;
      }
    }
    return false;
  },

  deleteBin: function (id) {
    if (!this.activeTemplate || !this.activeTemplate.bins) return;
    var success = this._deleteBinRecursive(this.activeTemplate.bins, id);
    if (success) {
      this.checkDirty();
      this.renderBinTree();
    }
  },

  /**
   * Rename a bin in tree
   */
  renameBin: function (id, newName) {
    var bin = this.findBin(id);
    if (bin) {
      bin.name = newName;
      this.checkDirty();
      this.renderBinTree();
    }
  },

  /**
   * Toggle enabled status, propagates up and down
   */
  toggleBinEnabled: function (id, checked) {
    var bin = this.findBin(id);
    if (bin) {
      bin.enabled = checked;
      if (checked) {
        this._enableParentsRecursive(id);
      } else {
        this._setChildrenEnabledRecursive(bin.children, false);
      }
      this.checkDirty();
      this.renderBinTree();
    }
  },

  _enableParentsRecursive: function (childId) {
    var parent = this._findParentOfBinRecursive(this.activeTemplate.bins, childId);
    if (parent) {
      parent.enabled = true;
      this._enableParentsRecursive(parent.id);
    }
  },

  _setChildrenEnabledRecursive: function (bins, enabled) {
    if (!bins) return;
    for (var i = 0; i < bins.length; i++) {
      bins[i].enabled = enabled;
      this._setChildrenEnabledRecursive(bins[i].children, enabled);
    }
  },

  _findParentOfBinRecursive: function (bins, childId) {
    for (var i = 0; i < bins.length; i++) {
      var bin = bins[i];
      if (bin.children && bin.children.some(function (c) { return c.id === childId; })) {
        return bin;
      }
      if (bin.children && bin.children.length > 0) {
        var found = this._findParentOfBinRecursive(bin.children, childId);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Tracks dirty status by comparing tree JSON structures
   */
  checkDirty: function () {
    if (!this.activeTemplate) {
      this.isDirty = false;
      return;
    }
    
    var original = window.TemplateService.getById(this.activeTemplate.id);
    if (!original) {
      this.isDirty = true;
    } else {
      var originalStr = JSON.stringify(original.bins) + original.name;
      var activeStr = JSON.stringify(this.activeTemplate.bins) + this.activeTemplate.name;
      this.isDirty = (originalStr !== activeStr);
    }
    
    // Update dirty indicator title
    if (this.activeTitleEl) {
      var text = this.activeTemplate.name;
      if (this.isDirty) {
        text += " *";
        this.activeTitleEl.classList.add("dirty");
      } else {
        this.activeTitleEl.classList.remove("dirty");
      }
      this.activeTitleEl.textContent = text;
    }

    // Toggle save button disabled state
    if (this.saveBtn) {
      if (this.isDirty) {
        this.saveBtn.removeAttribute("disabled");
      } else {
        this.saveBtn.setAttribute("disabled", "true");
      }
    }
  }
};
