// ─────────────────────────────────────────────────────────────────────────────
// Puts the checklist's regex scripts where SillyTavern runs them.
//
// They go into the global regex list rather than the preset, so a reader who
// updates the extension gets the box without re-importing a preset and losing
// their edits to it. Added once, on first load: a reader who deletes or
// disables them afterwards is left alone, and a script already there under the
// same name is not added twice.
// ─────────────────────────────────────────────────────────────────────────────

import { extension_settings, saveSettingsDebounced } from "../st.js";
import { extensionName } from "../core/constants.js";
import { CHECKLIST_REGEX } from "../../data/checklistRegex.js";

export function installChecklistRegex() {
    if (!extension_settings[extensionName]) extension_settings[extensionName] = { profiles: {} };
    const store = extension_settings[extensionName];
    if (store.checklistRegexInstalled) return;

    if (!Array.isArray(extension_settings.regex)) extension_settings.regex = [];
    const have = new Set(extension_settings.regex.map(s => s && s.scriptName));
    CHECKLIST_REGEX.forEach(script => {
        if (!have.has(script.scriptName)) extension_settings.regex.push(structuredClone(script));
    });

    store.checklistRegexInstalled = true;
    saveSettingsDebounced();
}
