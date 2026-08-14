/**
 * PremiereBinBuilder - Main CEP Application Controller
 */

document.addEventListener("DOMContentLoaded", function () {
  var csInterface = new CSInterface();
  
  // 1. Initialize Services
  window.TemplateService.init();
  window.TemplateUI.init();

  // Load the first template by default
  var templates = window.TemplateService.getAll();
  if (templates.length > 0) {
    window.TemplateUI.loadTemplate(templates[0].id);
  } else {
    window.TemplateUI.renderBinTree();
    window.TemplateUI.renderTemplateList();
  }

  // Pending Actions state
  var pendingAction = null; // "switch" or "new"
  var pendingTemplateSwitchId = null;

  // Cache modal elements
  var modalEl = document.getElementById("unsaved-modal");
  var modalSaveBtn = document.getElementById("modal-save-btn");
  var modalDiscardBtn = document.getElementById("modal-discard-btn");
  var modalCancelBtn = document.getElementById("modal-cancel-btn");
  var statusText = document.getElementById("status-text");

  // Cache template controls
  var newTemplateBtn = document.getElementById("new-template-btn");
  var saveChangesBtn = document.getElementById("save-changes-btn");
  var duplicateTemplateBtn = document.getElementById("duplicate-template-btn");
  var deleteTemplateBtn = document.getElementById("delete-template-btn");
  var nameInput = document.getElementById("active-template-name-input");
  var addRootBinBtn = document.getElementById("add-root-bin-btn");
  var createBinsBtn = document.getElementById("create-bins-btn");

  // Sidebar List Event Delegation
  document.getElementById("template-list-container").addEventListener("click", function (e) {
    var item = e.target.closest(".template-list-item");
    if (!item) return;
    
    var targetId = item.dataset.id;
    if (window.TemplateUI.activeTemplate && window.TemplateUI.activeTemplate.id === targetId) return;

    if (window.TemplateUI.isDirty) {
      showUnsavedModal("switch", targetId);
    } else {
      window.TemplateUI.loadTemplate(targetId);
    }
  });

  // Modal Actions Helper
  function showUnsavedModal(actionType, targetId) {
    pendingAction = actionType;
    pendingTemplateSwitchId = targetId;
    modalEl.classList.remove("hidden");
  }

  function hideUnsavedModal() {
    pendingAction = null;
    pendingTemplateSwitchId = null;
    modalEl.classList.add("hidden");
  }

  function createNewTemplate() {
    var newId = "tpl_" + Date.now();
    var newTpl = {
      id: newId,
      name: "My Workflow",
      bins: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    window.TemplateService.save(newTpl);
    window.TemplateUI.loadTemplate(newId);
    
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }

  // Modal Buttons Click Listeners
  modalSaveBtn.addEventListener("click", function () {
    var res = window.TemplateUI.saveChanges();
    if (res.success) {
      var action = pendingAction;
      var targetId = pendingTemplateSwitchId;
      hideUnsavedModal();
      if (action === "switch" && targetId) {
        window.TemplateUI.loadTemplate(targetId);
      } else if (action === "new") {
        createNewTemplate();
      }
    } else {
      alert("Validation Error: " + res.error);
    }
  });

  modalDiscardBtn.addEventListener("click", function () {
    var action = pendingAction;
    var targetId = pendingTemplateSwitchId;
    hideUnsavedModal();
    if (action === "switch" && targetId) {
      window.TemplateUI.loadTemplate(targetId);
    } else if (action === "new") {
      createNewTemplate();
    }
  });

  modalCancelBtn.addEventListener("click", function () {
    hideUnsavedModal();
  });

  // Header Actions
  newTemplateBtn.addEventListener("click", function () {
    if (window.TemplateUI.isDirty) {
      showUnsavedModal("new", null);
    } else {
      createNewTemplate();
    }
  });

  saveChangesBtn.addEventListener("click", function () {
    var res = window.TemplateUI.saveChanges();
    if (!res.success) {
      alert("Validation Error: " + res.error);
    }
  });

  duplicateTemplateBtn.addEventListener("click", function () {
    if (!window.TemplateUI.activeTemplate) return;
    
    var activeId = window.TemplateUI.activeTemplate.id;
    var copy = window.TemplateService.duplicate(activeId);
    if (copy) {
      window.TemplateUI.loadTemplate(copy.id);
    }
  });

  deleteTemplateBtn.addEventListener("click", function () {
    if (!window.TemplateUI.activeTemplate) return;
    
    var activeTpl = window.TemplateUI.activeTemplate;
    var confirmDelete = confirm("Delete template \"" + activeTpl.name + "\"?");
    if (confirmDelete) {
      var activeId = activeTpl.id;
      window.TemplateService.delete(activeId);
      
      // Load next available template
      var remaining = window.TemplateService.getAll();
      if (remaining.length > 0) {
        window.TemplateUI.loadTemplate(remaining[0].id);
      } else {
        window.TemplateUI.activeTemplate = null;
        window.TemplateUI.isDirty = false;
        window.TemplateUI.renderBinTree();
        window.TemplateUI.renderTemplateList();
      }
    }
  });

  // Name Input real-time updates
  nameInput.addEventListener("input", function () {
    if (window.TemplateUI.activeTemplate) {
      window.TemplateUI.activeTemplate.name = nameInput.value;
      window.TemplateUI.checkDirty();
    }
  });

  // Add Root Bin Click
  addRootBinBtn.addEventListener("click", function () {
    window.TemplateUI.addBin(null, "NEW_BIN");
  });

  // Main CREATE BINS Execution (ExtendScript JSON Builder invocation)
  createBinsBtn.addEventListener("click", function () {
    if (!window.TemplateUI.activeTemplate) {
      statusText.textContent = "✕ No active template selected";
      statusText.className = "";
      statusText.style.color = "#ff646c";
      return;
    }

    statusText.textContent = "Creating bins structure...";
    statusText.className = "";
    statusText.style.color = "";

    // Serialize tree
    var jsonStr = JSON.stringify(window.TemplateUI.activeTemplate.bins);
    
    // Safely escape characters for JSX call execution
    var escapedJsonStr = jsonStr.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    
    csInterface.evalScript("createBinsFromJson('" + escapedJsonStr + "')", function (result) {
      try {
        var stats = JSON.parse(result);
        if (stats.error) {
          statusText.textContent = "✕ " + stats.error;
          statusText.style.color = "#ff646c";
          statusText.className = "";
          return;
        }

        var msg = "";
        if (stats.errors && stats.errors.length > 0) {
          msg = "⚠ Created: " + stats.created + ", skipped: " + stats.skipped + ", errors: " + stats.errors.length;
          statusText.textContent = msg;
          statusText.style.color = "#e69d45";
          statusText.className = "";
        } else {
          if (stats.created > 0 && stats.skipped > 0) {
            msg = "✓ Created: " + stats.created + ", skipped: " + stats.skipped;
          } else if (stats.created > 0) {
            msg = "✓ Created: " + stats.created;
          } else {
            msg = "✓ Skipped: " + stats.skipped + " existing";
          }
          statusText.textContent = msg;
          statusText.className = "ok";
          statusText.style.color = "";
        }
      } catch (e) {
        statusText.textContent = "✕ Response parsing failed: " + e.message;
        statusText.style.color = "#ff646c";
        statusText.className = "";
      }
    });
  });

  // --- Collapsed Developer Drawer Test Actions ---
  
  var testConnBtn = document.getElementById("test-connection-btn");
  var testBinBtn = document.getElementById("create-test-bin-btn");
  var testTreeBtn = document.getElementById("create-test-tree-btn");

  testConnBtn.addEventListener("click", function () {
    statusText.textContent = "Testing...";
    statusText.className = "";
    statusText.style.color = "";

    csInterface.evalScript("testConnection()", function (result) {
      if (result === "Premiere connection OK") {
        statusText.textContent = result;
        statusText.className = "ok";
        statusText.style.color = "";
      } else {
        statusText.textContent = "Connection failed: " + result;
        statusText.style.color = "#ff646c";
      }
    });
  });

  testBinBtn.addEventListener("click", function () {
    statusText.textContent = "Creating test bin...";
    statusText.className = "";
    statusText.style.color = "";

    csInterface.evalScript("createTestBin()", function (result) {
      try {
        var stats = JSON.parse(result);
        if (stats.error) {
          statusText.textContent = "✕ " + stats.error;
          statusText.style.color = "#ff646c";
          return;
        }
        statusText.textContent = "✓ Created: " + stats.created + ", skipped: " + stats.skipped;
        statusText.className = "ok";
      } catch (e) {
        statusText.textContent = "✕ Response parsing failed: " + e.message;
        statusText.style.color = "#ff646c";
      }
    });
  });

  testTreeBtn.addEventListener("click", function () {
    statusText.textContent = "Creating test tree...";
    statusText.className = "";
    statusText.style.color = "";

    csInterface.evalScript("createTestTree()", function (result) {
      try {
        var stats = JSON.parse(result);
        if (stats.error) {
          statusText.textContent = "✕ " + stats.error;
          statusText.style.color = "#ff646c";
          return;
        }
        statusText.textContent = "✓ Created: " + stats.created + ", skipped: " + stats.skipped;
        statusText.className = "ok";
      } catch (e) {
        statusText.textContent = "✕ Response parsing failed: " + e.message;
        statusText.style.color = "#ff646c";
      }
    });
  });
});
