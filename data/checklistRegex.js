// ─────────────────────────────────────────────────────────────────────────────
// The two regex scripts behind the visible checklist.
//
// "Checklist box" folds the <checklist> at the top of a reply into a collapsed
// box (display only). "Checklist cleanup" takes it out of the prompt, so old
// checklists never pile up in the context. src/engine/checklistRegex.js adds
// both to SillyTavern's global regex list on first load.
// ─────────────────────────────────────────────────────────────────────────────

export const CHECKLIST_REGEX = [
    {
        id: "ed4227b3-3be4-43b8-b053-687bfd56a3f7",
        scriptName: "Checklist box",
        findRegex: "/<checklist>\\s*([\\s\\S]*?)\\s*<\\/checklist\\s*>/gi",
        replaceString: `\n\n<details class="meg-checklist" style="margin: 0 0 16px; border: 1px solid #333; border-radius: 8px; overflow: hidden;"><summary style="cursor: pointer; padding: 6px 12px; font-size: 0.8em; letter-spacing: 1px; color: #aaa; background: rgba(255,255,255,0.05);">✅ Checklist</summary><div style="padding: 10px 14px; white-space: pre-wrap; line-height: 1.5; font-size: 0.9em;">$1</div></details>\n\n`,
        trimStrings: [],
        placement: [2],
        disabled: false,
        markdownOnly: true,
        promptOnly: false,
        runOnEdit: true,
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
    },
    {
        id: "1a0dab64-f02f-4972-9493-b957e82a0445",
        scriptName: "Checklist cleanup",
        findRegex: "/<checklist>[\\s\\S]*?<\\/checklist\\s*>\\s*/gi",
        replaceString: "",
        trimStrings: [],
        placement: [2],
        disabled: false,
        markdownOnly: false,
        promptOnly: true,
        runOnEdit: true,
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
    },
];
