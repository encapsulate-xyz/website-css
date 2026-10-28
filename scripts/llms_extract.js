// The page as Markdown, for llms.txt (scripts/llms.py runs it in every sitemap page through livecheck.mjs).
// What a reader sees, in reading order: headings, paragraphs, lists, tables, code, quotes and links — not the
// navbar, the footer, a block the page hides (copy toggles, the galleries a script reads), a marquee's second copy
// (aria-hidden) or a drawing. A closed toggle's answer is read: its words are on the page, one press away. The vote
// story's drawing is read as its label, as a screen reader reads it ("1,913 votes: 1,243 Yes, …"), not as the figures
// set inside it (2026-10-28). Only that one: /security's diagram is labelled too, but its label leaves out words its
// boxes carry (auditd, Wazuh, Loki, the hardware key), so it is read as before.
const SKIP = "script, style, noscript, svg, canvas, video, iframe, img, picture, button, input, select, textarea, " +
  ".super-navbar, .super-footer, .enc-nav, .enc-foot, [aria-hidden='true'], [data-enc-source], template, " +
  ".enc-ch__crumb, .enc-ch__week, .enc-ch__days, " +  // a chain page's trail over every section, and its calendar's cells
  ".enc-story__count, .enc-story__hint";  // the vote story's beat counter and its "Scroll" hint
const LABELLED = ".enc-story [role='img'][aria-label]";
const label = (el) => clean(el.getAttribute("aria-label")).trim();
const root = document.querySelector(".super-content") || document.querySelector("main") || document.body;
const abs = (h) => { try { const u = new URL(h, location.href); return /^(https?|mailto):/.test(u.protocol) ? u.href : null; } catch (e) { return null; } };
const clean = (t) => t.replace(/[   ]/g, " ").replace(/[ \t\r\n]+/g, " ");
// a closed toggle's content is read (Notion hides it until the toggle opens); a toggle hidden as a whole is not
const shut = (el) => el.matches(".notion-toggle > :not(.notion-toggle__summary), details > :not(summary)");
const hidden = (el) => { const cs = getComputedStyle(el); return !shut(el) && (cs.display === "none" || cs.visibility === "hidden"); };
const tidy = (t) => t.replace(/ {2,}/g, " ").replace(/ ([.,;:!?)])/g, "$1").replace(/\( /g, "(").replace(/^‣ ?/, "").trim();
// a block starts a paragraph of its own; a display: contents wrapper (Super's gallery cards) is as block as what it holds
const blocky = (el) => {
  if (el.matches("p, li, h1, h2, h3, h4, h5, h6, pre, table, blockquote, figcaption, ul, ol, details, summary")) return true;
  const d = getComputedStyle(el).display;
  if (d === "contents") return [...el.children].some(k => !k.matches(SKIP) && !hidden(k) && blocky(k));
  return !/^inline/.test(d);
};
const atomic = (el) => /^inline-(block|flex|grid|table)$/.test(getComputedStyle(el).display);  // a box set in a line

/* inline content: text, links as [text](url), code as `code` */
function inline(node) {
  if (node.nodeType === 3) return clean(node.textContent);
  if (node.nodeType !== 1 || node.matches(SKIP) || hidden(node)) return "";
  if (node.matches(LABELLED)) return " " + label(node) + " ";
  const inner = [...node.childNodes].map(inline).join("");
  if (node.matches("a[href]")) {
    const t = inner.trim(), u = abs(node.getAttribute("href"));
    return t && u && !/^#/.test(node.getAttribute("href")) ? `[${t.replace(/[\[\]]/g, "")}](${u})` : inner;
  }
  if (node.matches("code") && !node.closest("pre")) return inner.trim() ? "`" + inner.trim() + "`" : "";
  if (node.matches("br")) return " ";
  return atomic(node) || blocky(node) ? " " + inner + " " : inner;  // inside a cell or an item, a block is a word apart
}

const out = [];
const push = (s) => { s = s.replace(/ +$/gm, "").trim(); if (s) out.push(s); };
function table(t) {
  const rows = [...t.querySelectorAll("tr")].filter(r => !hidden(r)).map(r => [...r.children].filter(c => !hidden(c)).map(c => tidy(inline(c)).replace(/\|/g, "\\|")));
  if (!rows.length) return;
  const w = Math.max(...rows.map(r => r.length));
  const line = (r) => "| " + Array.from({ length: w }, (_, i) => r[i] || "").join(" | ") + " |";
  push([line(rows[0]), "|" + " --- |".repeat(w), ...rows.slice(1).map(line)].join("\n"));
}
function list(l, depth) {
  const lines = [];
  [...l.children].forEach((li, i) => {
    if (li.nodeType !== 1 || li.matches(SKIP) || hidden(li)) return;
    const own = [...li.childNodes].filter(n => !(n.nodeType === 1 && n.matches("ul, ol"))).map(inline).join("").trim();
    const mark = l.matches("ol") ? `${i + 1}.` : "-";
    if (tidy(own)) lines.push("  ".repeat(depth) + mark + " " + tidy(own));
    li.querySelectorAll(":scope > ul, :scope > ol").forEach(sub => lines.push(list(sub, depth + 1)));
  });
  return lines.filter(Boolean).join("\n");
}
function walk(el) {
  if (el.nodeType !== 1 || el.matches(SKIP) || hidden(el)) return;
  if (el.matches(LABELLED)) { const t = tidy(label(el)); if (t) push(t); return; }
  const tag = el.tagName.toLowerCase();
  const h = /^h([1-6])$/.exec(tag) || (el.getAttribute("role") === "heading" ? [0, el.getAttribute("aria-level") || 3] : null);
  if (h) { const t = tidy(inline(el)); if (t) push("#".repeat(+h[1]) + " " + t); return; }  // llms.py moves the levels under each page's own heading
  if (tag === "pre") { const code = el.textContent.replace(/\n+$/, ""); if (code.trim()) push("```\n" + code + "\n```"); return; }
  if (tag === "table") { table(el); return; }
  if (tag === "ul" || tag === "ol") { push(list(el, 0)); return; }
  if (tag === "blockquote") { const t = inline(el).trim(); if (t) push("> " + t); return; }
  if (tag === "figcaption") { const t = inline(el).trim(); if (t) push("_" + t + "_"); return; }
  // a block whose children are all inline is one paragraph; otherwise read its children in order, and any text
  // standing beside block children as a paragraph of its own
  const kids = [...el.childNodes];
  const hasBlock = kids.some(k => k.nodeType === 1 && !k.matches(SKIP) && !hidden(k) && blocky(k));
  if (!hasBlock) { const t = tidy(kids.map(inline).join("")); if (t) push(t); return; }
  let run = "";
  for (const k of kids) {
    if (k.nodeType === 1 && !k.matches(SKIP) && !hidden(k) && blocky(k)) { if (tidy(run)) push(tidy(run)); run = ""; walk(k); }
    else run += inline(k);
  }
  if (tidy(run)) push(tidy(run));
}
walk(root);

// a block that repeats one just before it (a label read twice, a marquee whose copy is not marked) is dropped
const md = []; for (const b of out) if (!md.slice(-4).includes(b)) md.push(b);
const meta = (n) => (document.querySelector(`meta[name="${n}"], meta[property="${n}"]`) || {}).content || "";
return {
  url: (document.querySelector('link[rel="canonical"]') || {}).href || location.href.split(/[?#]/)[0],
  title: document.title, description: meta("description") || meta("og:description"),
  md: md.join("\n\n")
};
