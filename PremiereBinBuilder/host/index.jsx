/**
 * PremiereBinBuilder - ExtendScript Host Script
 */

// Simple JSON Stringify/Parse polyfill for ExtendScript's ES3 environment
var JSONXS = {
    stringify: function (obj) {
        var t = typeof (obj);
        if (t !== "object" || obj === null) {
            if (t === "string") return '"' + obj.replace(/"/g, '\\"') + '"';
            return String(obj);
        } else {
            var json = [], arr = (obj && obj.constructor === Array);
            for (var n in obj) {
                if (obj.hasOwnProperty(n)) {
                    var v = obj[n];
                    t = typeof(v);
                    if (t === "function" || t === "undefined") continue;
                    var val = this.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + val);
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    },
    parse: function (str) {
        try {
            return eval("(" + str + ")");
        } catch (e) {
            return null;
        }
    }
};

/**
 * Basic connection verification function
 * @returns {string} Success message
 */
function testConnection() {
    return "Premiere connection OK";
}

/**
 * Find a specific bin folder inside parent children list
 * @param {Object} parent The parent ProjectItem
 * @param {string} name Bin name to look for
 * @returns {Object|null}
 */
function findChildBin(parent, name) {
    if (!parent || !parent.children) return null;
    var children = parent.children;
    var numItems = children.numItems;
    for (var i = 0; i < numItems; i++) {
        var item = children[i];
        if (item && item.name === name && item.type === 2) { // 2 = Bin
            return item;
        }
    }
    return null;
}

/**
 * Find existing or create a bin under parent
 * @param {Object} parent The parent ProjectItem
 * @param {string} name Bin name
 * @param {Object} stats Statistics counter
 * @returns {Object|null}
 */
function getOrCreateBin(parent, name, stats) {
    if (!parent) return null;
    
    // 1. Search for duplicate name inside parent scope
    var existing = findChildBin(parent, name);
    if (existing) {
        stats.skipped++;
        return existing;
    }
    
    // 2. Create the bin if it doesn't exist
    try {
        var newBin = parent.createBin(name);
        if (newBin) {
            stats.created++;
            return newBin;
        } else {
            stats.errors.push("Failed to create bin: " + name);
            return null;
        }
    } catch (e) {
        stats.errors.push("Error creating bin '" + name + "': " + e.message);
        return null;
    }
}

/**
 * Creates TEST_BIN at root of project
 * @returns {string} Serialized statistics
 */
function createTestBin() {
    if (!app.project) {
        return JSONXS.stringify({ success: false, error: "No Premiere project open" });
    }
    
    var root = app.project.rootItem;
    if (!root) {
        return JSONXS.stringify({ success: false, error: "Cannot access rootItem" });
    }
    
    var stats = { success: true, created: 0, skipped: 0, errors: [] };
    getOrCreateBin(root, "TEST_BIN", stats);
    
    if (stats.errors.length > 0) {
        stats.success = false;
    }
    return JSONXS.stringify(stats);
}

/**
 * Creates 01_FOOTAGE/RAW, BROLL, STOCK
 * @returns {string} Serialized statistics
 */
function createTestTree() {
    if (!app.project) {
        return JSONXS.stringify({ success: false, error: "No Premiere project open" });
    }
    
    var root = app.project.rootItem;
    if (!root) {
        return JSONXS.stringify({ success: false, error: "Cannot access rootItem" });
    }
    
    var stats = { success: true, created: 0, skipped: 0, errors: [] };
    
    var footageBin = getOrCreateBin(root, "01_FOOTAGE", stats);
    if (footageBin) {
        getOrCreateBin(footageBin, "RAW", stats);
        getOrCreateBin(footageBin, "BROLL", stats);
        getOrCreateBin(footageBin, "STOCK", stats);
    }
    
    if (stats.errors.length > 0) {
        stats.success = false;
    }
    return JSONXS.stringify(stats);
}

/**
 * Recursive helper to build subfolders
 */
function createBinTreeRecursive(parent, binData, stats) {
    if (!parent || !binData) return;
    
    for (var i = 0; i < binData.length; i++) {
        var node = binData[i];
        
        // 1. Skip if disabled
        if (node.enabled === false) {
            continue;
        }
        
        // 2. Name validation
        if (!node.name) {
            stats.errors.push("Empty Bin name encountered");
            continue;
        }
        
        // 3. Create or find bin
        var folder = getOrCreateBin(parent, node.name, stats);
        
        // 4. Recurse children
        if (folder && node.children && node.children.length > 0) {
            createBinTreeRecursive(folder, node.children, stats);
        }
    }
}

/**
 * Main recursive engine entrypoint
 * @param {string} jsonString Serialized tree data
 * @returns {string} Serialized statistics
 */
function createBinsFromJson(jsonString) {
    if (!app.project) {
        return JSONXS.stringify({ success: false, error: "No Premiere project open" });
    }
    
    var root = app.project.rootItem;
    if (!root) {
        return JSONXS.stringify({ success: false, error: "Cannot access rootItem" });
    }
    
    try {
        var binData = JSONXS.parse(jsonString);
        if (!binData) {
            return JSONXS.stringify({ success: false, error: "Invalid tree data (parse error)" });
        }
        
        var stats = { success: true, created: 0, skipped: 0, errors: [] };
        createBinTreeRecursive(root, binData, stats);
        
        if (stats.errors.length > 0) {
            stats.success = false;
        }
        return JSONXS.stringify(stats);
    } catch (e) {
        return JSONXS.stringify({ success: false, error: "ExtendScript exception: " + e.message });
    }
}
