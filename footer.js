/* Site footer — design "Footer", 44b "The last ask". Linked from the SITE Head, so it runs on every page.

   Super's footer can only hold a flat list of links, social icons, a logo and a footnote, so this
   script renders the 44b layout inside footer.super-footer and main.css §16 hides Super's own
   markup. The content still comes from the Super dashboard wherever Super has a field for it:

     Footer → Menu items    each item named "Group: Label" becomes a link under that column title
                            ("Company: About" → About, in Company). A "Legal" group goes to the
                            bottom row, right. Items without a colon are grouped under "More".
     Footer → Socials       the "Social" column, as text links (the icon's title is the label)
     Footer → Footnote      the bottom row, left

   Written here, because Super has no field for them (the user's explicit choice, 2026-09-15):
     - the call to action: kicker, heading, sentence, the two buttons and their links
     - the disc band's chain glyphs (the homepage gallery is not on other pages)
     - the wordmark's link home and its pill's label
   The wordmark is the repo's svg/wordmark-reversed.svg. It links home (the user, 2026-10-25: "add a button home
   just like we have for visit on services"): over it a mouse pointer is a pill, as /services' Visit is — paper
   on the ground, ink where it covers more letter than ground.

   The disc band: eight fixed positions; each dissolves out and a different chain fades in at the
   same spot on its own period, never more than two changing at once. Reduced motion: still. */
(function () {
  var CTA = {
    kicker: "Launching a chain",
    heading: "Add us to your genesis set.",
    text: "On call for upgrades and incidents, from your first testnet onward.",
    primary: { label: "Book a call", href: "https://cal.com/aditya-encapsulate/30min", external: true },
    secondary: { label: "View networks", href: "/networks" }
  };
  var HOME = { label: "Home", href: "/" };
  var ARROW = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9L9 3"/><path d="M4.5 3H9v4.5"/></svg>';
  /* a network glyph at the size it is drawn (2026-09-29): the set's covers are 600px PNGs of 25-69KB, drawn at
     26-286px. Super's image service (/_next/image, same origin, AVIF or WebP at its one quality, 75) makes a copy
     at least twice the drawn size, so it stays sharp on a retina screen - checked side by side at 2x against the
     originals: the same picture, 3-10KB. SVGs and anything not on Super's asset host pass through as they are. */
  function sized(url, w) {
    var m = /[?&]url=([^&]+)/.exec(url || "");
    var orig = m ? decodeURIComponent(m[1]) : (url || "");
    if (!/^https:\/\/assets\.super\.so\/[^?#]+\.(png|jpe?g|webp)(?:[?#]|$)/i.test(orig)) return url;
    return "/_next/image?url=" + encodeURIComponent(orig) + "&w=" + w + "&q=75";
  }
  var ASSETS = "https://assets.super.so/d7300a44-6aa9-4b9e-a149-0076eb69ca9d/images/";
  // The ten chains the band cycles, from the "Networks set" database's own Cover uploads (the new
  // gallery, 2026-09-16). The footer runs on every page, most of which have no networks gallery to
  // read, so these are listed — replace a Cover in Notion and this list needs the new URL.
  var ROTATE = [
    "ac378c4b-276b-488a-a9dd-c98d5595ed1a/sui.png",
    "f2537cb6-7a6b-4cb4-b490-add73c3b1631/near.png",
    "b3cd811c-7df4-4ae5-9e62-16df928605ab/monad.png",
    "bbf0edd4-8eae-4f49-90ea-f2a39761cbb8/avalanche.png",
    "7a6f8cb0-d4c7-486b-8eb5-8d4f1ae8c82d/axelar.png",
    "7f3c918e-50ca-49a9-99db-c149c2b8a334/iota.png",
    "a1d5375c-1dd5-4b5b-9969-54d8d3451460/mina.png",
    "115f62b3-6961-4b9c-a3ac-ef0fe722759a/starknet.png",
    "9230f802-d866-4a13-8a5a-b966917a578f/terra.png",
    "ed3e7300-8e4b-4517-af4a-95cebfbcc14c/zilliqa.png"
  ];
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  // [left, top, size] of the eight fixed positions, from the design
  var FIELD = [[0.05, 0.10, 104], [0.17, 0.62, 76], [0.28, 0.08, 62], [0.40, 0.58, 88],
    [0.53, 0.06, 112], [0.66, 0.60, 70], [0.78, 0.10, 84], [0.90, 0.56, 58]];
  var script = document.currentScript;
  var BASE = script && /\/dist\/footer\.js/.test(script.src) ? script.src.replace(/\/dist\/footer\.js.*$/, "/") : null;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* another site, a subdomain of ours included (rgp.sui.encapsulate.xyz): a new tab */
  function offsite(href) {
    try { var u = new URL(href, location.href); } catch (e) { return false; }
    return /^https?:$/.test(u.protocol) && u.hostname.replace(/^www\./, "") !== location.hostname.replace(/^www\./, "");
  }
  function link(cls, label, href, external) {
    var a = el("a", cls, label);
    a.href = href;
    if (external || offsite(href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  // what the Super dashboard holds
  function read(footer) {
    var groups = [], byName = {}, legal = [];
    footer.querySelectorAll(".super-footer__links a").forEach(function (a) {
      var raw = a.textContent.trim(), href = a.getAttribute("href");
      if (!raw || !href) return;
      var i = raw.indexOf(":");
      var group = i > 0 ? raw.slice(0, i).trim() : "More";
      var label = i > 0 ? raw.slice(i + 1).trim() : raw;
      if (/^legal$/i.test(group)) { legal.push({ label: label, href: href }); return; }
      if (!byName[group]) { byName[group] = { title: group, items: [] }; groups.push(byName[group]); }
      byName[group].items.push({ label: label, href: href });
    });
    var socials = [];
    footer.querySelectorAll(".super-footer__icons a").forEach(function (a) {
      var t = a.querySelector("title");
      var label = (t ? t.textContent : a.getAttribute("aria-label") || "").replace(/\s*\(.*\)\s*$/, "").trim();
      if (label && a.getAttribute("href")) socials.push({ label: label, href: a.getAttribute("href") });
    });
    if (socials.length) groups.push({ title: "Social", items: socials });
    var note = footer.querySelector(".super-footer__footnote");
    return { groups: groups, legal: legal, footnote: note ? note.textContent.trim() : "" };
  }

  function band() {
    var b = el("div", "enc-foot__band");
    b.setAttribute("aria-hidden", "true");
    FIELD.forEach(function (f, i) {
      var slot = el("span", "enc-foot__disc");
      slot.style.left = f[0] * 100 + "%";
      slot.style.top = f[1] * 100 + "%";
      slot.style.width = slot.style.height = f[2] + "px";
      slot.style.background = TINTS[i % TINTS.length];
      var img = el("img");
      img.alt = "";
      img.decoding = "async";
      img.loading = "lazy";
      img.src = sized(ASSETS + ROTATE[i % ROTATE.length], 256);   // drawn at up to 101px
      slot.appendChild(img);
      slot.__pick = i;
      b.appendChild(slot);
    });
    return b;
  }

  function animate(bandEl) {
    if (reduced.matches || bandEl.__timer) return;
    var slots = Array.prototype.slice.call(bandEl.children);
    var periods = slots.map(function (_, i) { return 23 + (i * 5) % 13; });
    var phases = slots.map(function (_, i) { return (i * 7) % 23; });
    var tick = 0;
    bandEl.__timer = setInterval(function () {
      if (!document.body.contains(bandEl)) { clearInterval(bandEl.__timer); return; }
      tick++;
      var inFlight = 0;
      slots.forEach(function (s, i) {
        var at = (tick - phases[i]) % periods[i];
        if (at === 1 || at === 2) inFlight++;
        if (at === 3) {
          // swap in a chain that is not showing anywhere else
          var taken = {};
          slots.forEach(function (o, j) { if (j !== i) taken[o.__pick % ROTATE.length] = 1; });
          for (var k = 1; k <= ROTATE.length; k++) {
            if (!taken[(s.__pick + k) % ROTATE.length]) { s.__pick += k; break; }
          }
          s.firstChild.src = sized(ASSETS + ROTATE[s.__pick % ROTATE.length], 256);
          s.removeAttribute("data-fading");
        }
      });
      slots.forEach(function (s, i) {
        if ((tick - phases[i]) % periods[i] !== 0 || inFlight >= 2) return;
        s.setAttribute("data-fading", "");
        inFlight++;
      });
    }, 480);
  }

  /* the Home pill: it follows a mouse over the wordmark, and on a scroll stays under the pointer */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var home = { mark: null, img: null, pill: null, cur: null, alpha: null, w: 0, h: 0, asked: false };
  function track(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    home.cur = { x: e.clientX, y: e.clientY };
    paintHome();
  }
  function paintHome() {
    var p = home.pill, c = home.cur;
    if (!p) return;
    var r = home.img.getBoundingClientRect();
    if (!c || !fine.matches || !document.contains(p) || c.x < r.left || c.x > r.right || c.y < r.top || c.y > r.bottom) {
      p.style.visibility = "hidden";
      return;
    }
    var x = c.x - r.left, y = c.y - r.top;
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.visibility = "visible";
    p.classList.toggle("is-ink", covered(x, y, r) > 0.5);
  }
  window.addEventListener("scroll", function () { if (home.cur) paintHome(); }, { passive: true });
  /* how much of the pill's box is letter: the wordmark's alpha, drawn once at 480px wide */
  function covered(x, y, r) {
    var a = home.alpha;
    if (!a) return 0;
    var pr = home.pill.getBoundingClientRect(), sx = home.w / r.width, sy = home.h / r.height;
    var x0 = Math.max(0, Math.floor((x - pr.width / 2) * sx)), x1 = Math.min(home.w, Math.ceil((x + pr.width / 2) * sx));
    var y0 = Math.max(0, Math.floor((y - pr.height / 2) * sy)), y1 = Math.min(home.h, Math.ceil((y + pr.height / 2) * sy));
    var n = 0, on = 0;
    for (var j = y0; j < y1; j++) {
      for (var i = x0; i < x1; i++) { n++; if (a[(j * home.w + i) * 4 + 3] > 127) on++; }
    }
    return n ? on / n : 0;
  }
  /* the file has a viewBox and no size, which a canvas will not draw everywhere, so it is given its size */
  function letters(src) {
    if (home.asked) return;
    home.asked = true;
    fetch(src).then(function (res) { return res.text(); }).then(function (t) {
      var vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(t);
      if (!vb) return;
      var W = 480, H = Math.round(W * vb[2] / vb[1]);
      var url = URL.createObjectURL(new Blob([t.replace("<svg ", '<svg width="' + vb[1] + '" height="' + vb[2] + '" ')], { type: "image/svg+xml" }));
      var im = new Image();
      im.onload = function () {
        var cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        var g = cv.getContext("2d");
        g.drawImage(im, 0, 0, W, H);
        try { home.alpha = g.getImageData(0, 0, W, H).data; home.w = W; home.h = H; } catch (e) { /* a tainted canvas: paper only */ }
        URL.revokeObjectURL(url);
        paintHome();
      };
      im.src = url;
    }).catch(function () { home.asked = false; });
  }

  function build(footer) {
    var data = read(footer);
    var sig = JSON.stringify(data);
    var old = footer.querySelector(":scope > .enc-foot");
    if (old && old.getAttribute("data-sig") === sig) return;
    if (old) old.remove();

    var root = el("div", "enc-foot");
    root.setAttribute("data-sig", sig);
    var bandEl = band();
    root.appendChild(bandEl);

    var body = el("div", "enc-foot__body");
    var cta = el("div", "enc-foot__cta");
    var left = el("div", "enc-foot__ask");
    left.appendChild(el("span", "enc-foot__kicker", CTA.kicker));
    left.appendChild(el("h2", "enc-foot__heading", CTA.heading));
    left.appendChild(el("p", "enc-foot__text", CTA.text));
    var buttons = el("div", "enc-foot__buttons");
    buttons.appendChild(link("enc-foot__btn", CTA.primary.label, CTA.primary.href, CTA.primary.external));
    buttons.appendChild(link("enc-foot__btn enc-foot__btn--secondary", CTA.secondary.label, CTA.secondary.href));
    cta.appendChild(left);
    cta.appendChild(buttons);
    body.appendChild(cta);

    if (data.groups.length) {
      var nav = el("nav", "enc-foot__nav");
      nav.setAttribute("aria-label", "Footer");
      nav.style.setProperty("--enc-foot-cols", Math.min(data.groups.length, 5));
      data.groups.forEach(function (g) {
        var col = el("div", "enc-foot__col");
        col.appendChild(el("span", "enc-foot__title", g.title));
        g.items.forEach(function (it) { col.appendChild(link("enc-foot__link", it.label, it.href)); });
        nav.appendChild(col);
      });
      body.appendChild(nav);
    }

    var bottom = el("div", "enc-foot__bottom");
    bottom.appendChild(el("span", "enc-foot__note", data.footnote));
    var legal = el("span", "enc-foot__legal");
    data.legal.forEach(function (it) { legal.appendChild(link("enc-foot__mini", it.label, it.href)); });
    bottom.appendChild(legal);
    body.appendChild(bottom);
    root.appendChild(body);

    if (BASE) {
      var mark = link("enc-foot__mark", null, HOME.href);
      mark.setAttribute("aria-label", HOME.label);
      var img = el("img");
      img.src = BASE + "svg/wordmark-reversed.svg";
      img.alt = "Encapsulate";
      mark.appendChild(img);
      var pill = el("span", "enc-foot__home", HOME.label);
      pill.setAttribute("aria-hidden", "true");
      var pb = el("span", "enc-foot__badge");
      pb.innerHTML = ARROW;
      pill.appendChild(pb);
      mark.appendChild(pill);
      mark.addEventListener("pointerenter", track);
      mark.addEventListener("pointermove", track);
      mark.addEventListener("mouseleave", function () { home.cur = null; paintHome(); });
      home.mark = mark;
      home.img = img;
      home.pill = pill;
      if (fine.matches) letters(img.src);
      root.appendChild(mark);
    }

    footer.appendChild(root);
    footer.setAttribute("data-enc-footer", "");
    animate(bandEl);
  }

  function apply() {
    var footer = document.querySelector("footer.super-footer");
    if (footer) build(footer);
  }

  /* a footer not built yet — on load, or after Super renders it again — is built on the next frame,
     not once the page goes quiet: that left Super's own footer up for up to 300ms where it is in view
     (main.css §16 now hides it until the build, 2026-10-25). A later change still rebuilds. */
  var t = 0, f = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-foot"); })) return;
    clearTimeout(t); t = setTimeout(apply, 60);
    var footer = !f && document.querySelector("footer.super-footer");
    if (footer && !footer.querySelector(":scope > .enc-foot")) f = requestAnimationFrame(function () { f = 0; apply(); });
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
