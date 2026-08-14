/**
 * Template Service - Manages templates business logic and CRUD
 */
window.TemplateService = {
  templates: [],

  defaultTemplate: {
    id: "tpl_default_doc",
    name: "YouTube Documentary",
    bins: [
      {
        id: "bin_footage",
        name: "01_FOOTAGE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_footage_raw", name: "RAW", enabled: true, children: [] },
          { id: "bin_footage_broll", name: "BROLL", enabled: true, children: [] },
          { id: "bin_footage_stock", name: "STOCK", enabled: true, children: [] },
          { id: "bin_footage_archive", name: "ARCHIVE", enabled: true, children: [] },
          { id: "bin_footage_ai_image", name: "AI_IMAGE", enabled: true, children: [] },
          { id: "bin_footage_ai_video", name: "AI_VIDEO", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_audio",
        name: "02_AUDIO",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_audio_vo", name: "VOICE_OVER", enabled: true, children: [] },
          { id: "bin_audio_music", name: "MUSIC", enabled: true, children: [] },
          { id: "bin_audio_sfx", name: "SFX", enabled: true, children: [] },
          { id: "bin_audio_amb", name: "AMBIENCE", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_graphics",
        name: "03_GRAPHICS",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_graphics_png", name: "PNG", enabled: true, children: [] },
          { id: "bin_graphics_mogrt", name: "MOGRT", enabled: true, children: [] },
          { id: "bin_graphics_overlay", name: "OVERLAY", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_sequence",
        name: "04_SEQUENCE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_sequence_main", name: "MAIN", enabled: true, children: [] },
          { id: "bin_sequence_nest", name: "NEST", enabled: true, children: [] },
          { id: "bin_sequence_export", name: "EXPORT", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_export",
        name: "05_EXPORT",
        enabled: true,
        expanded: true,
        children: []
      }
    ],
    createdAt: 1723456789,
    updatedAt: 1723456789
  },

  /**
   * Initialize templates list from storage, loads default if empty
   */
  init: function () {
    var stored = window.StorageService.load();
    if (stored && stored.length > 0) {
      this.templates = stored;
    } else {
      // Create and save default template if storage is empty
      this.templates = [JSON.parse(JSON.stringify(this.defaultTemplate))];
      window.StorageService.save(this.templates);
    }
  },

  /**
   * Get all templates
   * @returns {Array}
   */
  getAll: function () {
    return this.templates;
  },

  /**
   * Get a template copy by ID
   * @param {string} id 
   * @returns {Object|null} Deep cloned template object
   */
  getById: function (id) {
    for (var i = 0; i < this.templates.length; i++) {
      if (this.templates[i].id === id) {
        return JSON.parse(JSON.stringify(this.templates[i]));
      }
    }
    return null;
  },

  /**
   * Save (create or update) a template
   * @param {Object} template 
   * @returns {boolean} Success status
   */
  save: function (template) {
    var clone = JSON.parse(JSON.stringify(template));
    clone.updatedAt = Date.now();
    
    var index = -1;
    for (var i = 0; i < this.templates.length; i++) {
      if (this.templates[i].id === clone.id) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      this.templates[index] = clone;
    } else {
      clone.createdAt = Date.now();
      this.templates.push(clone);
    }

    return window.StorageService.save(this.templates);
  },

  /**
   * Rename a template
   * @param {string} id 
   * @param {string} newName 
   * @returns {boolean} Success status
   */
  rename: function (id, newName) {
    var name = newName.trim();
    if (!name) return false;

    for (var i = 0; i < this.templates.length; i++) {
      if (this.templates[i].id === id) {
        this.templates[i].name = name;
        this.templates[i].updatedAt = Date.now();
        return window.StorageService.save(this.templates);
      }
    }
    return false;
  },

  /**
   * Duplicate any template
   * @param {string} id 
   * @returns {Object|null} The duplicated template copy
   */
  duplicate: function (id) {
    var source = this.getById(id);
    if (!source) return null;

    var clone = JSON.parse(JSON.stringify(source));
    clone.id = "tpl_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    clone.name = clone.name + " Copy";
    clone.createdAt = Date.now();
    clone.updatedAt = Date.now();

    this.templates.push(clone);
    window.StorageService.save(this.templates);
    return clone;
  },

  /**
   * Delete a template
   * @param {string} id 
   * @returns {boolean} Success status
   */
  delete: function (id) {
    var index = -1;
    for (var i = 0; i < this.templates.length; i++) {
      if (this.templates[i].id === id) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      this.templates.splice(index, 1);
      return window.StorageService.save(this.templates);
    }
    return false;
  }
};
