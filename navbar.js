/* The navigation bar — design "Navbar 4f Page". Linked from the SITE head, so it runs on every
   page, and driven by an observer because Super never executes a page's own script on a
   client-side navigation.

   SUPER OWNS THE MENU. The bar's items, its groups and every link in them are Super's navigation
   settings, and Super's own dropdown (radix) still opens and closes them, keyboard included —
   this file adds nothing to that and takes nothing away. What it adds is the 4f panel: the row
   numbers, the line under each link, a capture of where the link goes, the page's own content
   beside it (or a note, where a page has none), and the foot. It also says which item is the
   page you are on. main.css §04 does the bar itself.

   THE THIRD COLUMN IS READ, NOT WRITTEN. The handoff's rule: it lists the page's own sub-pages or
   section headings, taken from the page as built, so it cannot drift. Each destination's page is
   fetched once per visit — only when a pointer rests on its row — parsed, and kept; see READ.

   THE WORDS. A description and a two-line note per page, and one line per group, are held in
   CONTENT below rather than in Notion — Super's navigation has a label and a URL and nothing
   else, and the bar is on every page, so there is no block to read. This is the exception
   already made for the footer's CTA and the booking drawer's copy. Everything keyed by href, so
   renaming a menu item in Super changes nothing here.

   Add a page to the menu in Super and it appears with its name and its link; give it an entry
   here and it also carries its line and its note. */
(function () {
  var CONTENT = {
    /* href: [ one line under the link, headline of the note, the note ] */
    "/networks": ["27 mainnets, 20 testnets",
      "Every chain we validate, mainnet and testnet.",
      "Reward rate where the chain publishes one; the role we played where it does not."],
    "/services": ["Dashboards, playbooks, bots, monitoring",
      "What we build and run around the validator.",
      "Dashboards, playbooks, bots and monitoring — used on our own set first."],
    "/governance-record": ["Voting principles and history",
      "How we decide a vote, and the record of every one.",
      "Read, weigh, vote, publish."],
    "/security": ["Keys, isolation, no slashing",
      "Keys, machines and the rules we hold ourselves to.",
      "First person throughout."],
    "/guides": ["Step by step, per wallet",
      "Step by step, per chain and wallet.",
      "One screen per step, with the wallet's own captures."],
    "/blog": ["What we learn running nodes",
      "What we learn running nodes.",
      "Explainers, field notes and new-network posts."],
    "/brand": ["Marks, colour, type",
      "Marks, colour and type, with the rules that bind them.",
      "Download the files; the page tells you which one goes where."],
    "/investments": ["What we back",
      "The networks and teams we have backed.",
      "Usually before mainnet, usually as an operator first."],
    "/contact-us": ["The fastest route to us",
      "Book a call, or write.",
      "A founder answers within a working day."],
    "/#block-3dbe800a513880af9fe0c4bc175e1975": ["Terms for $200k and above",
      "For treasuries, funds and foundations delegating at size.",
      "Terms, reporting and a named contact, agreed before the first delegation."],
    "/services#block-3e4e800a513881cf8a82c41c2f9f8c78": ["Live chain state, per network",
      "Live state for every chain we run, one page each.",
      "Height, peers, missed blocks and upgrade status, read from our own nodes."],
    "/services#block-3e4e800a513881719a14e42a6532c579": ["Ansible for node deploys",
      "The Ansible we use to deploy and upgrade validators.",
      "Open, versioned, and the same playbooks that run our own set."],
    "/services#block-3e4e800a513881598024c57e15cbd370": ["Proposals into your own Discord",
      "Governance proposals delivered into your Discord or Telegram.",
      "Every new proposal, with the deadline and our vote once cast."],
    "/services#block-3e4e800a51388115ac0dd17fb46b383d": ["Alerting and health checks",
      "Alerting and health checks for nodes we run and nodes we don't.",
      "Pages a person, not a dashboard."],
    "/eigen-layer": ["Restaking, as an operator",
      "What we run on EigenLayer.",
      "An operator in the staking group, with the same rules as every other set."]
  };
  /* the tertiary line at the foot of a panel, by the group's own name in Super */
  var FOOT = {
    "Networks": "See all 27",
    "Staking": "See all 27",
    "Services": "What we build for chains",
    "Practices": "Read the governance record",
    "Learn": "Read the blog",
    "Company": "Book a call",
    "About Us": "Who we are"
  };

  /* each foot line has a destination (handoff, 2026-09-24): the group's index, or — for
     "Book a call" — the booking drawer. A group not listed goes to its first page. */
  var FOOT_HREF = {
    "Networks": "/networks",
    "Staking": "/networks",
    "Services": "/services",
    "Practices": "/governance-record",
    "Learn": "/blog"
  };

  var BOOKING = "https://cal.com/aditya-encapsulate/30min";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function path(href) {
    if (!href) return "";
    return href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  }
  /* a link to a section is its own destination — "/services#block-…" is not "/services" — so the
     whole href is tried before the page it sits on */
  /* the Services sections were rebuilt on 2026-09-23 and their blocks have new ids; a menu link
     still pointing at an old one reads as the new one until it is re-pointed in Super */
  var MOVED = {
    "/services#block-4e58731953944b8d9382f545307b155b": "/services#block-3e4e800a513881cf8a82c41c2f9f8c78",
    "/services#block-3e2e800a5138816990a7da4eb111ef66": "/services#block-3e4e800a513881719a14e42a6532c579",
    "/services#block-fcf0af8817cc465192c8a50c422084d1": "/services#block-3e4e800a513881598024c57e15cbd370",
    "/services#block-58ad79b056524fd183121d379f8b08dd": "/services#block-3e4e800a51388115ac0dd17fb46b383d"
  };
  function whole(href) {
    var w = href.split("?")[0];
    return MOVED[w] || w;
  }
  function copyOf(href) {
    if (!href) return null;
    var whole_ = whole(href);
    return CONTENT[whole_] || CONTENT[path(href)] || null;
  }

  /* THE PREVIEW is a capture of where the link goes, in the repo beside the CSS so it cannot
     drift from the tag that draws it. Two kinds, as the design has them: a page's own cover
     (`cover-thumbs`, drawn cover / left center) and a tool's panel (`panel-thumbs-2x`, a true 2x
     capture drawn at 170% from its top-left corner). A destination with neither falls back to the
     design's ink tile carrying its name. Keyed by href — a section link is its own destination. */
  var COVERS = {
    "/networks": "networks", "/services": "services", "/governance-record": "governance",
    "/security": "security", "/guides": "guides", "/blog": "blog", "/brand": "brand-kit",
    "/investments": "investments", "/contact-us": "contact"
  };
  var PANELS = {
    "/#block-3dbe800a513880af9fe0c4bc175e1975": "institutional",
    "/services#block-3e4e800a513881cf8a82c41c2f9f8c78": "dashboards",
    "/services#block-3e4e800a513881719a14e42a6532c579": "playbooks",
    "/services#block-3e4e800a513881598024c57e15cbd370": "bots",
    "/services#block-3e4e800a51388115ac0dd17fb46b383d": "monitoring"
  };
  var BASE = (function () {
    var me = document.currentScript;
    var src = me && me.src;
    if (!src) {
      var all = document.querySelectorAll('script[src*="/dist/navbar.js"]');
      src = all.length ? all[all.length - 1].src : "";
    }
    return src ? src.replace(/\/dist\/navbar\.js.*$/, "/") : "";
  })();
  /* -> { src, mode } : mode "panel" is the 170% top-left draw, "cover" fills the tile */
  function shotOf(href) {
    if (!href || !BASE) return null;
    var w = whole(href);
    if (PANELS[w]) {
      return { src: BASE + "img/nav-panels/" + PANELS[w] + ".png",
        mode: PANELS[w] === "institutional" ? "cover" : "panel" };
    }
    if (w.indexOf("#") >= 0) return null;
    var key = COVERS[path(href)];
    return key ? { src: BASE + "img/nav-covers/" + key + ".png", mode: "cover" } : null;
  }

  /* the tertiary's arrow badge, the only icon the Button System allows beside a label */
  function badge() {
    var b = el("span", "enc-nav__badge");
    b.setAttribute("aria-hidden", "true");
    b.innerHTML = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor"' +
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4.25 10h11.5"/><path d="M11.25 5.5 15.75 10l-4.5 4.5"/></svg>';
    return b;
  }

  /* THE THIRD COLUMN. The handoff's rule: it lists the page's own sub-pages or section headings,
     TAKEN FROM THE PAGE AS BUILT — "nothing here is typed in, so it cannot drift" — and only a
     page with neither carries the note. So every list below is read from the page it describes:
     the page is fetched once per visit, parsed, and kept; the words, rates, marks and links are
     Notion's. While a page is on its way, or if it yields nothing, the note stands in.

       /networks            chains   the god and high tier of the Networks set, with their rates
       /services            tiles    the tools — the group's own section links, as thumbnails
       /governance-record   list     the four pillars' questions
       /security            list     the page's section headings
       /guides              guides   the first guides, chain and wallet
       /blog                posts    the latest posts
       /brand               list     the page's numbered sections
       /investments         holds    the positions, mark, name and year
       /contact-us          list     the page's four ways in
       a section link, or a page with no list   the note                                   */
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var SET = "block-3dde800a51388133b7f1d1ccdda08038";          /* the Networks set */
  var GUIDES = "block-1f6e800a5138818195f9ed0a1403479e";       /* the Guides database */
  var PILLARS = "block-10fb4619625b43cd82d572d6b806ead7";      /* Governance Mechanism */
  var PORTFOLIO = "block-807c8bde92a74f3a95bf8d798f39c02b";
  var DASHBOARDS = "block-3e4e800a51388119a5eeee126cb6b18b";   /* the Dashboards table on /services */
  var DASH_LINK = "/services#block-3e4e800a513881cf8a82c41c2f9f8c78";  /* the menu's Dashboards */
  var CONTACT = ["block-3dee800a513881cda7b7dd5b6474afca",      /* the booking band's headline */
    "block-3dee800a51388127b675dd612c34c790",                   /* "Or write to us" */
    "block-3dee800a513881b58eaedff6e0135806",                   /* the institutional fold */
    "block-3dee800a513881b28873d3148e64ddc3"];                  /* "Elsewhere" */

  var docs = {};                       /* path -> Promise<Document>, one fetch per visit */
  function pageOf(p) {
    if (!docs[p]) {
      docs[p] = fetch(p, { credentials: "same-origin" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (html) { return new DOMParser().parseFromString(html, "text/html"); })
        .catch(function () { delete docs[p]; return null; });
    }
    return docs[p];
  }

  /* ── THE COUNTS, from the Networks set itself ──────────────────────────────────────────
     Every count of networks on the site is the Networks set's own rows. /services carries the
     one view of the set that ships every stage — its cards show Stage (switched on 2026-09-24) —
     so that page is read once per visit and the counts kept in the session for half an hour:
     mainnets, testnets, and distinct chains. The navbar's own line and foot take them here;
     network.js (the count band, "+N more") and home.js ask through window.encCounts(). The
     numbers typed in Notion and in CONTENT/FOOT are only what shows if this cannot run. */
  var COUNTS_PAGE = "/services", countsOnce = null;
  function readCounts(doc) {
    var best = null;
    Array.prototype.forEach.call(doc.querySelectorAll(".notion-collection"), function (coll) {
      var m = 0, t = 0, names = {}, glyphs = {};
      Array.prototype.forEach.call(coll.querySelectorAll(".notion-collection-card, tbody tr"), function (it) {
        var stage = "";
        Array.prototype.forEach.call(it.querySelectorAll(".notion-pill, td"), function (x) {
          var v = (x.textContent || "").trim();
          if (!stage && (v === "Mainnet" || v === "Testnet")) stage = v;
        });
        if (!stage) return;
        if (stage === "Mainnet") m++; else t++;
        var n = it.querySelector(".notion-property__title");
        if (n) names[n.textContent.trim()] = 1;
        var f = it.querySelector("[data-full-size]");
        if (n && f && !glyphs[keyOfName(n.textContent)]) glyphs[keyOfName(n.textContent)] = f.getAttribute("data-full-size");
      });
      if (m + t && (!best || m + t > best.mainnet + best.testnet)) {
        best = { mainnet: m, testnet: t, chains: Object.keys(names).length, glyphs: glyphs };
      }
    });
    return best;
  }
  function counts() {
    if (countsOnce) return countsOnce;
    try {
      var kept = JSON.parse(sessionStorage.getItem("enc-counts") || "null");
      /* a count kept before the glyphs were collected (v7) is read again */
      if (kept && kept.glyphs && Date.now() - kept.at < 1800000) return (countsOnce = Promise.resolve(kept));
    } catch (e) { /* storage blocked: read the page */ }
    countsOnce = pageOf(COUNTS_PAGE).then(function (doc) {
      var c = doc ? readCounts(doc) : null;
      if (!c) return null;   /* Notion's numbers stand for this visit; no retry on every tick */
      c.at = Date.now();
      try { sessionStorage.setItem("enc-counts", JSON.stringify(c)); } catch (e) { /* fine */ }
      return c;
    });
    return countsOnce;
  }
  window.encCounts = counts;

  /* the Networks group's own words: the line under "All networks", the preview's line, the foot */
  function applyCounts(c) {
    if (!c) return;
    var line = c.mainnet + " mainnets, " + c.testnet + " testnets";
    if (CONTENT["/networks"]) CONTENT["/networks"][0] = line;
    FOOT.Networks = FOOT.Staking = "See all " + c.mainnet;
    all(document, "a.super-navbar__list-item").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.indexOf("#") >= 0 || path(href) !== "/networks") return;
      var d = a.querySelector(".enc-nav__desc");
      if (d && d.textContent !== line) d.textContent = line;
    });
    all(document, ".enc-nav__line-desc, .enc-sheet__line").forEach(function (d) {
      if (/^\d+ mainnets, \d+ testnets$/.test(d.textContent.trim()) && d.textContent !== line) d.textContent = line;
    });
    all(document, ".enc-nav__foot .enc-nav__open > span").forEach(function (sp) {
      if (/^See all \d+$/.test(sp.textContent.trim()) && sp.textContent !== "See all " + c.mainnet) {
        sp.textContent = "See all " + c.mainnet;
      }
    });
  }

  function originalSrc(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : (src || "");
  }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function titleOf(card) {
    var t = card.querySelector(".notion-property__title");
    return t ? t.textContent.trim() : "";
  }
  function propsOf(card) {
    return all(card, ".notion-collection-card__property")
      .filter(function (p) { return !p.classList.contains("notion-property__title"); })
      .map(function (p) { return p.textContent.trim(); })
      .filter(Boolean);
  }
  function linkOf(card) {
    var a = card.matches("a[href]") ? card : (card.querySelector("a[href]") || card.closest("a[href]"));
    return a ? a.getAttribute("href") : "";
  }
  /* "Gravity Bridge" → "gravitybridge", the key covers.js publishes its glyphs under */
  function keyOfName(text) { return String(text || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function glyphOf(card) {
    var img = card.querySelector("img");
    return img ? originalSrc(img.getAttribute("src")) : "";
  }

  var READ = {
    "/networks": function (doc) {
      var db = doc.getElementById(SET);
      /* twenty-one: seven rows of three fill the column beside a 520px preview (handoff,
         2026-09-24); the column clips whatever does not fit */
      return (db ? all(db, ".notion-collection-card") : []).slice(0, 21).map(function (c) {
        var rate = c.querySelector(".property-597e3d69");
        return { name: titleOf(c), rate: rate ? rate.textContent.trim() : "",
          glyph: glyphOf(c), href: linkOf(c) || "/networks" };
      }).filter(function (r) { return r.name; });
    },
    /* the latest votes (handoff, 2026-09-24): the record's own table, newest first — the chain,
       the proposal's reference, our vote and the day. Columns are found by their header labels,
       as governance.js finds them, and the glyph comes from the set (counts) or covers.js. */
    "/governance-record": function (doc, extra) {
      var table = doc.querySelector("table.notion-collection-table");
      if (!table) return [];
      var heads = all(table, "thead th").map(function (th) { return th.textContent.trim().toLowerCase(); });
      var at = function (names) {
        for (var i = 0; i < names.length; i++) { var k = heads.indexOf(names[i]); if (k >= 0) return k; }
        return -1;
      };
      var cNet = at(["network", "chain"]), cRef = at(["reference", "proposal id"]),
        cVote = at(["our vote", "vote option"]), cDate = at(["voted on"]);
      var glyphs = (extra && extra.glyphs) || {};
      var more = typeof window.encGlyphs === "function" ? window.encGlyphs() : {};
      var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return all(table, "tbody tr").map(function (tr) {
        var cell = function (i) { return i < 0 || !tr.children[i] ? "" : tr.children[i].textContent.trim(); };
        var net = cell(cNet), ref = cell(cRef), vote = cell(cVote), when = new Date(cell(cDate));
        if (!net || isNaN(when)) return null;
        var v = vote.toLowerCase();
        return {
          id: ref ? net + " · " + ref : net,
          vote: /veto/.test(v) ? "No with veto" : /^no/.test(v) ? "No" : /^abst/.test(v) ? "Abstain" : /^yes/.test(v) ? "Yes" : vote,
          date: MON[when.getMonth()] + " " + when.getDate(),
          t: when.getTime(),
          glyph: glyphs[keyOfName(net)] || more[keyOfName(net)] || "",
          href: "/governance-record"
        };
      }).filter(Boolean).sort(function (a, b) { return b.t - a.t; }).slice(0, 6);
    },
    "/security": function (doc) {
      return all(doc, ".notion-root h2.notion-heading").slice(0, 4).map(function (h) {
        return { text: h.textContent.trim(), href: "/security" + (h.id ? "#" + h.id : "") };
      });
    },
    "/brand": function (doc) {
      /* the rail's own numbers: "01 · The marks" -> The marks */
      return all(doc, ".notion-root p.notion-text").map(function (p) {
        var m = /^\d\d\s*[·.\-]\s*(.+)$/.exec(p.textContent.trim());
        return m ? { text: m[1], href: "/brand" + (p.id ? "#" + p.id : "") } : null;
      }).filter(Boolean).slice(0, 4);
    },
    "/contact-us": function (doc) {
      return CONTACT.map(function (id) {
        var n = doc.getElementById(id);
        if (!n) return null;
        var label = n.querySelector("summary") || n;
        /* a fold's summary runs on past a middle dot into its own note; the name is what is before */
        var text = label.textContent.replace(/^[‣▸▶\s]+/, "").split(" · ")[0].trim();
        return text ? { text: text, href: "/contact-us#" + id } : null;
      }).filter(Boolean);
    },
    "/guides": function (doc) {
      var db = doc.getElementById(GUIDES);
      /* the chain marks are on the same page, in the set the picker reads: name -> glyph */
      var marks = {};
      all(doc, ".notion-collection-card").forEach(function (c) {
        if (db && db.contains(c)) return;
        var n = titleOf(c), g = glyphOf(c);
        if (n && g && !marks[n.toLowerCase()]) marks[n.toLowerCase()] = g;
      });
      return (db ? all(db, ".notion-collection-card") : []).slice(0, 7).map(function (c) {
        var title = titleOf(c);
        var texts = propsOf(c).filter(function (t) { return !/^\d+$/.test(t); });
        var chain = texts.filter(function (t) { return marks[t.toLowerCase()]; })[0] ||
          (marks[title.toLowerCase()] ? title : "");
        var wallet = texts.filter(function (t) { return t !== chain; })[0] || "";
        return { name: chain || title, wallet: wallet,
          glyph: marks[(chain || title).toLowerCase()] || "", href: linkOf(c) || "/guides" };
      }).filter(function (r) { return r.name; });
    },
    "/blog": function (doc) {
      return all(doc, ".notion-collection-card").slice(0, 4).map(function (c) {
        var pill = c.querySelector(".notion-pill");
        return { name: titleOf(c), tag: pill ? pill.textContent.trim() : "",
          glyph: glyphOf(c), href: linkOf(c) || "/blog" };
      }).filter(function (r) { return r.name; });
    },
    "/investments": function (doc) {
      var db = doc.getElementById(PORTFOLIO);
      return (db ? all(db, ".notion-collection-card") : []).map(function (c) {
        var year = propsOf(c).filter(function (t) { return /^(19|20)\d\d$/.test(t); })[0] || "";
        return { name: titleOf(c), since: year, glyph: glyphOf(c), href: linkOf(c) || "/investments" };
      }).filter(function (r) { return r.name; });
    }
  };
  /* Dashboards — "Live now": one line per dashboard, from the Dashboards table on /services, in
     its Order. The line is the row's Menu property ("Sui RGP dashboard"), the link its Link. */
  READ[DASH_LINK] = function (doc) {
    var t = doc.getElementById(DASHBOARDS);
    var table = t && t.querySelector("table");
    if (!table) return [];
    var heads = all(table, "thead th").map(function (th) { return th.textContent.trim().toLowerCase(); });
    var col = function (name) { return heads.indexOf(name); };
    return all(table, "tbody tr").map(function (tr) {
      var cell = function (name) { var i = col(name); return i < 0 ? null : tr.children[i]; };
      var menu = cell("menu"), nm = cell("name"), ln = cell("link"), ord = cell("order");
      var a = ln && ln.querySelector("a[href]");
      return { text: ((menu && menu.textContent.trim()) || (nm && nm.textContent.trim()) || ""),
        href: a ? a.getAttribute("href") : DASH_LINK,
        order: ord ? parseFloat(ord.textContent) : NaN };
    }).filter(function (r) { return r.text; }).sort(function (a, b) {
      return (isNaN(a.order) ? 1e9 : a.order) - (isNaN(b.order) ? 1e9 : b.order);
    });
  };
  var KIND = { "/networks": "chains", "/governance-record": "votes", "/security": "list",
    "/brand": "list", "/contact-us": "list", "/guides": "guides", "/blog": "posts",
    "/investments": "holds", "/services": "tiles" };
  KIND[DASH_LINK] = "list";

  function outward(a, href) {
    a.href = href || "#";
    if (/^https?:\/\//.test(href || "") && href.indexOf(location.host) < 0) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }
  function well(glyph, i) {
    var w = el("span", "enc-nav__well");
    w.style.background = TINTS[i % TINTS.length];
    if (glyph) {
      var img = el("img");
      img.src = glyph;
      img.alt = "";
      img.loading = "lazy";
      w.appendChild(img);
    }
    return w;
  }

  var DRAW = {
    chains: function (box, rows) {
      rows.forEach(function (c, i) {
        var row = outward(el("a", "enc-nav__row enc-nav__row--mark"), c.href);
        row.setAttribute("aria-label", c.name);
        row.appendChild(well(c.glyph, i));
        row.appendChild(el("span", "enc-nav__row-name", c.name));
        var rate = el("span", "enc-nav__row-fig", c.rate || "—");
        if (c.rate) rate.setAttribute("data-enc-rate", "");
        row.appendChild(rate);
        box.appendChild(row);
      });
    },
    holds: function (box, rows) {
      rows.forEach(function (c, i) {
        var row = outward(el("a", "enc-nav__row enc-nav__row--mark"), c.href);
        row.appendChild(well(c.glyph, i));
        row.appendChild(el("span", "enc-nav__row-name", c.name));
        row.appendChild(el("span", "enc-nav__row-fig", c.since));
        box.appendChild(row);
      });
    },
    list: function (box, rows) {
      rows.forEach(function (r, i) {
        var row = outward(el("a", "enc-nav__row enc-nav__row--line"), r.href);
        row.appendChild(el("span", "enc-nav__n", (i < 9 ? "0" : "") + (i + 1)));
        row.appendChild(el("span", "enc-nav__row-text", r.text));
        box.appendChild(row);
      });
    },
    guides: function (box, rows) {
      rows.forEach(function (g, i) {
        var row = outward(el("a", "enc-nav__row enc-nav__row--guide"), g.href);
        row.appendChild(well(g.glyph, i));
        row.appendChild(el("span", "enc-nav__row-title", g.name));
        if (g.wallet) row.appendChild(el("span", "enc-nav__row-tag", g.wallet));
        box.appendChild(row);
      });
    },
    posts: function (box, rows) {
      rows.forEach(function (p) {
        var row = outward(el("a", "enc-nav__row enc-nav__row--post"), p.href);
        var thumb = el("span", "enc-nav__thumb");
        if (p.glyph) {
          var img = el("img");
          img.src = p.glyph;
          img.alt = "";
          img.loading = "lazy";
          thumb.appendChild(img);
        }
        var text = el("span", "enc-nav__row-stack");
        text.appendChild(el("span", "enc-nav__row-head", p.name));
        if (p.tag) text.appendChild(el("span", "enc-nav__row-tag", p.tag));
        row.appendChild(thumb);
        row.appendChild(text);
        box.appendChild(row);
      });
    },
    /* a vote: the chain's mark, "Terra · 4851", the vote as a dot (green yes, ink no, hollow
       abstain) and its word, and the day */
    votes: function (box, rows) {
      rows.forEach(function (v, i) {
        var row = outward(el("a", "enc-nav__row enc-nav__row--vote"), v.href);
        var w = well(v.glyph, i);
        w.classList.add("enc-nav__well--small");
        row.appendChild(w);
        row.appendChild(el("span", "enc-nav__vote-id", v.id));
        var o = el("span", "enc-nav__vote");
        var dot = el("span", "enc-nav__vote-dot");
        dot.setAttribute("data-enc-vote", /veto|^no/i.test(v.vote) ? "no" : /abst/i.test(v.vote) ? "abstain" : /^yes/i.test(v.vote) ? "yes" : "other");
        o.appendChild(dot);
        o.appendChild(el("span", "enc-nav__vote-word", v.vote));
        row.appendChild(o);
        row.appendChild(el("span", "enc-nav__vote-date", v.date));
        box.appendChild(row);
      });
    },
    tiles: function (box, rows) {
      rows.forEach(function (t) {
        var a = outward(el("a", "enc-nav__preview enc-nav__preview--tile"), t.href);
        var tile = el("span", "enc-nav__tile");
        tile.setAttribute("data-enc-shot", "panel");
        var img = el("img");
        img.src = t.src;
        img.alt = "";
        img.loading = "lazy";
        tile.appendChild(img);
        a.appendChild(tile);
        a.appendChild(el("span", "enc-nav__tile-label", t.name));
        box.appendChild(a);
      });
    }
  };

  /* which of Super's groups this panel belongs to: radix ties trigger and content by id */
  function groupOf(panel) {
    var key = (panel.id || "").replace(/^.*-content-/, "");
    var trigger = key ? document.querySelector('[aria-controls$="' + key + '"]') : null;
    return trigger ? trigger.textContent.trim() : "";
  }

  /* One panel. Super gives the column of links; the rest of the 4f grid is built around it, and
     the preview and the third column follow whichever link the pointer is on. */
  function build(panel) {
    if (panel.getAttribute("data-enc-nav") === "3") return;
    var column = panel.querySelector(".super-navbar__list-content-column");
    if (!column) return;
    var links = all(column, "a.super-navbar__list-item");
    if (!links.length) return;
    panel.setAttribute("data-enc-nav", "3");

    var grid = el("div", "enc-nav__grid");
    panel.insertBefore(grid, panel.firstChild);
    grid.appendChild(column);

    // 01, 02 … and the line under each link, from its href
    links.forEach(function (a, i) {
      if (a.querySelector(".enc-nav__n")) return;
      var name = a.textContent.trim();
      var text = el("span", "enc-nav__text");
      text.appendChild(el("span", "enc-nav__title", name));
      var c = copyOf(a.getAttribute("href"));
      if (c) text.appendChild(el("span", "enc-nav__desc", c[0]));
      var icon = a.querySelector(".super-navbar__list-item-icon");
      a.textContent = "";
      if (icon) a.appendChild(icon);
      a.appendChild(el("span", "enc-nav__n", (i < 9 ? "0" : "") + (i + 1)));
      a.appendChild(text);
      a.setAttribute("data-enc-name", name);
    });

    // the preview: the destination, in the panel's middle column
    var preview = el("a", "enc-nav__preview");
    var tile = el("span", "enc-nav__tile");
    var tileImg = el("img");
    tileImg.alt = "";
    var tileName = el("span", "enc-nav__tile-name");
    tile.appendChild(tileImg);
    tile.appendChild(tileName);
    var line = el("span", "enc-nav__line");
    var lineName = el("span", "enc-nav__line-name");
    var lineDesc = el("span", "enc-nav__line-desc");
    line.appendChild(lineName);
    line.appendChild(lineDesc);
    preview.appendChild(tile);
    preview.appendChild(line);
    grid.appendChild(preview);

    // the third column: the page's own content, or the note
    var third = el("div", "enc-nav__third");
    var extra = el("div", "enc-nav__extra");
    var about = el("div", "enc-nav__about");
    var aboutHead = el("span", "enc-nav__about-head");
    var aboutText = el("span", "enc-nav__about-text");
    var open = el("a", "enc-nav__open");
    var openLabel = el("span", null, "");
    open.appendChild(openLabel);
    open.appendChild(badge());
    about.appendChild(aboutHead);
    about.appendChild(aboutText);
    about.appendChild(open);
    third.appendChild(extra);
    third.appendChild(about);
    grid.appendChild(third);

    // the foot: the group's own line, and how many pages are in it
    var group = groupOf(panel);
    var foot = el("div", "enc-nav__foot");
    var footLink = el("a", "enc-nav__open");
    footLink.appendChild(el("span", null,
      FOOT[group] || ("Open " + (group || "the menu").toLowerCase())));
    footLink.appendChild(badge());
    /* "Book a call" is the booking link, which booking.js opens in the drawer; the others go to
       their group's index, or the group's first page */
    outward(footLink, /book a call/i.test(FOOT[group] || "") ? BOOKING
      : (FOOT_HREF[group] || links[0].getAttribute("href") || "#"));
    foot.appendChild(footLink);
    foot.appendChild(el("span", "enc-nav__count",
      links.length + (links.length === 1 ? " page" : " pages")));
    panel.appendChild(foot);
    /* a panel that carries the Networks page takes its counts from the set */
    if (links.some(function (a) {
      var h = a.getAttribute("href") || "";
      return h.indexOf("#") < 0 && path(h) === "/networks";
    })) counts().then(applyCounts);

    /* the tools of a group are its own section links that have a panel capture.
       TODO (2026-09-22): when /services is redesigned, read them from the page by block id like
       every other row in READ — the tools database on the page, its names, links and captures —
       instead of from the menu's own links, so the column cannot drift from the page. */
    var tools = links.map(function (a) {
      var href = a.getAttribute("href") || "";
      var shot = shotOf(href);
      return shot && shot.mode === "panel"
        ? { name: a.getAttribute("data-enc-name"), href: href, src: shot.src } : null;
    }).filter(Boolean);

    var current = null, timer = 0;

    function fill(href) {
      var bare = whole(href || "");
      var key = bare.indexOf("#") >= 0 ? bare : path(href);
      var kind = KIND[key];
      var page = path(href);
      extra.textContent = "";
      extra.removeAttribute("data-enc-kind");
      third.removeAttribute("data-enc-filled");
      if (!kind) return;
      if (kind === "tiles") {
        if (!tools.length) return;
        extra.setAttribute("data-enc-kind", "tiles");
        DRAW.tiles(extra, tools);
        third.setAttribute("data-enc-filled", "");
        return;
      }
      /* a pointer passing over the row does not fetch a page; one that rests on it does */
      clearTimeout(timer);
      timer = setTimeout(function () {
        Promise.all([pageOf(page), kind === "votes" ? counts() : null]).then(function (got) {
          var doc = got[0];
          if (!doc || current !== href) return;
          var rows = [];
          try { rows = READ[key](doc, got[1]) || []; } catch (e) { rows = []; }
          if (!rows.length) return;               // the note stands
          extra.textContent = "";
          extra.setAttribute("data-enc-kind", kind);
          DRAW[kind](extra, rows);
          third.setAttribute("data-enc-filled", "");
        });
      }, docs[page] ? 0 : 220);
    }

    function show(a) {
      var name = a.getAttribute("data-enc-name") || a.textContent.trim();
      var href = a.getAttribute("href") || "#";
      if (current === href) return;
      current = href;
      var c = copyOf(href);
      var shot = shotOf(href);
      if (shot) {
        tileImg.src = shot.src;
        tile.setAttribute("data-enc-shot", shot.mode);
      } else {
        tileImg.removeAttribute("src");
        tile.removeAttribute("data-enc-shot");
      }
      tileName.textContent = name;
      lineName.textContent = name;
      lineDesc.textContent = c ? c[0] : "";
      aboutHead.textContent = c ? c[1] : name;
      aboutText.textContent = c ? c[2] : "";
      openLabel.textContent = "Open " + name.toLowerCase();
      outward(open, href);
      outward(preview, href);
      links.forEach(function (x) { x.removeAttribute("data-enc-on"); });
      a.setAttribute("data-enc-on", "");
      fill(href);
    }
    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () { show(a); });
      a.addEventListener("focus", function () { show(a); });
    });
    show(links[0]);
  }

  /* WHICH ITEM IS THE PAGE YOU ARE ON. The design gives it paper, a ring and the highlight. Super
     marks a plain link `.active`, but every item here is a group, and a group is current when the
     page is one of its own links — which only Super knows. Its panels mount when they first open,
     so the groups are harvested once, with the viewport hidden, rather than listing them here and
     letting the code drift from the menu. */
  var groups = {};          /* the group's uuid (its trigger's aria-controls) -> [paths] */
  var harvested = false;

  function triggersOf() {
    return Array.prototype.slice.call(
      document.querySelectorAll("nav.super-navbar .super-navbar__list"));
  }
  /* keyed by the menu item's own uuid: radix's element ids change when React re-renders after
     hydration ("_R_b59…_" at load, "_r_0_" after), so a map keyed by id stopped matching and the
     current page was never marked */
  function keyOf(trigger) {
    return (trigger.getAttribute("aria-controls") || "").replace(/^.*-content-/, "") ||
      trigger.textContent.trim();
  }
  function panelFor(trigger) {
    var key = (trigger.getAttribute("aria-controls") || "").replace(/^.*-content-/, "");
    return key ? document.querySelector('[id$="-content-' + key + '"]') : null;
  }
  function record(trigger) {
    var panel = panelFor(trigger);
    if (!panel) return false;
    var links = panel.querySelectorAll("a[href]");
    if (!links.length) return false;
    var paths = [];
    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "/" && href.indexOf("#") < 0) paths.push(path(href));
    });
    groups[keyOf(trigger)] = paths;
    return true;
  }

  function markCurrent() {
    var here = path(location.pathname);
    triggersOf().forEach(function (t) {
      var paths = groups[keyOf(t)] || [];
      var on = paths.some(function (p) {
        return p === here || (p !== "/" && here.indexOf(p + "/") === 0);
      });
      if (on) t.setAttribute("data-enc-current", "");
      else t.removeAttribute("data-enc-current");
    });
  }

  /* Radix answers a pointer event only when it came from a mouse (`whenMouse`: pointerType
     === "mouse"), and a PointerEvent built without one reports "" (2026-09-23). band() uses these
     to hold an open panel open across the bar's gaps. */
  function mouse(type) {
    return new PointerEvent(type, { bubbles: true, pointerType: "mouse" });
  }

  /* WHICH LINKS EACH GROUP HOLDS — read from Super's own data, not by opening the menu.
     Super embeds the whole navbar configuration in the page's inline data scripts: every group as
     {"id": <uuid>, "type": "list", "label": …, "list": [ {…, "link": "/networks"}, … ]} — its
     quotes escaped once in the HTML and three deep in the browser's script text, so every run of
     backslashes before a quote is dropped before it is read — and that
     uuid is the one radix puts in the group's trigger (`aria-controls="…-content-<uuid>"`). So the
     groups are known on the first tick, on every page, without a single synthetic event.

     Until 2026-09-23 they were harvested by opening each group behind a hidden viewport. That
     held each trigger for 90ms — shorter than radix's open delay — so nothing mounted, the harvest
     retried twenty-five times over the first half minute, and its enters and leaves fought the
     reader's own pointer: pointing at Services opened Company, the last group it had touched
     (reproduced in headless Chrome with real mouse events; with the harvest off, Services opened
     Services). The current page's mark never appeared either. */
  /* the group's own entry in Super's data -> { label, body }: its name, and its list of links as
     plain JSON text */
  function listOf(text, key) {
    var at = text.indexOf(key);
    while (at >= 0) {
      if (/^[0-9a-f-]+","type":"list"/.test(text.slice(at, at + 300).replace(/\\+"/g, '"'))) break;
      at = text.indexOf(key, at + key.length);
    }
    if (at < 0) return null;
    var head = text.slice(at, at + 300).replace(/\\+"/g, '"');
    var open = text.indexOf("[", text.indexOf("list", text.indexOf("label", at)));
    if (open < 0) return null;
    var depth = 0, end = -1, i;
    for (i = open; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === "[") depth++;
      else if (ch === "]") { depth--; if (!depth) { end = i; break; } }
    }
    if (end < 0) return null;
    return { label: unicode((/"label":"([^"]*)"/.exec(head) || [])[1]),
      body: text.slice(open, end + 1).replace(/\\+"/g, '"') };
  }
  function unicode(s) {
    return String(s || "").replace(/\\+u([0-9a-fA-F]{4})/g, function (m, h) {
      return String.fromCharCode(parseInt(h, 16));
    });
  }
  function linksOf(text, key) {
    var l = listOf(text, key);
    if (!l) return null;
    var links = [], m, re = /"link":"([^"]*)"/g;
    while ((m = re.exec(l.body))) links.push(m[1]);
    return links;
  }
  /* the same entry as the compact sheet reads it: each page's name, its link, and the
     description Super holds for it (empty unless one is set in Super → Navigation) */
  function pagesOf(text, key) {
    var l = listOf(text, key);
    if (!l) return null;
    var items = [], m,
      re = /"label":"([^"]*)","link":"([^"]*)"(?:[^{}\[\]]*?"description":"([^"]*)")?/g;
    while ((m = re.exec(l.body))) items.push({ label: unicode(m[1]), href: m[2], desc: unicode(m[3]) });
    return { label: l.label, items: items };
  }

  var harvestTries = 0;
  function harvest() {
    if (harvested || harvestTries >= 20) return;
    var triggers = triggersOf();
    if (!triggers.length) return;
    harvestTries++;
    var text = Array.prototype.map.call(document.querySelectorAll("script:not([src])"),
      function (sc) { return sc.textContent; }).join("\n");
    var found = 0, sheetGroups = [];
    triggers.forEach(function (t) {
      var key = (t.getAttribute("aria-controls") || "").replace(/^.*-content-/, "");
      var links = key ? linksOf(text, key) : null;
      if (!links || !links.length) return;
      /* a section link is not its page: "Institutional staking" is /#block-… on the homepage,
         which marked Networks as the page you are on when you were on the homepage */
      groups[keyOf(t)] = links.filter(function (h) {
        return h.charAt(0) === "/" && h.indexOf("#") < 0;
      }).map(path);
      var g = pagesOf(text, key);
      if (g && g.items.length) sheetGroups.push({ label: g.label || t.textContent.trim(), items: g.items });
      found++;
    });
    if (found) {
      harvested = true;
      menu = sheetGroups;
      markCurrent();
    }
  }

  /* ── ink or paper under the bar ──────────────────────────────────────────────────────────
     The bar lies over whatever the page opens with, so its labels have to read against that —
     ink on a blog post's head, on a guide's head, on any future band. It was keyed off Super's
     `parent-page__blog` class, which is why the guide page kept the paper bar over its ink head
     (2026-09-23). It is measured now: the ground under the bar's own line, walked up until an
     element paints something, and its luminance decides. The bar scrolls away with the page, so
     the top of the page is the only place this is asked. */
  /* anything fixed over the page — the booking drawer, the compact sheet — is not its ground. The
     drawer's ink half lay under the bar's line while it was open, the bar was marked ink, and it
     stayed ink after the drawer closed: the reversed wordmark on a paper cover (2026-09-25) */
  function overlay(n) {
    for (; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      if (getComputedStyle(n).position === "fixed") return true;
    }
    return false;
  }
  function groundUnder() {
    var bar = document.querySelector("nav.super-navbar");
    if (!bar) return "";
    var r = bar.getBoundingClientRect();
    /* elementsFromPoint, not elementFromPoint: the bar itself is the topmost thing at its own
       line, and walking up from it leaves its subtree without ever reaching what is under it */
    var stack = document.elementsFromPoint
      ? document.elementsFromPoint(Math.max(8, r.left + 24), r.bottom + 8)
      : [document.elementFromPoint(Math.max(8, r.left + 24), r.bottom + 8)];
    var n = null, i;
    for (i = 0; i < stack.length; i++) {
      if (stack[i] && !bar.contains(stack[i]) && !overlay(stack[i])) { n = stack[i]; break; }
    }
    while (n && n !== document.documentElement) {
      if (bar.contains(n)) { n = n.parentElement; continue; }
      var bg = getComputedStyle(n).backgroundColor;
      var m = /rgba?\(([^)]+)\)/.exec(bg);
      if (m) {
        var v = m[1].split(",").map(parseFloat);
        if ((v[3] == null || v[3] > 0.4)) return bg;
      }
      n = n.parentElement;
    }
    return "";
  }
  function isInk(colour) {
    var m = /rgba?\(([^)]+)\)/.exec(colour || "");
    if (!m) return false;
    var v = m[1].split(",").map(parseFloat);
    return (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) < 128;
  }
  var WORDMARK = BASE ? BASE + "svg/wordmark-reversed.svg" : "";
  /* the reversed wordmark is a drawing of its own, not Super's logo turned inside out by a
     filter — the user's file, so the mark on ink is the brand's own (2026-09-23). It is worn
     only while the bar is actually on ink: the moment a menu opens the bar takes its paper
     ground, and a paper mark on paper is invisible (reported the same day). */
  function wearWordmark(on) {
    var bar = document.querySelector("nav.super-navbar");
    var img = bar && bar.querySelector(".super-navbar__logo img");
    if (!img || !WORDMARK) return;
    if (on) {
      if (!img.hasAttribute("data-enc-logo")) img.setAttribute("data-enc-logo", img.src);
      if (img.src !== WORDMARK) img.src = WORDMARK;
      img.removeAttribute("srcset");
    } else if (img.hasAttribute("data-enc-logo")) {
      img.src = img.getAttribute("data-enc-logo");
      img.removeAttribute("data-enc-logo");
    }
  }
  function ground() {
    var bar = document.querySelector("nav.super-navbar");
    /* with the compact sheet open, what lies under the bar is the sheet's own ink rail */
    if (!bar || window.scrollY > 8 || sheetOpen()) return;
    var ink = isInk(groundUnder());
    if (ink) bar.setAttribute("data-enc-nav-ink", "");
    else bar.removeAttribute("data-enc-nav-ink");
    wearWordmark(ink && !bar.hasAttribute("data-enc-nav-open"));
  }

  /* the bar takes its paper ground only while a menu is open — over a cover it is otherwise
     transparent, which is the whole point of 4f. "Open" is the file's own: a group under the
     pointer counts from the moment the pointer arrives (`open = hov is a group`), not from when
     radix mounts the panel ~200ms later. Until 2026-09-25 the ink bar spent those 200ms lit the
     at-rest way — a paper pill under the pointer — and then flipped to the paper bar and its ink
     tab, with the reversed wordmark on paper in between (reported on ink pages). */
  function paint() {
    var bar = document.querySelector("nav.super-navbar");
    if (!bar) return;
    var open = !!bar.querySelector('.super-navbar__list[data-state="open"], ' +
      '.super-navbar__list[aria-expanded="true"], .super-navbar__list:hover, ' +
      '.super-navbar__item-list .super-navbar__item:hover');
    /* the mark is settled on every tick, not only when the open state changes here: another
       instance of this script may have set the attribute first (an older build left running on
       the page), and then this one would return before the mark was put right */
    wearWordmark(!open && bar.hasAttribute("data-enc-nav-ink"));
    if (open === bar.hasAttribute("data-enc-nav-open")) return;
    if (open) bar.setAttribute("data-enc-nav-open", "");
    else bar.removeAttribute("data-enc-nav-open");
  }

  /* ── the bar is one hover band (handoff 2026-09-23) ──────────────────────────────────────
     Radix opens a panel on its trigger and closes it as soon as the pointer is on neither the
     trigger nor the panel — so the gaps beside the logo and before Book a call, which are part
     of the same bar, shut it. The band keeps it: while the pointer is anywhere over the bar or
     its panel, the open trigger is told the pointer is still on it; the panel closes only when
     the pointer leaves both. The gaps never OPEN a panel — nothing is dispatched unless one is
     already open — and Book a call closes it, as the design says. */
  function band() {
    var bar = document.querySelector("nav.super-navbar");
    if (!bar || bar.hasAttribute("data-enc-band")) return;
    bar.setAttribute("data-enc-band", "");

    function openTrigger() {
      return bar.querySelector('.super-navbar__list[data-state="open"], ' +
        '.super-navbar__list[aria-expanded="true"]');
    }
    function panel() {
      return document.querySelector(".super-navbar__list-content, .super-navbar__viewport");
    }
    function hold(t) {
      t.dispatchEvent(mouse("pointerenter"));
      t.dispatchEvent(mouse("pointermove"));
      t.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    }
    function shut(t) {
      t.dispatchEvent(mouse("pointerleave"));
      t.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    }

    // hover is not a mutation, so the ground is painted on the pointer's own events too
    bar.addEventListener("pointerover", function () { setTimeout(paint, 0); });
    bar.addEventListener("pointerout", function () { setTimeout(paint, 0); });

    var last = 0;
    bar.addEventListener("pointermove", function (e) {
      var t = openTrigger();
      if (!t) return;
      var actions = bar.querySelector(".super-navbar__actions");
      if (actions && actions.contains(e.target)) { shut(t); return; }
      // over a trigger radix is already holding it open; only the gaps need telling
      if (e.target.closest && e.target.closest(".super-navbar__list")) return;
      var now = Date.now();
      if (now - last < 120) return;
      last = now;
      hold(t);
    });

    document.addEventListener("pointermove", function (e) {
      var t = openTrigger();
      if (!t) return;
      var p = panel();
      var inside = bar.contains(e.target) || (p && p.contains(e.target));
      if (!inside) shut(t);
    }, true);
  }

  /* ── THE COMPACT BAR, under 960px (handoff 2026-09-24) ──────────────────────────────────
     Under 960 the bar is the wordmark, Book a call and one icon-only Menu button, and the menu is
     a sheet under the bar: an ink rail carrying the groups as 01–05 — the chosen one in paper, the
     rest as outlines — and beside it the chosen group, led by its first page's cover, then the
     group's name and its pages, each with its line. No panels, no third column: those do not
     survive a narrow screen. Tap to choose, so it serves touch, where hover does not exist; paper
     on a paper page, ink on an ink one — the rail is ink on both.

     SUPER STILL OWNS THE MENU. The groups, their names, their pages and their order are Super's
     navigation, read from the same data as the panels' groups (harvest), so a page added in Super
     appears here too. The lines are CONTENT's, or the description Super holds for a link where
     one is set. Super's own hamburger and its accordion are hidden under 960 (main.css §04) rather
     than restyled: the accordion opens several groups at once, and the design shows exactly one.
     A page is opened through Next's own router, as Super's links do, so the site stays a
     single-page app from here too. */
  var menu = [];            /* [{ label, items: [{ label, href, desc }] }], Super's groups in order */
  var COMPACT = "(max-width: 959px)";
  var sheet = null, menuBtn = null, sheetAt = "";
  var SVGNS = "http://www.w3.org/2000/svg";

  function menuIcon(open) {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 18 18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("aria-hidden", "true");
    (open ? ["M4 4l10 10", "M14 4L4 14"] : ["M3 5.5h12", "M3 9h12", "M3 12.5h12"]).forEach(function (d) {
      var p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
    });
    return svg;
  }
  function sheetOpen() { return !!(sheet && !sheet.hidden); }
  function setButton(open) {
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Menu");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.textContent = "";
    menuBtn.appendChild(menuIcon(open));
  }

  /* a page opens as Super's own links open it — through the app's router — unless the reader
     asked for a new tab */
  function go(e) {
    var href = e.currentTarget.getAttribute("href") || "";
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    closeSheet(false);
    var router = window.next && window.next.router;
    if (href.charAt(0) === "/" && router && typeof router.push === "function") {
      e.preventDefault();
      router.push(href);
    }
  }

  function choose(i, focus) {
    var g = menu[i];
    if (!g || !sheet) return;
    var tabs = all(sheet, ".enc-sheet__tab");
    tabs.forEach(function (t, j) {
      t.setAttribute("aria-selected", j === i ? "true" : "false");
      t.tabIndex = j === i ? 0 : -1;
    });
    if (focus && tabs[i]) tabs[i].focus();
    var pane = sheet.querySelector(".enc-sheet__pane");
    pane.textContent = "";
    pane.setAttribute("aria-labelledby", tabs[i] ? tabs[i].id : "");
    pane.scrollTop = 0;

    // the group's first page, as its cover
    var first = g.items[0], shot = first && shotOf(first.href);
    if (shot) {
      var thumb = el("a", "enc-sheet__thumb");
      thumb.href = first.href;
      thumb.setAttribute("aria-label", first.label);
      thumb.setAttribute("data-enc-shot", shot.mode);
      var img = el("img");
      img.src = shot.src;
      img.alt = "";
      thumb.appendChild(img);
      thumb.addEventListener("click", go);
      pane.appendChild(thumb);
    }
    pane.appendChild(el("span", "enc-sheet__group", g.label));
    var list = el("div", "enc-sheet__list");
    g.items.forEach(function (p) {
      var row = el("a", "enc-sheet__row");
      row.href = p.href;
      var c = copyOf(p.href);
      row.appendChild(el("span", "enc-sheet__name", p.label));
      row.appendChild(el("span", "enc-sheet__line", p.desc || (c ? c[0] : "")));
      row.addEventListener("click", go);
      list.appendChild(row);
    });
    pane.appendChild(list);
    // "N mainnets, N testnets" is counted from the set, as in the panel
    if (g.items.some(function (p) { return path(p.href) === "/networks" && p.href.indexOf("#") < 0; })) {
      counts().then(applyCounts);
    }
  }

  function buildSheet() {
    if (sheet) return;
    sheet = el("div", "enc-sheet");
    sheet.id = "enc-sheet";
    sheet.hidden = true;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-label", "Site menu");
    var rail = el("div", "enc-sheet__rail");
    rail.setAttribute("role", "tablist");
    rail.setAttribute("aria-orientation", "vertical");
    var pane = el("div", "enc-sheet__pane");
    pane.setAttribute("role", "tabpanel");
    pane.id = "enc-sheet-pane";
    menu.forEach(function (g, i) {
      var tab = el("button", "enc-sheet__tab", (i < 9 ? "0" : "") + (i + 1));
      tab.type = "button";
      tab.id = "enc-sheet-tab-" + i;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-label", g.label);
      tab.setAttribute("aria-controls", pane.id);
      tab.addEventListener("click", function () { choose(i); });
      rail.appendChild(tab);
    });
    rail.addEventListener("keydown", function (e) {
      var tabs = all(rail, ".enc-sheet__tab"), at = tabs.indexOf(document.activeElement);
      if (at < 0) return;
      var to = e.key === "ArrowDown" ? (at + 1) % tabs.length
        : e.key === "ArrowUp" ? (at - 1 + tabs.length) % tabs.length
        : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      choose(to, true);
    });
    sheet.appendChild(rail);
    sheet.appendChild(pane);
    document.body.appendChild(sheet);
  }

  function openSheet() {
    var bar = document.querySelector("nav.super-navbar");
    if (!bar || !menu.length) return;
    buildSheet();
    /* the ground the bar has on this page: ink stays ink with the sheet open */
    if (bar.hasAttribute("data-enc-nav-ink")) sheet.setAttribute("data-enc-ink", "");
    else sheet.removeAttribute("data-enc-ink");
    choose(0);
    sheet.hidden = false;
    sheetAt = location.pathname;
    bar.setAttribute("data-enc-sheet", "");
    document.documentElement.setAttribute("data-enc-sheet", "");
    setButton(true);
  }
  function closeSheet(focusBack) {
    if (!sheetOpen()) return;
    sheet.hidden = true;
    var bar = document.querySelector("nav.super-navbar");
    if (bar) bar.removeAttribute("data-enc-sheet");
    document.documentElement.removeAttribute("data-enc-sheet");
    setButton(false);
    if (focusBack && menuBtn) menuBtn.focus();
  }

  /* the Menu button sits in Super's actions, after its Book a call; the observer puts it back if
     a re-render drops it */
  function compact() {
    var actions = document.querySelector("nav.super-navbar .super-navbar__actions");
    if (!actions || !menu.length) return;
    if (!menuBtn) {
      menuBtn = el("button", "enc-nav__menu");
      menuBtn.type = "button";
      menuBtn.setAttribute("aria-controls", "enc-sheet");
      setButton(false);
      menuBtn.addEventListener("click", function () {
        if (sheetOpen()) closeSheet(false); else openSheet();
      });
    }
    if (menuBtn.parentNode !== actions) actions.appendChild(menuBtn);
    // a client-side navigation to another page closes it
    if (sheetOpen() && location.pathname !== sheetAt) closeSheet(false);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheetOpen()) closeSheet(true);
  });
  window.addEventListener("resize", function () {
    if (sheetOpen() && !window.matchMedia(COMPACT).matches) closeSheet(false);
  });

  function tick() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".super-navbar__list-content"), build);
    paint();
    ground();
    harvest();
    Array.prototype.forEach.call(triggersOf(), record);
    markCurrent();
    band();
    compact();
  }

  /* a marker, so a live page can be asked which build ran — and the readers, so each can be run
     against its page from the console without opening the menu */
  window.encNav = { version: 9, menu: function () { return menu; }, openSheet: openSheet, closeSheet: closeSheet, counts: counts, read: READ, draw: DRAW, kind: KIND, shot: shotOf, page: pageOf,
    groups: function () { return groups; }, harvest: function () { return { done: harvested, tries: harvestTries }; },
    ground: ground, isInk: isInk, groundUnder: groundUnder, wordmark: wearWordmark,
    band: band };

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(tick, 0); })
    .observe(document.body, { childList: true, subtree: true, attributes: true,
      attributeFilter: ["data-state", "aria-expanded"] });
  tick();
  window.addEventListener("load", tick);
  window.addEventListener("resize", ground);
  // the drawer locks the page while it is open; measure again once it has gone
  new MutationObserver(function () { setTimeout(ground, 0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-enc-locked"] });
  window.addEventListener("popstate", markCurrent);
})();
