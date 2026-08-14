/**
 * Premiere Service - Wrapper for Adobe Premiere Pro UXP API
 */
window.PremiereService = {
  /**
   * Safe getter for Premiere Pro API module
   */
  getAPI() {
    try {
      return require('premierepro');
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if Premiere Pro environment is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.getAPI() !== null;
  },

  /**
   * Get active project
   * @returns {Promise<Object|null>}
   */
  async getActiveProject() {
    const api = this.getAPI();
    if (!api) return null;
    try {
      return await api.Project.getActiveProject();
    } catch (e) {
      console.error("Error getting active project:", e);
      return null;
    }
  },

  /**
   * Recursively traverses a FolderItem to capture the current bin structure.
   * Type 2 corresponds to Bins.
   * @param {Object} folderItem 
   * @returns {Promise<Array>}
   */
  async captureBinTree(folderItem) {
    const api = this.getAPI();
    if (!api) return [];
    
    try {
      const items = await folderItem.getItems();
      const bins = [];
      
      for (const item of items) {
        // type 2 is Bin (FolderItem)
        if (item.type === 2) {
          const folder = api.FolderItem.cast(item);
          if (folder) {
            const children = await this.captureBinTree(folder);
            bins.push({
              id: "captured_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
              name: folder.name,
              enabled: true,
              expanded: false,
              children: children
            });
          }
        }
      }
      return bins;
    } catch (e) {
      console.error("Error capturing bin tree:", e);
      return [];
    }
  },

  /**
   * Capture from active project
   * @returns {Promise<Array|null>}
   */
  async captureCurrentStructure() {
    const project = await this.getActiveProject();
    if (!project) return null;

    try {
      const root = await project.getRootItem();
      if (!root) return null;
      return await this.captureBinTree(root);
    } catch (e) {
      console.error("Error capturing current structure:", e);
      return null;
    }
  },

  /**
   * Creates a bin structure recursively in the project.
   * Returns statistics of the operation.
   * @param {Array} bins 
   * @returns {Promise<Object>} { created, skipped, errors }
   */
  async createBins(bins) {
    const project = await this.getActiveProject();
    if (!project) {
      throw new Error("No active project open in Premiere Pro.");
    }

    const api = this.getAPI();
    const root = await project.getRootItem();
    if (!root) {
      throw new Error("Could not access project root item.");
    }

    const stats = { created: 0, skipped: 0, errors: 0 };
    await this._createBinNodeList(project, api, root, bins, stats);
    return stats;
  },

  /**
   * Recursive helper to create bins list inside a parent folder
   */
  async _createBinNodeList(project, api, parentFolder, bins, stats) {
    for (const bin of bins) {
      if (!bin.enabled) continue;

      try {
        // 1. Fetch current items of this folder to check for duplicates
        const currentItems = await parentFolder.getItems();
        let targetFolder = null;

        for (const item of currentItems) {
          if (item.name === bin.name && item.type === 2) {
            targetFolder = api.FolderItem.cast(item);
            break;
          }
        }

        if (targetFolder) {
          // Folder already exists, skip creating it but count
          stats.skipped++;
        } else {
          // 2. Folder does not exist, create it inside a locked transaction
          let createAction = null;
          
          project.lockedAccess(() => {
            project.executeTransaction((compoundAction) => {
              createAction = parentFolder.createBinAction(bin.name, false);
              compoundAction.addAction(createAction);
            }, `Create Bin: ${bin.name}`);
          });

          // 3. Search for the newly created folder to get its FolderItem cast
          const updatedItems = await parentFolder.getItems();
          for (const item of updatedItems) {
            if (item.name === bin.name && item.type === 2) {
              targetFolder = api.FolderItem.cast(item);
              break;
            }
          }

          if (targetFolder) {
            stats.created++;
          } else {
            throw new Error(`Failed to retrieve created bin: ${bin.name}`);
          }
        }

        // 4. If children exist, recursively build them inside this target folder
        if (bin.children && bin.children.length > 0 && targetFolder) {
          await this._createBinNodeList(project, api, targetFolder, bin.children, stats);
        }
      } catch (err) {
        console.error(`Error processing bin "${bin.name}":`, err);
        stats.errors++;
      }
    }
  }
};
