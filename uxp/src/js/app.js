/**
 * PremiereBinBuilder - Application Entrypoint
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Preset Service (loads user-defined custom presets from localStorage)
  window.PresetService.init();

  // 2. Initialize UI (binds event handlers and loads initial preset structure)
  window.UIService.init();

  // 3. Register UXP Entrypoints
  try {
    const { entrypoints } = require("uxp");
    
    entrypoints.setup({
      plugin: {
        create: () => {
          console.log("PremiereBinBuilder: Plugin initialized.");
        },
        destroy: () => {
          console.log("PremiereBinBuilder: Plugin destroyed.");
        }
      },
      panels: {
        premiereBinBuilderPanel: {
          show(node) {
            console.log("PremiereBinBuilder panel displayed.");
            // Refresh to ensure we have the latest data/state
            window.PresetService.init();
            window.UIService.refreshPresetsDropdown();
            window.UIService.loadSelectedPreset();
          },
          menuItems: [
            { id: "reload", label: "Reload Plugin", enabled: true, checked: false }
          ],
          invokeMenu(id) {
            if (id === "reload") {
              window.location.reload();
            }
          }
        }
      }
    });
  } catch (err) {
    console.warn("UXP entrypoints not available (offline/standalone execution).", err);
  }
});
