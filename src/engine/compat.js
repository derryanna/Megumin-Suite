// ─────────────────────────────────────────────────────────────────────────────
// No Visible Reasoning.
//
// Several newer models (Claude Opus 5.5, the Fable class, recent Gemini) decline a request that asks
// them to write their reasoning into the reply: the API answers with a refusal
// (category "reasoning_extraction"), and many proxies pass that on as a plain
// 400. Those models always think internally anyway, so this fork never asks
// for written thinking. What the reader sees instead is the checklist itself:
//   - the roleplay prompt gets each engine's Chain of Thought rewritten as a
//     checklist (data/cot/checklists.js), and the reply opens with a short
//     <checklist> of marks, one line per item, instead of a <think> block to
//     fill in. No prefill. The preset's "Checklist box" regex folds it into a
//     box and "Checklist cleanup" keeps it out of the prompt;
//   - every background job (Story Director, Ban List, Image Gen, NPC portrait,
//     NPC scan, NPC update, memory summary) drops its "Thinking Instructions"
//     and its prefill, and gets a single line that says what the reply contains.
//
// The output formats themselves (<directive>, <New_NPC>, <NPC_Update>, the
// <Blocks> envelope, raw image prompts) are unchanged, so every parser keeps
// working.
// ─────────────────────────────────────────────────────────────────────────────

// Always on in this fork: the checklists work on every model, so there is no
// switch. Kept as a function so the upstream code paths stay readable and
// merges from upstream stay small.
export function noVisibleReasoning() {
    return true;
}

// Replaces the Thinking Tags wrapper. {Thinking} is where the engine's chain of
// thought lands, exactly as in the normal wrapper.
//
// The reply opens with the checklist's marks: a short name and ✓ or ✗ per
// item, nothing else, so the reader can see that every item was looked at
// without the model writing out any reasoning.
export const COMPAT_THINK_WRAPPER =
    "The scene you write holds to the criteria below.\n\n"
    + "{Thinking}\n\n"
    + "Open the reply with a <checklist> block: "
    + "one line per criterion, a name of two to four words and ✓, or ✗ when it has no place in this scene. "
    + "Names and marks only. Close it with </checklist>, then write the scene, followed by the blocks these rules ask for.";

// The preset's heading over [[THINK]]. Renamed in compat mode so the prompt no
// longer asks for "thinking steps"; dropped when there is nothing under it.
export const THINK_HEADING_RE = /^([ \t]*#+[ \t]*)your thinking steps:[ \t]*$/gim;
export const COMPAT_THINK_HEADING = "$1Scene criteria:";

// The engine chain-of-thought scripts were written to be filled in inside a
// <think> block. The V10 ones already read as reminders; only the framing has
// to go: the headings that call it a reasoning process, lines that set a
// length or language for the written thinking, and any literal think tags.
// The older multi-phase scripts (V7–V9 "writer's room", drafts) are processes,
// not criteria — they pass through, but an engine meant for this mode should
// carry a hand-adapted `compatCot` instead.
export function compatCriteria(cot) {
    if (!cot) return "";
    return cot
        // The V10 "Thinking Cap" block and its lead-in, when a custom engine
        // carries a copy of them (the built-in capped scripts have `compat`).
        .replace(/^[ \t]*HARD LIMITS on the thinking phase:[\s\S]*?skip deliberation entirely and write\.[ \t]*\r?\n?/im, "")
        .replace(/^[ \t]*\*\*Thinking — keep it short, then write\.\*\*[^\n]*\r?\n[^\n]*\r?\n?/im, "")
        .replace(/^([ \t]*#+[ \t]*)(THINKING|Reasoning Process|Plan)[ \t]*:?[ \t]*$/gim, "$1Criteria:")
        .replace(/^([ \t]*)\[THINKING STEPS\]/gim, "$1[CRITERIA]")
        .replace(/^[^\n]*(Minimum total thinking length|All thinking must be written in|Your Thinking must not be more than)[^\n]*\r?\n?/gim, "")
        .replace(/^[ \t]*<\/?think>[ \t]*\r?\n?/gim, "")
        .replace(/<\/?think>/gi, "")
        .trim();
}

// One line per background job, in place of its Thinking Instructions. Each
// says what the whole reply is; the format itself is in the job's own prompt.
export const COMPAT_TASK_FORMAT = {
    storyPlan: "Your entire reply is one <directive></directive> block holding the blueprint in the structure above. Nothing before or after it.",
    banList: "Your entire reply is the 5 rules, separated by commas. Nothing before or after them.",
    imageGen: "Your entire reply is the image prompt itself, following the rules above. Nothing before or after it.",
    npcPortrait: "Your entire reply is the portrait prompt itself. Nothing before or after it.",
    npcScan: "Your entire reply is the dossiers of the missing NPCs, one after another, in the format above. Nothing before, between or after them.",
    npcUpdate: "Your entire reply is the <NPC_Update> block, or exactly NO CHANGE. Do not restate anything that is already correct on the record.",
};

// The Story Tracker, reworded as state data rather than an "internal status
// report". Same fields, same tag, so the renderer and the parser are unaffected.
// Only used when the tracker template has not been customised.
export const COMPAT_TRACKER = `<Story_Tracker>
At the END of your response, add this tracker with the current state of the story against the active blueprint. It is data for the interface and is hidden from the reader.

arc_status: [progressing | nearing_climax | completed | pivoted]
current_arc: [Name the arc you are actively writing]
main_event_progress: [How far along the main event is — not started | building | in motion | resolving]
sub_event_advanced: [Which numbered sub-event you just advanced or set up in this response]
npc_actions: [Which NPCs acted on their agenda in this response and what they did]
simmering_threads: [2-3 background tensions you are keeping warm]
hidden_state: [NPC secrets and motives that {{user}} does not know yet]
next_beat: [What sub-event or NPC action you intend to steer toward next]
</Story_Tracker>`;
