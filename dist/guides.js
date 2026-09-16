/* /guides — design "Guides Set", 6d "One question at a time". Linked from the SITE head, because
   Super never executes a page's own script on a client-side navigation.

   The page asks one sentence — "I want to stake <chain> with <wallet>." — and finishes it as the
   reader picks. Everything it knows comes from three galleries Super already renders on the page:

     Guides Database  3dde…/1f6e800a…479e   one row per chain: title, its Chain and Wallet
                                            relations, Step and Time, and the row's own page
     Networks set     block-3dde800a…33b7f1  every chain we run, and its glyph
     Wallet Set       block-3dde800a…97b664  every wallet, and its glyph

   A chain with no guide row stays in the row — dropping it would imply we do not run the chain —
   but it is not selectable: dashed, dimmed, and its name swaps to the "Guide coming" text on hover.

   The words are Notion's: the sentence (with "a chain" and "a wallet" as the two swappable spans),
   both labels, both hints, "Guide coming", "Staking guide" and the button. This file positions
   them and draws the pills; it writes no copy of its own. */
(function () {
  var BAND = "block-3dde800a5138811e906fc383bd7a0789";
  var GUIDES = "block-1f6e800a5138818195f9ed0a1403479e";
  var NETWORKS = "block-3dde800a51388133b7f1d1ccdda08038";
  var WALLETS = "block-3dde800a51388097b664fafed678f048";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function key(s) { return String(s).toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/^\d+[-_]/, "").replace(/[^a-z0-9]/g, ""); }
  function original(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : src;
  }
  /* A *linked* view of a database is its own block, with its own id — the source database's id is
     nowhere in the page — and it can be a table as well as a gallery. So the two source galleries
     are found by what they contain, not by id: of every collection on the page other than the
     guides one, the chains are whichever overlaps most with the guide rows' own names.
     An item is a gallery card or a table row; both carry the title and the glyph. */
  function itemsOf(box) {
    if (!box) return [];
    var cards = box.querySelectorAll(".notion-collection-card");
    if (cards.length) return Array.prototype.slice.call(cards);
    return Array.prototype.slice.call(box.querySelectorAll("tbody tr"));
  }
  function cardsOf(id) { return itemsOf(document.getElementById(id)); }
  function titleOf(card) {
    var t = card.querySelector(".notion-property__title");
    return t ? t.textContent.trim() : "";
  }
  function glyphOf(card) {
    var img = card.querySelector("img");
    return img ? original(img.currentSrc || img.src) : "";
  }
  function hrefOf(card) {
    var a = card.matches && card.matches("a") ? card : card.querySelector('a[href^="/"]');
    return a ? a.getAttribute("href") : null;
  }

  /* every collection on the page, as its block element */
  function collections() {
    return Array.prototype.slice.call(document.querySelectorAll(".notion-collection"))
      .map(function (c) { return c.closest("[id^=block-]") || c; })
      .filter(function (b, i, all) { return b.id !== GUIDES && all.indexOf(b) === i; });
  }
  function sources(guideKeys) {
    // a source id that is on the page but holds no items (Super can render the block as a plain
    // page link) counts as not found
    function byId(id) {
      var b = document.getElementById(id);
      return b && itemsOf(b).length ? b : null;
    }
    var known = { chains: byId(NETWORKS), wallets: byId(WALLETS) };
    if (known.chains && known.wallets) return known;
    var scored = collections().map(function (b) {
      var items = itemsOf(b);
      var hit = items.filter(function (c) { return guideKeys.indexOf(key(titleOf(c))) >= 0; }).length;
      return { box: b, items: items.length, hit: hit };
    }).filter(function (s) { return s.items; });
    scored.sort(function (a, b) { return b.hit - a.hit || b.items - a.items; });
    var chains = known.chains || (scored[0] && scored[0].box) || null;
    var wallets = known.wallets || (scored.filter(function (s) { return s.box !== chains; })[0] || {}).box || null;
    return { chains: chains, wallets: wallets };
  }

  /* A gallery card shows its relations as small chips and its numbers as text; both are read here,
     so the Guides view must show Networks set, Wallet Set, Step and Time (network.css-style CSS
     hides them). Numbers are matched by their own property class, which is stable per property. */
  function propTexts(card) {
    return Array.prototype.slice.call(card.querySelectorAll(".notion-collection-card__property"))
      .map(function (p) { return { cls: p.className, text: p.textContent.trim() }; });
  }

  function read() {
    var guideCards = cardsOf(GUIDES);
    var guideKeys = guideCards.map(function (c) { return key(titleOf(c)); });
    var src = sources(guideKeys);

    if (src.chains) src.chains.setAttribute("data-enc-source", "chains");
    if (src.wallets) src.wallets.setAttribute("data-enc-source", "wallets");

    var chains = itemsOf(src.chains).map(function (c) {
      return { name: titleOf(c), key: key(titleOf(c)), glyph: glyphOf(c) };
    }).filter(function (c) { return c.name; });

    var wallets = {};
    itemsOf(src.wallets).forEach(function (c) {
      var n = titleOf(c);
      if (n) wallets[key(n)] = { name: n, glyph: glyphOf(c) };
    });

    var guides = {};
    guideCards.forEach(function (c) {
      var title = titleOf(c);
      if (!title) return;
      var props = propTexts(c);
      var texts = props.map(function (p) { return p.text; }).filter(Boolean);
      // the wallet is whichever property text matches a wallet name; the chain is the row's own
      // name, or a property text matching a chain
      var wallet = null, chain = null, nums = [];
      texts.forEach(function (t) {
        var k = key(t);
        if (!wallet && wallets[k]) { wallet = wallets[k]; return; }
        if (!chain && chains.some(function (c2) { return c2.key === k; })) { chain = k; return; }
        if (/^\d+$/.test(t)) nums.push(parseInt(t, 10));
      });
      if (!chain) chain = key(title);
      guides[chain] = {
        title: title, wallet: wallet, href: hrefOf(c),
        steps: nums.length ? nums[0] : null, minutes: nums.length > 1 ? nums[1] : null
      };
    });
    return { chains: chains, wallets: wallets, guides: guides };
  }

  function build() {
    var band = document.getElementById(BAND);
    if (!band) return;
    var content = band.querySelector(":scope > .notion-callout__content");
    if (!content) return;
    var data = read();
    if (!data.chains.length) return;

    var sig = data.chains.length + "/" + Object.keys(data.guides).length + "/" + Object.keys(data.wallets).length;
    if (band.getAttribute("data-enc-sig") === sig && band.querySelector(".enc-guide__chains")) return;
    band.setAttribute("data-enc-sig", sig);

    // the Notion paragraphs, in the order they are written in the band
    var ps = content.querySelectorAll(":scope > p.notion-text");
    if (ps.length < 8) return;
    var sentence = ps[0], labelChain = ps[1], labelWallet = ps[2];
    var hintChain = ps[3], hintWallet = ps[4], comingText = ps[5].textContent.trim();
    var kicker = ps[6].textContent.trim(), buttonText = ps[7].textContent.trim();
    ps[5].hidden = true; ps[6].hidden = true; ps[7].hidden = true;

    // the sentence keeps its own words; the two swappable ones become spans
    if (!sentence.querySelector(".enc-guide__slot")) {
      var raw = sentence.textContent;
      var parts = raw.split(/(a chain|a wallet)/);
      sentence.textContent = "";
      parts.forEach(function (part) {
        if (part === "a chain" || part === "a wallet") {
          var s = el("span", "enc-guide__slot", part);
          s.setAttribute("data-slot", part === "a chain" ? "chain" : "wallet");
          s.setAttribute("data-default", part);
          sentence.appendChild(s);
        } else if (part) {
          sentence.appendChild(document.createTextNode(part));
        }
      });
    }
    var slotChain = sentence.querySelector('[data-slot="chain"]');
    var slotWallet = sentence.querySelector('[data-slot="wallet"]');

    var chainRow = band.querySelector(".enc-guide__chains") || el("div", "enc-guide__chains");
    var walletRow = band.querySelector(".enc-guide__wallets") || el("div", "enc-guide__wallets");
    var answer = band.querySelector(".enc-guide__answer") || el("div", "enc-guide__answer");
    chainRow.textContent = ""; walletRow.textContent = ""; answer.textContent = "";
    labelChain.after(chainRow);
    labelWallet.after(walletRow);
    hintWallet.after(answer);

    var state = { chain: null };

    function pill(name, glyph, tint, pending) {
      var b = el("button", "enc-guide__pill");
      b.type = "button";
      if (pending) {
        b.setAttribute("data-pending", "");
        b.setAttribute("aria-disabled", "true");
        b.title = comingText;
      }
      if (glyph) {
        var well = el("span", "enc-guide__well");
        if (tint) well.style.setProperty("--pill-tint", tint);
        var img = el("img");
        img.src = glyph; img.alt = ""; img.loading = "lazy";
        well.appendChild(img);
        b.appendChild(well);
      }
      b.appendChild(el("span", "enc-guide__pill-label", name));
      if (pending) b.appendChild(el("span", "enc-guide__coming", comingText));
      return b;
    }

    function paint() {
      walletRow.textContent = ""; answer.textContent = "";
      var guide = state.chain ? data.guides[state.chain.key] : null;
      slotChain.textContent = state.chain ? state.chain.name : slotChain.getAttribute("data-default");
      slotChain.toggleAttribute("data-filled", !!state.chain);
      var wallet = guide && guide.wallet;
      slotWallet.textContent = wallet ? wallet.name : slotWallet.getAttribute("data-default");
      slotWallet.toggleAttribute("data-filled", !!wallet);

      var pending = !!state.chain && !guide;
      labelWallet.hidden = !state.chain || pending;
      walletRow.hidden = labelWallet.hidden;
      hintChain.hidden = !!state.chain;
      hintWallet.hidden = !state.chain || !!guide;

      if (guide && wallet) {
        var w = pill(wallet.name, wallet.glyph, null, false);
        w.setAttribute("data-active", "");
        walletRow.appendChild(w);
        answer.appendChild(card(guide, state.chain));
      }
    }

    function card(guide, chain) {
      var a = el("a", "enc-guide__card");
      if (guide.href) a.href = guide.href;
      var top = el("span", "enc-guide__card-top");
      if (chain.glyph) {
        var g = el("img", "enc-guide__card-glyph");
        g.src = chain.glyph; g.alt = "";
        top.appendChild(g);
      }
      var head = el("span", "enc-guide__card-head");
      head.appendChild(el("span", "enc-guide__card-kicker", kicker));
      head.appendChild(el("span", "enc-guide__card-title", guide.title));
      top.appendChild(head);
      if (guide.wallet) {
        var w = el("span", "enc-guide__card-wallet");
        var badge = el("span", "enc-guide__card-badge");
        var wi = el("img");
        wi.src = guide.wallet.glyph; wi.alt = "";
        badge.appendChild(wi);
        w.appendChild(badge);
        w.appendChild(el("span", "enc-guide__card-wallet-name", guide.wallet.name));
        top.appendChild(w);
      }
      a.appendChild(top);
      var foot = el("span", "enc-guide__card-foot");
      foot.appendChild(el("span", "enc-guide__card-button", buttonText));
      var meta = el("span", "enc-guide__card-meta");
      meta.appendChild(el("span", null, (guide.steps || "—") + " steps"));
      meta.appendChild(el("span", "enc-guide__card-rule"));
      meta.appendChild(el("span", null, "about " + (guide.minutes || "—") + " min"));
      foot.appendChild(meta);
      a.appendChild(foot);
      return a;
    }

    data.chains.forEach(function (c, i) {
      var guide = data.guides[c.key];
      var b = pill(c.name, c.glyph, TINTS[i % TINTS.length], !guide);
      if (guide) {
        b.addEventListener("click", function () {
          state.chain = (state.chain && state.chain.key === c.key) ? null : c;
          Array.prototype.forEach.call(chainRow.children, function (x) { x.removeAttribute("data-active"); });
          if (state.chain) b.setAttribute("data-active", "");
          paint();
        });
      }
      chainRow.appendChild(b);
    });
    paint();
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 120); })
    .observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
