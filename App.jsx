import { useState } from "react";

const G = {
  bg: "#07070c", surface: "#0f0f18", surface2: "#14141f",
  border: "#1c1c2e", accent: "#38bdf8", text: "#e8e8f0",
  muted: "#4a4a6a", radius: 14,
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#1c1c2e;border-radius:4px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
`;

function cleanText(t) {
  return t.replace(/\u2014/g, "-").replace(/\u2013/g, "-");
}

async function askGroq(messages, maxTokens = 4000) {
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || "";
  if (!text) throw new Error("Empty response");
  return cleanText(text);
}

function Spinner() {
  return <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${G.border}`, borderTopColor: G.accent, animation: "spin 0.8s linear infinite" }} />;
}

function ModeToggle({ mode, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 50, padding: 4, gap: 4 }}>
      {[{ id: "quick", label: "Quick Content" }, { id: "pack", label: "Content Pack" }, { id: "contest", label: "Thread Contest" }].map(m => (
        <button key={m.id} onClick={() => onChange(m.id)} style={{
          padding: "8px 20px", borderRadius: 50, border: "none",
          background: mode === m.id ? G.accent : "transparent",
          color: mode === m.id ? "#000" : G.muted,
          fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: mode === m.id ? 700 : 500,
          fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
        }}>{m.label}</button>
      ))}
    </div>
  );
}

const baseInput = {
  width: "100%", background: G.surface2, border: `1px solid ${G.border}`,
  borderRadius: G.radius, padding: "11px 14px", color: G.text,
  fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.88rem", outline: "none",
};

function TInput({ label, value, onChange, placeholder, hint }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: G.muted, marginBottom: 5 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...baseInput, borderColor: f ? G.accent : G.border, transition: "border-color 0.2s" }}
        onFocus={() => setF(true)} onBlur={() => setF(false)} />
      {hint && <div style={{ fontSize: "0.67rem", color: G.muted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function TArea({ label, value, onChange, placeholder, rows = 4, hint }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: G.muted, marginBottom: 5 }}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ ...baseInput, resize: "vertical", lineHeight: 1.65, borderColor: f ? G.accent : G.border, transition: "border-color 0.2s" }}
        onFocus={() => setF(true)} onBlur={() => setF(false)} />
      {hint && <div style={{ fontSize: "0.67rem", color: G.muted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { id: "thread",     label: "X Thread",         icon: "◈", desc: "Hook-driven, 8-12 tweets" },
  { id: "tweet",      label: "X Single Post",    icon: "◎", desc: "Punchy, under 280 chars" },
  { id: "linkedin",   label: "LinkedIn",          icon: "◐", desc: "Professional but human" },
  { id: "article",    label: "Long-form Article", icon: "▣", desc: "Deep dive, 900-1200 words" },
  { id: "newsletter", label: "Newsletter",        icon: "◆", desc: "Personal, value-packed" },
];

const THEMES = [
  { id: "thought",  label: "Thought Leadership", icon: "▲" },
  { id: "fsl",      label: "FSL & Case Studies", icon: "⊕" },
  { id: "web3",     label: "Web3 Insights",      icon: "⬡" },
  { id: "personal", label: "Personal Brand",     icon: "◉" },
  { id: "client",   label: "Client Project",     icon: "◐" },
];

const PACK_SECTIONS = [
  { key: "THREAD",      label: "X Thread",               icon: "◈", color: "#38bdf8" },
  { key: "SHORT_POSTS", label: "3 Short Posts",          icon: "◎", color: "#a78bfa" },
  { key: "AUTHORITY",   label: "2 Authority Takes",      icon: "▲", color: "#f97316" },
  { key: "EXPANSION",   label: "Content Expansion Ideas",icon: "◆", color: "#22c55e" },
];

const VOICE_BY_THEME = {
  thought: "Write as a sharp business thinker who teaches through reframing. Make the reader see something familiar in a completely new way.",
  fsl: "Write from the perspective of Fredrick Strategy Lab - a growth and brand architecture firm. Authoritative, specific, results-focused.",
  web3: "Write as a Web3 insider with honest, sometimes contrarian takes. No hype. Real analysis. Valuable to both newcomers and veterans.",
  personal: "Write in Fredrick Osei's personal voice - conversational, sharp, occasionally philosophical. Sounds like a smart friend sharing real lessons.",
  client: "Write as an authority in the client's specific niche. Adapt tone to fit their brand while maintaining quality, clarity, and engagement.",
};

// ── PROMPTS ───────────────────────────────────────────────────────────────────

const BASE_RULES = `Do NOT be generic. Do NOT write like typical AI.
Write with clarity, value, authority, personality, and insight.
Strong opinions when the topic calls for it.
Never use em dashes. Commas, colons, or new sentences only.
No hashtags. No fluff openers. No "In today's world" or "Have you ever".
Beginner-friendly but never dumbed down.
Occasional humor or relatability where it fits naturally.`;

function buildQuickPrompt(form, variationNote = "") {
  const typeInstructions = {
    thread: `Write an X/Twitter thread of 8-12 tweets.
- Tweet 1 is the hook. Must stop the scroll. Bold claim or unexpected reframe. No question hooks.
- Each tweet builds on the last. One idea per tweet. Under 280 characters each.
- Final tweet lands the takeaway. Format as [1/n], [2/n] etc.
- No bullet points inside tweets. Flowing prose only.`,
    tweet: `Write a single X/Twitter post.
- Under 280 characters. One sharp complete idea.
- No hashtags. Should feel worth saving or sharing.`,
    linkedin: `Write a LinkedIn post of 150-300 words.
- First line hooks immediately, no warm-up.
- Short paragraphs, 2-3 sentences max. Personal and direct but professional.
- End with one clear takeaway or reflection prompt.`,
    article: `Write a long-form article of 900-1200 words.
- Start with a strong hook - a story, counterintuitive claim, or scene.
- Use punchy subheadings to break sections.
- End with something that lands - a bigger truth or challenge to the reader.`,
    newsletter: `Write a newsletter of 400-600 words.
- Open like a letter to a smart friend. Warm but gets to the point fast.
- One central idea explored from multiple angles.
- Close with something personal or forward-looking.`,
  };

  return `You are a world-class content strategist and brand authority.
${BASE_RULES}

VOICE DIRECTION: ${VOICE_BY_THEME[form.theme]}
TOPIC: ${form.topic}
${form.angle ? `SPECIFIC ANGLE: ${form.angle}` : ""}
${form.context ? `ADDITIONAL CONTEXT: ${form.context}` : ""}
${form.brand ? `BRAND / PROJECT CONTEXT: ${form.brand}` : ""}
${variationNote ? `VARIATION NOTE: ${variationNote}` : ""}

CONTENT TYPE: ${typeInstructions[form.type]}

Write ONLY the content. No preamble. Start directly.`;
}

function buildPackPrompt(form) {
  return `You are a world-class content strategist and brand authority.
${BASE_RULES}

VOICE DIRECTION: ${VOICE_BY_THEME[form.theme]}
TOPIC: ${form.topic}
${form.angle ? `SPECIFIC ANGLE: ${form.angle}` : ""}
${form.context ? `RESEARCH INPUT / CONTEXT: ${form.context}` : ""}
${form.brand ? `BRAND / PROJECT CONTEXT: ${form.brand}` : ""}

CRITICAL: Begin with ===CONTENT_START=== and end with ===CONTENT_END===. Nothing before or after.

===CONTENT_START===

##THREAD##
Write an X/Twitter thread of 8-12 tweets. Tweet 1 is the hook - scroll-stopping, bold claim or unexpected reframe. Each tweet builds on the last. Format as [1/n]. Under 280 chars each. No bullet points inside tweets.

##SHORT_POSTS##
Write 3 short posts. Each punchy, high engagement potential, simple but insightful. Number them 1, 2, 3. Each stands alone.

##AUTHORITY##
Write 2 authority takes. Contrarian or sharp observations. Bold. Opinionated. Make people think or react. No hedging.

##EXPANSION##
Give 3 specific ideas for how to expand this topic into more content. Give the actual angle, format, and why it works. Not vague suggestions.

===CONTENT_END===`;
}

function parsePackContent(raw) {
  const s = raw.search(/={3}CONTENT_START={3}/);
  const e = raw.search(/={3}CONTENT_END={3}/);
  const body = (s !== -1 && e !== -1) ? raw.slice(s + 17, e).trim() : raw;
  const result = {};
  PACK_SECTIONS.forEach((sec, i) => {
    const tag = `##${sec.key}##`;
    const nextTag = PACK_SECTIONS[i + 1] ? `##${PACK_SECTIONS[i + 1].key}##` : null;
    const from = body.indexOf(tag);
    if (from === -1) return;
    const start = from + tag.length;
    const end = nextTag ? body.indexOf(nextTag) : body.length;
    result[sec.key] = body.slice(start, end === -1 ? undefined : end).trim();
  });
  return Object.keys(result).length > 1 ? result : null;
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function CopyBtn({ text, small }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ padding: small ? "5px 10px" : "7px 14px", borderRadius: 8, border: `1px solid ${G.border}`, background: "transparent", color: copied ? "#22c55e" : G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function printPDF(content, form, title, subtitle) {
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Lora:wght@400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Lora',Georgia,serif;max-width:720px;margin:0 auto;color:#111;padding:48px 32px;line-height:1.85}
    .brand-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px;padding-bottom:20px;border-bottom:3px solid #38bdf8}
    .brand-name{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1.1rem;color:#07070c}
    .brand-name span{color:#0284c7}
    .brand-tag{font-family:'Plus Jakarta Sans',sans-serif;font-size:0.68rem;color:#888;text-transform:uppercase;letter-spacing:0.1em}
    .doc-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.8rem;font-weight:800;margin-bottom:6px;color:#07070c;letter-spacing:-0.02em}
    .meta{color:#777;font-size:0.82rem;margin-bottom:36px;padding-bottom:16px;border-bottom:1px solid #eee}
    .section{margin-bottom:36px}
    .section-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:0.68rem;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;padding:5px 12px;display:inline-block;margin-bottom:14px;color:#000}
    .body{font-size:0.92rem;color:#222;white-space:pre-wrap;line-height:1.9}
    .footer{margin-top:48px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-family:'Plus Jakarta Sans',sans-serif}
    .footer-brand{font-weight:700;font-size:0.75rem;color:#333}
    .footer-brand span{color:#0284c7}
    .footer-note{font-size:0.7rem;color:#aaa}
  </style></head><body>
  <div class="brand-header">
    <div><div class="brand-name">Fredrick Strategy <span>Lab</span></div><div class="brand-tag">Content Engine</div></div>
    <div class="brand-tag">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
  </div>
  <div class="doc-title">${title}</div>
  <p class="meta">${subtitle}</p>
  ${content}
  <div class="footer">
    <div class="footer-brand">Fredrick Strategy <span>Lab</span></div>
    <div class="footer-note">Generated by ContentEngine - Fredrick Strategy Lab</div>
  </div>
  </body></html>`);
  w.document.close(); w.print();
}

// ── QUICK MODE OUTPUT ─────────────────────────────────────────────────────────

function QuickOutput({ content, form, onVariation, onReset }) {
  const [variations, setVariations] = useState([content]);
  const [active, setActive] = useState(0);
  const [varLoading, setVarLoading] = useState(false);
  const current = variations[active];

  const generateVariation = async () => {
    setVarLoading(true);
    const notes = [
      "Different angle - come at the same topic from a completely different entry point",
      "More philosophical - connect to a bigger life or human truth",
      "More punchy and direct - shorter sentences, bolder claims",
      "Story-led - open with a specific moment or scenario",
    ];
    try {
      const v = await onVariation(notes[variations.length % notes.length]);
      const updated = [...variations, v];
      setVariations(updated);
      setActive(updated.length - 1);
    } catch {}
    setVarLoading(false);
  };

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "18px 22px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 4 }}>Content Ready</div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>{form.topic}</div>
          <div style={{ fontSize: "0.72rem", color: G.muted, marginTop: 2 }}>{CONTENT_TYPES.find(t => t.id === form.type)?.label} - {THEMES.find(t => t.id === form.theme)?.label}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CopyBtn text={current} />
          <button onClick={() => printPDF(
            `<div class="section"><div class="body">${current.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`,
            form,
            CONTENT_TYPES.find(t => t.id === form.type)?.label || "Content",
            `Topic: ${form.topic}`
          )} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer" }}>
            Export PDF
          </button>
          <button onClick={onReset} style={{ padding: "7px 14px", borderRadius: 8, background: G.accent, border: "none", color: "#000", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>New Content</button>
        </div>
      </div>

      {variations.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {variations.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              padding: "6px 14px", borderRadius: 20,
              border: `1px solid ${active === i ? G.accent : G.border}`,
              background: active === i ? `${G.accent}18` : "transparent",
              color: active === i ? G.accent : G.muted,
              fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer",
            }}>Version {i + 1}</button>
          ))}
        </div>
      )}

      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", marginBottom: 12 }}>
        <div style={{ fontFamily: form.type === "article" || form.type === "newsletter" ? "Lora, Georgia, serif" : "Plus Jakarta Sans, sans-serif", fontSize: form.type === "tweet" ? "1.05rem" : "0.92rem", lineHeight: 1.85, color: "#d0d0e8", whiteSpace: "pre-wrap", animation: "fadeIn 0.3s ease" }}>
          {current}
        </div>
      </div>

      <button onClick={generateVariation} disabled={varLoading || variations.length >= 4}
        style={{ width: "100%", padding: "13px", borderRadius: G.radius, border: `1px dashed ${G.border}`, background: "transparent", color: varLoading ? G.muted : G.accent, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: varLoading || variations.length >= 4 ? "not-allowed" : "pointer", opacity: variations.length >= 4 ? 0.4 : 1 }}>
        {varLoading ? "Writing variation..." : variations.length >= 4 ? "Max variations reached (4)" : `Generate Variation ${variations.length + 1}`}
      </button>
    </div>
  );
}

// ── PACK MODE OUTPUT ──────────────────────────────────────────────────────────

function PackSection({ section, content, isActive, onClick }) {
  return (
    <div onClick={onClick} style={{ background: G.surface, border: `1px solid ${isActive ? section.color + "55" : G.border}`, borderRadius: G.radius, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: section.color }}>{section.icon}</span>
          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: isActive ? section.color : G.text }}>{section.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CopyBtn text={content} small />
          <span style={{ color: G.muted, fontSize: "0.75rem", display: "inline-block", transition: "transform 0.2s", transform: isActive ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>
      {isActive && (
        <div style={{ borderTop: `1px solid ${G.border}`, padding: "20px 20px 24px", animation: "fadeIn 0.2s ease" }}>
          <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: "0.93rem", lineHeight: 1.9, color: "#d0d0e8", whiteSpace: "pre-wrap" }}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

function PackOutput({ pack, form, onReset }) {
  const [active, setActive] = useState("THREAD");
  const toggle = key => setActive(active === key ? null : key);

  const copyAll = () => {
    const text = PACK_SECTIONS.filter(s => pack[s.key]).map(s => `${s.label.toUpperCase()}\n${"=".repeat(40)}\n${pack[s.key]}`).join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const exportPDF = () => {
    const sections = PACK_SECTIONS.filter(s => pack[s.key]).map(s =>
      `<div class="section"><div class="section-label" style="background:${s.color}">${s.label}</div><div class="body">${pack[s.key].replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`
    ).join("");
    printPDF(sections, form, "Content Pack", `Topic: <strong>${form.topic}</strong> &nbsp; Theme: ${THEMES.find(t => t.id === form.theme)?.label || ""}`);
  };

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "18px 22px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 4 }}>Content Pack Ready</div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>{form.topic}</div>
          <div style={{ fontSize: "0.72rem", color: G.muted, marginTop: 2 }}>{THEMES.find(t => t.id === form.theme)?.label}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={copyAll} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Copy All</button>
          <button onClick={exportPDF} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Export PDF</button>
          <button onClick={onReset} style={{ padding: "8px 14px", borderRadius: 9, background: G.accent, border: "none", color: "#000", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>New Content</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PACK_SECTIONS.filter(s => pack[s.key]).map(sec => (
          <PackSection key={sec.key} section={sec} content={pack[sec.key]} isActive={active === sec.key} onClick={() => toggle(sec.key)} />
        ))}
      </div>
    </div>
  );
}

// ── CONTEST MODE ─────────────────────────────────────────────────────────────

const CONTEST_SECTIONS = [
  { key: "HOOKS",     label: "3 Alternate Hooks",      icon: "◎", color: "#f97316" },
  { key: "THREAD",    label: "Contest Thread",          icon: "◈", color: "#38bdf8" },
  { key: "BREAKDOWN", label: "Why It Works",            icon: "▲", color: "#22c55e" },
];

function buildContestPrompt(form) {
  const angle = form.angle ? "SPECIFIC ANGLE: " + form.angle : "";
  const ctx = form.context ? "RESEARCH / CONTEXT: " + form.context : "";
  return "You are a master storyteller and viral thread writer. Your job is to write a thread contest entry that wins.\n\nCONTEST THREAD RULES:\n- 8-12 tweets total. Every tweet must earn its place.\n- Opens with a scene or story - drop the reader into a specific moment, not a generic statement.\n- Has a plot twist or unexpected turn somewhere in the middle - the reader should not see it coming.\n- Feels like a conversation, not a lecture. Write like you are talking to one person.\n- Humor is woven naturally throughout - not forced jokes, but the kind of wit that makes someone smile mid-read.\n- Ends with a big insight or takeaway that reframes everything that came before it.\n- Each tweet under 280 characters. Format as [1/n], [2/n] etc.\n- No bullet points inside tweets. Flowing prose only.\n- No hashtags. No Thread: openers. Start with the story.\n- Never use em dashes. Commas, colons, or new sentences only.\n\nVOICE: Conversational but sharp. Teaches through reframing. Everyday logic, no jargon. The kind of thread people screenshot and save.\n\nTOPIC: " + form.topic + "\n" + angle + "\n" + ctx + "\n\nCRITICAL: Begin with ===CONTEST_START=== and end with ===CONTEST_END===. Nothing before or after.\n\n===CONTEST_START===\n\n##HOOKS##\nWrite 3 alternate opening tweets for this thread. Each is a completely different angle - different tone, different entry point, different emotional trigger. Number them 1, 2, 3.\n\n##THREAD##\nWrite the full contest thread (8-12 tweets). Opens with a scene. Has a twist. Ends with the big insight. Formatted as [1/n].\n\n##BREAKDOWN##\nIn 3-5 short punchy sentences, explain why this thread is built to win. What structural choice creates the hook? Where does the twist land? What makes the ending land?\n\n===CONTEST_END===";
}

function parseContestContent(raw) {
  const s = raw.search(/={3}CONTEST_START={3}/);
  const e = raw.search(/={3}CONTEST_END={3}/);
  const body = (s !== -1 && e !== -1) ? raw.slice(s + 16, e).trim() : raw;
  const result = {};
  CONTEST_SECTIONS.forEach((sec, i) => {
    const tag = "##" + sec.key + "##";
    const nextSec = CONTEST_SECTIONS[i + 1];
    const nextTag = nextSec ? "##" + nextSec.key + "##" : null;
    const from = body.indexOf(tag);
    if (from === -1) return;
    const start = from + tag.length;
    const end = nextTag ? body.indexOf(nextTag) : body.length;
    result[sec.key] = body.slice(start, end === -1 ? undefined : end).trim();
  });
  return Object.keys(result).length > 1 ? result : null;
}

function ContestSection({ section, content, isActive, onClick }) {
  return (
    <div onClick={onClick} style={{ background: G.surface, border: "1px solid " + (isActive ? section.color + "55" : G.border), borderRadius: G.radius, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: section.color }}>{section.icon}</span>
          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: isActive ? section.color : G.text }}>{section.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CopyBtn text={content} small />
          <span style={{ color: G.muted, fontSize: "0.75rem", display: "inline-block", transition: "transform 0.2s", transform: isActive ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>
      {isActive && (
        <div style={{ borderTop: "1px solid " + G.border, padding: "20px 20px 24px", animation: "fadeIn 0.2s ease" }}>
          <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: "0.93rem", lineHeight: 1.9, color: "#d0d0e8", whiteSpace: "pre-wrap" }}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

function ContestOutput({ result, form, onReset }) {
  const [active, setActive] = useState("HOOKS");
  const toggle = key => setActive(active === key ? null : key);

  const copyAll = () => {
    const text = CONTEST_SECTIONS.filter(s => result[s.key]).map(s => s.label.toUpperCase() + "\n" + "=".repeat(40) + "\n" + result[s.key]).join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const exportPDF = () => {
    const sections = CONTEST_SECTIONS.filter(s => result[s.key]).map(s =>
      '<div class="section"><div class="section-label" style="background:' + s.color + '">' + s.label + '</div><div class="body">' + result[s.key].replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</div></div>'
    ).join("");
    printPDF(sections, form, "Thread Contest Entry", "Topic: <strong>" + form.topic + "</strong>");
  };

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <div style={{ background: G.surface, border: "1px solid " + G.border, borderRadius: G.radius, padding: "18px 22px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 4 }}>Contest Thread Ready</div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>{form.topic}</div>
          <div style={{ fontSize: "0.72rem", color: G.muted, marginTop: 2 }}>3 hooks + full thread + craft breakdown</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={copyAll} style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid " + G.border, background: "transparent", color: G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Copy All</button>
          <button onClick={exportPDF} style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid " + G.border, background: "transparent", color: G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Export PDF</button>
          <button onClick={onReset} style={{ padding: "8px 14px", borderRadius: 9, background: G.accent, border: "none", color: "#000", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>New Thread</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CONTEST_SECTIONS.filter(s => result[s.key]).map(sec => (
          <ContestSection key={sec.key} section={sec} content={result[sec.key]} isActive={active === sec.key} onClick={() => toggle(sec.key)} />
        ))}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function ContentEngine() {
  const [mode, setMode] = useState("quick");
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [quickForm, setQuickForm] = useState({ type: "thread", theme: "thought", topic: "", angle: "", context: "", brand: "" });
  const setQ = k => v => setQuickForm(p => ({ ...p, [k]: v }));

  const [packForm, setPackForm] = useState({ theme: "thought", topic: "", angle: "", context: "", brand: "" });
  const setP = k => v => setPackForm(p => ({ ...p, [k]: v }));

  const [contestForm, setContestForm] = useState({ topic: "", angle: "", context: "" });
  const setC = k => v => setContestForm(p => ({ ...p, [k]: v }));

  const reset = () => {
    setStep("form"); setResult(null); setError("");
    setQuickForm({ type: "thread", theme: "thought", topic: "", angle: "", context: "", brand: "" });
    setPackForm({ theme: "thought", topic: "", angle: "", context: "", brand: "" });
    setContestForm({ topic: "", angle: "", context: "" });
  };

  const submitQuick = async () => {
    if (!quickForm.topic.trim()) { setError("Topic is required."); return; }
    setError(""); setStep("loading");
    try {
      const raw = await askGroq([{ role: "user", content: buildQuickPrompt(quickForm) }], 3000);
      setResult(raw); setStep("output");
    } catch (err) { setError(`Generation failed: ${err.message}`); setStep("form"); }
  };

  const submitPack = async () => {
    if (!packForm.topic.trim()) { setError("Topic is required."); return; }
    setError(""); setStep("loading");
    try {
      const raw = await askGroq([{ role: "user", content: buildPackPrompt(packForm) }], 4000);
      const parsed = parsePackContent(raw);
      if (!parsed) throw new Error("AI did not return a valid content pack. Please try again.");
      setResult(parsed); setStep("output");
    } catch (err) { setError(`Generation failed: ${err.message}`); setStep("form"); }
  };

  const submitContest = async () => {
    if (!contestForm.topic.trim()) { setError("Topic is required."); return; }
    setError(""); setStep("loading");
    try {
      const raw = await askGroq([{ role: "user", content: buildContestPrompt(contestForm) }], 4000);
      const parsed = parseContestContent(raw);
      if (!parsed) throw new Error("AI did not return a valid thread. Please try again.");
      setResult(parsed); setStep("output");
    } catch (err) { setError(`Generation failed: ${err.message}`); setStep("form"); }
  };

  const generateVariation = async (note) => {
    return await askGroq([{ role: "user", content: buildQuickPrompt(quickForm, note) }], 3000);
  };

  const quickLoadingLines = {
    thread: ["Finding the right hook...", "Building the thread arc...", "Sharpening each tweet..."],
    tweet: ["Finding the sharpest angle...", "Trimming to the bone..."],
    linkedin: ["Crafting the opening...", "Finding the right voice..."],
    article: ["Mapping the structure...", "Writing the deep dive...", "Polishing the prose..."],
    newsletter: ["Opening the letter...", "Finding the insight...", "Closing strong..."],
  };

  if (step === "loading") return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><Spinner /></div>
        {(mode === "pack"
          ? ["Building your content pack...", "Writing the thread...", "Crafting authority takes...", "Generating expansion ideas..."]
          : mode === "contest"
          ? ["Setting the scene...", "Building the twist...", "Writing the thread...", "Crafting the breakdown..."]
          : (quickLoadingLines[quickForm.type] || ["Writing..."])
        ).map((t, i) => (
          <div key={i} style={{ fontSize: "0.73rem", color: G.muted, fontFamily: "Plus Jakarta Sans, sans-serif", marginTop: 10, animation: `fadeUp 0.4s ease ${i * 0.18}s both` }}>{t}</div>
        ))}
      </div>
    </div>
  );

  if (step === "output") return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "Plus Jakarta Sans, sans-serif", padding: "22px 18px 40px" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.025em" }}>Content<span style={{ color: G.accent }}>Engine</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.68rem", color: G.muted }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: G.accent, animation: "pulse 2s infinite" }} />
            {mode === "quick" ? "Quick Content" : mode === "pack" ? "Content Pack" : "Thread Contest"}
          </div>
        </div>
        {mode === "quick"
          ? <QuickOutput content={result} form={quickForm} onVariation={generateVariation} onReset={reset} />
          : mode === "pack"
          ? <PackOutput pack={result} form={packForm} onReset={reset} />
          : <ContestOutput result={result} form={contestForm} onReset={reset} />
        }
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "Plus Jakarta Sans, sans-serif", padding: "22px 18px 40px" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.03em", marginBottom: 6 }}>Content<span style={{ color: G.accent }}>Engine</span></div>
          <div style={{ fontSize: "0.8rem", color: G.muted }}>Content Engine Agent - Fredrick Strategy Lab</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <ModeToggle mode={mode} onChange={m => { setMode(m); setError(""); setStep("form"); setResult(null); }} />
          <div style={{ fontSize: "0.72rem", color: G.muted }}>
            {mode === "quick" ? "One piece of content with up to 4 variations" : mode === "pack" ? "Full pack: thread + posts + authority takes + expansion ideas" : "Story-driven thread built to win contests"}
          </div>
        </div>

        {mode === "quick" ? (
          <>
            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", marginBottom: 14, animation: "fadeUp 0.45s ease 0.05s both" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 16, fontWeight: 700 }}>Content Type</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {CONTENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setQ("type")(t.id)} style={{
                    padding: "12px 14px", borderRadius: 10,
                    border: `1px solid ${quickForm.type === t.id ? G.accent : G.border}`,
                    background: quickForm.type === t.id ? `${G.accent}12` : G.surface2,
                    color: quickForm.type === t.id ? G.accent : G.muted,
                    textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{t.icon}</span>{t.label}
                    </div>
                    <div style={{ fontSize: "0.67rem", opacity: 0.7 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", marginBottom: 14, animation: "fadeUp 0.45s ease 0.1s both" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 16, fontWeight: 700 }}>Theme</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setQ("theme")(t.id)} style={{
                    padding: "8px 16px", borderRadius: 20,
                    border: `1px solid ${quickForm.theme === t.id ? G.accent : G.border}`,
                    background: quickForm.theme === t.id ? `${G.accent}12` : "transparent",
                    color: quickForm.theme === t.id ? G.accent : G.muted,
                    fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ opacity: 0.8 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", animation: "fadeUp 0.45s ease 0.15s both" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 20, fontWeight: 700 }}>Content Brief</div>
              <TInput label="Topic *" value={quickForm.topic} onChange={setQ("topic")} placeholder="e.g. Why most startups confuse activity with progress" hint="Be specific. The sharper the topic, the sharper the content." />
              <TInput label="Specific Angle (optional)" value={quickForm.angle} onChange={setQ("angle")} placeholder="e.g. Focus on founder psychology, not tactics" />
              {quickForm.theme === "client" && <TInput label="Brand / Project Context" value={quickForm.brand} onChange={setQ("brand")} placeholder="e.g. DeFi lending protocol, 3 months post-launch, targeting retail" />}
              <TArea label="Additional Context (optional)" value={quickForm.context} onChange={setQ("context")} rows={3} placeholder="Personal stories, data points, examples, or any raw notes you want included." hint="More real context = more authentic output." />
            </div>
          </>
        ) : mode === "pack" ? (
          <>
            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", marginBottom: 14, animation: "fadeUp 0.45s ease 0.05s both" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 16, fontWeight: 700 }}>Theme</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setP("theme")(t.id)} style={{
                    padding: "8px 16px", borderRadius: 20,
                    border: `1px solid ${packForm.theme === t.id ? G.accent : G.border}`,
                    background: packForm.theme === t.id ? `${G.accent}12` : "transparent",
                    color: packForm.theme === t.id ? G.accent : G.muted,
                    fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ opacity: 0.8 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", animation: "fadeUp 0.45s ease 0.1s both" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 20, fontWeight: 700 }}>Content Brief</div>
              <TInput label="Topic *" value={packForm.topic} onChange={setP("topic")} placeholder="e.g. Why Web3 projects fail at community before they fail at product" hint="Be specific. The sharper the topic, the sharper the pack." />
              <TInput label="Specific Angle (optional)" value={packForm.angle} onChange={setP("angle")} placeholder="e.g. The psychological patterns behind community failure" />
              {packForm.theme === "client" && <TInput label="Brand / Project Context" value={packForm.brand} onChange={setP("brand")} placeholder="e.g. DeFi lending protocol, 3 months post-launch, targeting retail" />}
              <TArea label="Research Input / Context" value={packForm.context} onChange={setP("context")} rows={5}
                placeholder="Paste anything: research insights, growth strategy notes, tweets, article excerpts, raw ideas, data points. This is your main fuel for the content pack."
                hint="The more context you give, the more specific and valuable the output." />
            </div>
          </>
        ) : (
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: G.radius, padding: "24px", animation: "fadeUp 0.45s ease 0.05s both" }}>
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: G.accent, marginBottom: 20, fontWeight: 700 }}>Contest Brief</div>
            <div style={{ background: `${G.accent}0d`, border: `1px solid ${G.accent}25`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: "0.75rem", color: G.muted, lineHeight: 1.6 }}>
              <span style={{ color: G.accent }}>◈</span> Story-driven thread optimized to win contests. You get 3 alternate hooks, the full thread, and a craft breakdown.
            </div>
            <TInput label="Topic *" value={contestForm.topic} onChange={setC("topic")}
              placeholder="e.g. The day I realized most startup advice is written by people who failed"
              hint="The more specific and personal the topic, the better the story." />
            <TInput label="Specific Angle (optional)" value={contestForm.angle} onChange={setC("angle")}
              placeholder="e.g. Focus on the moment of realization, not the lesson itself" />
            <TArea label="Context / Story Material (optional)" value={contestForm.context} onChange={setC("context")} rows={4}
              placeholder="Any real story, experience, data point, or insight you want woven in. Real details make threads win."
              hint="Paste raw notes, a rough story, research, anything." />
          </div>
        )}



        {error && <div style={{ background: "#ff4d4d10", border: "1px solid #ff4d4d33", borderRadius: 10, padding: "12px 16px", margin: "14px 0", fontSize: "0.82rem", color: "#ff8888" }}>{error}</div>}

        <button onClick={mode === "quick" ? submitQuick : mode === "pack" ? submitPack : submitContest}
          style={{ width: "100%", marginTop: 14, padding: "14px", borderRadius: G.radius, background: G.accent, border: "none", color: "#000", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.92rem", cursor: "pointer", transition: "opacity 0.2s", animation: "fadeUp 0.5s ease 0.2s both" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          {mode === "quick" ? "Generate Content" : mode === "pack" ? "Generate Content Pack" : "Write Contest Thread"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.68rem", color: G.muted, marginTop: 10 }}>
          {mode === "quick" ? "One piece of content with up to 4 variations - 10-15 seconds" : mode === "pack" ? "Thread + 3 posts + 2 authority takes + expansion ideas - 20-30 seconds" : "3 hooks + full thread + craft breakdown - 15-25 seconds"}
        </p>
      </div>
    </div>
  );
}