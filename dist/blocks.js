/* Notion's generic blocks — design "Blog Article Blocks" (2026-09-25). Linked from the SITE head,
   so it runs on every page, and driven by an observer because Super never executes a page's own
   script on a client-side navigation.

   main.css §12–13 draws the four blocks (code, table, toggle, link preview) with CSS alone; this
   file adds only what CSS cannot, all of it to the CODE BLOCK, which Super serves as plain text:

     the gutter    a line number on every line, and in a shell the prompt — "$" on a command,
                   "›" on a line continued from a trailing backslash, nothing on a comment, a
                   blank line or the body of a heredoc. Both are grey and unselectable, so a
                   selection copies the commands alone ("line 4" still means something).
     the colours   the design's four type colours, for every language: ink for commands and keys,
                   ink 700 for arguments and values, green ink for strings and variables, grey for
                   comments and punctuation. Plain text is read as log output (timestamp and level
                   grey, the message in ink 700, ERROR the one word in ink) or, when every line has
                   the same number of commas, as a CSV laid out in columns.
     the kicker    the mono line above the well: the language and a file name. The file name is
                   written in Notion as inline code at the very start of the block's caption
                   (`install.sh` Run as a user with sudo…); it is lifted out of the caption into
                   the kicker. A block whose caption does not start with one has no kicker.
     the copy tick Super's own copy button copies the code and reads "Copied" for two seconds;
                   the icon follows it.

   Nothing here writes a word: every character is the block's own. A block a page script reads
   and hides ([data-enc-source]) is left alone, and so is a Super embed (code that starts
   "super-embed:"). */
(function () {
  var SHELL = /^(bash|shell|sh|zsh|console|powershell)$/;
  var DATA = /^(json)$/;
  var CONF = /^(yaml|toml|ini)$/;
  var TEXT = /^(plain|plaintext|text|none|log)$/;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ── tokenizers: each turns one line into [[kind, text], …]; whatever a pattern does not
     claim is kept as ink 700, so no character is ever dropped ── */
  function scan(line, re, pick) {
    var out = [], last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(line))) {
      if (!m[0].length) { re.lastIndex++; continue; }
      if (m.index > last) out.push(["a", line.slice(last, m.index)]);
      pick(m, out);
      last = re.lastIndex;
    }
    if (last < line.length) out.push(["a", line.slice(last)]);
    return out;
  }

  // the file's bash rule: the command in ink, flags and arguments in ink 700, strings and
  // variables in green ink, pipes, redirects and the trailing backslash grey
  function bash(line) {
    if (/^\s*#/.test(line)) return [["c", line]];
    var first = true;
    return scan(line,
      /('[^']*'|"[^"]*")|(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?|\$\()|(\\$)|([|>])|(\s#.*$)|(\s-{1,2}[\w-]+)|([^'"$\\|>\s-][^'"$\\|>\s]*|\s+|-)/g,
      function (m, out) {
        if (m[1] || m[2]) out.push(["s", m[0]]);
        else if (m[3] || m[4]) out.push(["p", m[0]]);
        else if (m[5]) out.push(["c", m[0]]);
        else if (m[6]) out.push(["a", m[0]]);
        else if (first && /^[a-z][\w.-]*$/.test(m[0])) out.push(["b", m[0]]);
        else out.push(["a", m[0]]);
        if (/\S/.test(m[0])) first = false;
      });
  }

  // json: keys in ink, strings in green ink, numbers and literals in ink 700, braces grey
  function json(line) {
    return scan(line,
      /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b)|([{}\[\],])/g,
      function (m, out) {
        if (m[1]) { out.push([m[2] ? "b" : "s", m[1]]); if (m[2]) out.push(["p", m[2]]); }
        else if (m[3]) out.push(["a", m[3]]);
        else out.push(["p", m[4]]);
      });
  }

  // yaml / toml: the key in ink, "=" and ":" grey, a quoted value green, anything else ink 700
  function conf(line) {
    if (/^\s*#/.test(line)) return [["c", line]];
    var m = /^(\s*-?\s*)([^:#=]+?)(\s*[:=]\s*)(.*)$/.exec(line);
    if (!m) return [["a", line]];
    var out = [["p", m[1]], ["b", m[2]], ["p", m[3]]];
    var val = m[4], hash = val.indexOf(" #"), body = hash > -1 ? val.slice(0, hash) : val;
    out.push([/^\s*["'].*["']\s*$/.test(body) ? "s" : "a", body]);
    if (hash > -1) out.push(["c", val.slice(hash)]);
    return out;
  }

  // output: nothing highlighted — the timestamp and the level grey, the message ink 700
  function log(line) {
    var m = /^(\s*\d{4}-\d{2}-\d{2}[T ][\d:.,]+Z?\s*)?(\[?(?:INFO|INF|WARN|WRN|WARNING|ERROR|ERR|DEBUG|DBG)\]?\s*)?(.*)$/.exec(line);
    var out = [];
    if (m[1]) out.push(["c", m[1]]);
    if (m[2]) out.push([/ERR/.test(m[2]) ? "b" : "c", m[2]]);
    if (m[3]) out.push(["a", m[3]]);
    return out;
  }

  // any other language: comments grey, strings green ink, numbers ink 700, the rest ink
  function code(line) {
    return scan(line,
      /(\/\/.*$|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([^'"`#/\d]+|\/)/g,
      function (m, out) {
        if (m[1]) out.push(["c", m[0]]);
        else if (m[2]) out.push(["s", m[0]]);
        else if (m[3]) out.push(["a", m[0]]);
        else out.push(["b", m[0]]);
      });
  }

  /* the shell's prompt for each line: "$ " a command, "› " a continued line, blank otherwise */
  function prompts(lines) {
    var marks = [], cont = false, heredoc = null;
    lines.forEach(function (raw) {
      var t = raw.trim();
      if (heredoc) {
        marks.push("  ");
        if (t === heredoc) heredoc = null;
        return;
      }
      if (!t || /^#/.test(t)) marks.push(cont ? "› " : "  ");
      else marks.push(cont ? "› " : "$ ");
      var h = /<<-?\s*['"]?([A-Za-z_]\w*)['"]?/.exec(raw);
      if (h && !/^#/.test(t)) heredoc = h[1];
      cont = /\\\s*$/.test(raw);
    });
    return marks;
  }

  function isCsv(lines) {
    var rows = lines.filter(function (l) { return l.trim(); });
    if (rows.length < 2) return 0;
    var n = rows[0].split(",").length;
    if (n < 2) return 0;
    for (var i = 1; i < rows.length; i++) if (rows[i].split(",").length !== n) return 0;
    return n;
  }

  function spans(parent, toks) {
    toks.forEach(function (t) {
      if (!t[1]) return;
      parent.appendChild(el("span", "enc-t-" + t[0], t[1]));
    });
  }

  function langOf(pre, codeEl) {
    var cls = (codeEl.className || "") + " " + (pre.className || "");
    var m = /language-([\w#+.-]+)/.exec(cls);
    return m ? m[1].toLowerCase() : "";
  }

  function render(block, pre, codeEl, src) {
    var lang = langOf(pre, codeEl);
    var lines = src.replace(/\n$/, "").split("\n");
    var kind = SHELL.test(lang) ? "shell" : DATA.test(lang) ? "json" : CONF.test(lang) ? "conf"
      : TEXT.test(lang) || !lang ? "text" : "code";
    var cols = kind === "text" ? isCsv(lines) : 0;
    if (cols) kind = "csv";
    block.setAttribute("data-enc-code", kind);

    var frag = document.createDocumentFragment();
    if (kind === "csv") {
      block.style.setProperty("--enc-cols", cols);
      lines.filter(function (l) { return l.trim(); }).forEach(function (l, ri) {
        l.split(",").forEach(function (c) {
          var cell = el("span", ri === 0 ? "enc-csv__h" : /^\s*[\d.]+\s*$/.test(c) ? "enc-t-a" : "enc-t-s", c);
          if (ri === 1) cell.className += " enc-csv__first";
          frag.appendChild(cell);
        });
      });
    } else {
      var marks = kind === "shell" ? prompts(lines) : null;
      var width = String(lines.length).length < 2 ? 2 : String(lines.length).length;
      var tok = kind === "shell" ? bash : kind === "json" ? json : kind === "conf" ? conf
        : kind === "text" ? log : code;
      lines.forEach(function (line, i) {
        if (kind !== "text") {
          var n = String(i + 1);
          while (n.length < width) n = " " + n;
          var num = el("span", "enc-code__n", n + "  ");
          num.setAttribute("aria-hidden", "true");
          frag.appendChild(num);
          if (marks) {
            var mk = el("span", "enc-code__m", marks[i]);
            mk.setAttribute("aria-hidden", "true");
            frag.appendChild(mk);
          }
        }
        spans(frag, tok(line));
        if (i < lines.length - 1) frag.appendChild(document.createTextNode("\n"));
      });
    }
    codeEl.textContent = "";
    codeEl.appendChild(frag);
    codeEl.setAttribute("data-enc-lines", String(lines.length));
    return lang;
  }

  /* the kicker: the language and the file name the caption opens with, as inline code */
  function kicker(block, lang) {
    if (block.querySelector(":scope > .enc-code__kicker")) return;
    var cap = block.querySelector(":scope > .notion-caption");
    if (!cap) return;
    var first = null, i;
    for (i = 0; i < cap.childNodes.length; i++) {
      var n = cap.childNodes[i];
      if (n.nodeType === 3 && !n.textContent.trim()) continue;
      first = n;
      break;
    }
    while (first && first.nodeType === 1 && first.tagName !== "CODE" &&
      first.children.length === 1 && first.textContent.trim() === first.children[0].textContent.trim()) {
      first = first.children[0];
    }
    if (!first || first.nodeType !== 1 || first.tagName !== "CODE") return;
    var file = first.textContent.trim();
    if (!file) return;
    first.setAttribute("data-enc-kicker-src", "");
    var words = TEXT.test(lang) ? [file] : [lang, file];
    var k = el("span", "enc-code__kicker", words.filter(Boolean).join(" · "));
    block.insertBefore(k, block.firstChild);
    // what is left of the caption starts after the file name
    var next = first.nextSibling;
    if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^\s+/, "");
  }

  function enhance(block) {
    if (block.closest("[data-enc-source]")) return;
    var pre = block.querySelector(":scope > pre");
    var codeEl = pre && pre.querySelector("code");
    if (!codeEl) return;
    // a React re-render puts the plain text back; that is the signal to draw it again
    if (codeEl.hasAttribute("data-enc-lines") && codeEl.querySelector(".enc-t-a, .enc-t-b, .enc-t-s, .enc-t-c, .enc-t-p, .enc-code__n, .enc-csv__h")) return;
    var src = codeEl.textContent;
    if (/^\s*super-embed:/.test(src)) return;
    var lang = render(block, pre, codeEl, src);
    kicker(block, lang);
  }

  /* the copy button's tick, for as long as Super's label reads "Copied" */
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest(".notion-code__copy-button");
    if (!b) return;
    b.setAttribute("data-enc-copied", "");
    clearTimeout(b.__encT);
    b.__encT = setTimeout(function () { b.removeAttribute("data-enc-copied"); }, 2000);
  });

  function tick() {
    Array.prototype.forEach.call(document.querySelectorAll(".notion-code"), enhance);
  }

  window.encBlocks = { version: 1, tick: tick, tokens: { bash: bash, json: json, conf: conf, log: log, code: code }, prompts: prompts };

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(tick, 60); })
    .observe(document.body, { childList: true, subtree: true });
  tick();
  window.addEventListener("load", tick);
})();
