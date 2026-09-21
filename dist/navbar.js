/* The navigation bar — design "Navbar 4f Page". Linked from the SITE head, so it runs on every
   page, and driven by an observer because Super never executes a page's own script on a
   client-side navigation.

   SUPER OWNS THE MENU. The bar's items, its groups and every link in them are Super's navigation
   settings, and Super's own dropdown (radix) still opens and closes them, keyboard included —
   this file adds nothing to that and takes nothing away. What it adds is the 4f panel: the row
   numbers, the line under each link, the preview of where the link goes, the note beside it and
   the foot. main.css §04 does the bar itself.

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
    "/networks": ["28 mainnets, 14 testnets",
      "Every chain we validate, mainnet and testnet.",
      "Reward rate where the chain publishes one; the role we played where it does not."],
    "/services": ["Dashboards, playbooks, bots",
      "What we build and run around the validator.",
      "Dashboards, playbooks, bots and monitoring — used on our own set first."],
    "/governance-record": ["How we decide a vote",
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
    "/services#block-4e58731953944b8d9382f545307b155b": ["Live chain state, per network",
      "Live state for every chain we run, one page each.",
      "Height, peers, missed blocks and upgrade status, read from our own nodes."],
    "/services#block-3e2e800a5138816990a7da4eb111ef66": ["Ansible for node deploys",
      "The Ansible we use to deploy and upgrade validators.",
      "Open, versioned, and the same playbooks that run our own set."],
    "/services#block-fcf0af8817cc465192c8a50c422084d1": ["Proposals into your own Discord",
      "Governance proposals delivered into your Discord or Telegram.",
      "Every new proposal, with the deadline and our vote once cast."],
    "/services#block-58ad79b056524fd183121d379f8b08dd": ["Alerting and health checks",
      "Alerting and health checks for nodes we run and nodes we don't.",
      "Pages a person, not a dashboard."],
    "/eigen-layer": ["Restaking, as an operator",
      "What we run on EigenLayer.",
      "An operator in the staking group, with the same rules as every other set."]
  };
  /* the tertiary line at the foot of a panel, by the group's own name in Super */
  var FOOT = {
    "Networks": "See all 28",
    "Staking": "See all 28",
    "Services": "What we build for chains",
    "Practices": "How we conduct ourselves",
    "Learn": "Read the latest",
    "Company": "Book a call",
    "About Us": "Who we are"
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
  function copyOf(href) {
    if (!href) return null;
    var whole = href.split("?")[0];
    return CONTENT[whole] || CONTENT[path(href)] || null;
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
    "/services#block-4e58731953944b8d9382f545307b155b": "dashboards",
    "/services#block-3e2e800a5138816990a7da4eb111ef66": "playbooks",
    "/services#block-fcf0af8817cc465192c8a50c422084d1": "bots",
    "/services#block-58ad79b056524fd183121d379f8b08dd": "monitoring"
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
    var whole = href.split("?")[0];
    if (PANELS[whole]) {
      return { src: BASE + "img/nav-panels/" + PANELS[whole] + ".png",
        mode: PANELS[whole] === "institutional" ? "cover" : "panel" };
    }
    if (whole.indexOf("#") >= 0) return null;
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
  function glyphOf(card) {
    var img = card.querySelector("img");
    return img ? originalSrc(img.getAttribute("src")) : "";
  }

  var READ = {
    "/networks": function (doc) {
      var db = doc.getElementById(SET);
      return (db ? all(db, ".notion-collection-card") : []).slice(0, 12).map(function (c) {
        var rate = c.querySelector(".property-597e3d69");
        return { name: titleOf(c), rate: rate ? rate.textContent.trim() : "",
          glyph: glyphOf(c), href: linkOf(c) || "/networks" };
      }).filter(function (r) { return r.name; });
    },
    "/governance-record": function (doc) {
      var db = doc.getElementById(PILLARS);
      /* a pillar's card carries its number, its word, its question and its line — the question
         is the one that reads as a sentence fragment and is not the longest */
      return (db ? all(db, ".notion-collection-card") : []).slice(0, 4).map(function (c) {
        var texts = propsOf(c).filter(function (t) { return !/^\d+$/.test(t); });
        var q = texts.length > 1 ? texts[1] : texts[0];
        return { text: q || "", href: "/governance-record#" + PILLARS };
      }).filter(function (r) { return r.text; });
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
      return (db ? all(db, ".notion-collection-card") : []).slice(0, 4).map(function (c) {
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
      return all(doc, ".notion-collection-card").slice(0, 3).map(function (c) {
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
  var KIND = { "/networks": "chains", "/governance-record": "list", "/security": "list",
    "/brand": "list", "/contact-us": "list", "/guides": "guides", "/blog": "posts",
    "/investments": "holds", "/services": "tiles" };

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
    /* "Book a call" is the booking link, which booking.js opens in the drawer; every other
       group's line goes to its first page */
    outward(footLink, /book a call/i.test(FOOT[group] || "") ? BOOKING
      : (links[0].getAttribute("href") || "#"));
    foot.appendChild(footLink);
    foot.appendChild(el("span", "enc-nav__count",
      links.length + (links.length === 1 ? " page" : " pages")));
    panel.appendChild(foot);

    /* the tools of a group are its own section links that have a panel capture */
    var tools = links.map(function (a) {
      var href = a.getAttribute("href") || "";
      var shot = shotOf(href);
      return shot && shot.mode === "panel"
        ? { name: a.getAttribute("data-enc-name"), href: href, src: shot.src } : null;
    }).filter(Boolean);

    var current = null, timer = 0;

    function fill(href) {
      var whole = (href || "").split("?")[0];
      var key = whole.indexOf("#") >= 0 ? "" : path(href);
      var kind = KIND[key];
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
        pageOf(key).then(function (doc) {
          if (!doc || current !== href) return;
          var rows = [];
          try { rows = READ[key](doc) || []; } catch (e) { rows = []; }
          if (!rows.length) return;               // the note stands
          extra.textContent = "";
          extra.setAttribute("data-enc-kind", kind);
          DRAW[kind](extra, rows);
          third.setAttribute("data-enc-filled", "");
        });
      }, docs[key] ? 0 : 220);
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
  var groups = {};          /* trigger id -> [paths] */
  var harvested = false;

  function triggersOf() {
    return Array.prototype.slice.call(
      document.querySelectorAll("nav.super-navbar .super-navbar__list"));
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
      if (href.charAt(0) === "/") paths.push(path(href));
    });
    groups[trigger.id || trigger.textContent.trim()] = paths;
    return true;
  }

  function markCurrent() {
    var here = path(location.pathname);
    triggersOf().forEach(function (t) {
      var paths = groups[t.id || t.textContent.trim()] || [];
      var on = paths.some(function (p) {
        return p === here || (p !== "/" && here.indexOf(p + "/") === 0);
      });
      if (on) t.setAttribute("data-enc-current", "");
      else t.removeAttribute("data-enc-current");
    });
  }

  /* Open each group once, behind a hidden viewport, so its links are known before a reader
     touches the bar. Radix mounts a panel on pointerenter and keeps it mounted. */
  function harvest() {
    if (harvested) return;
    var triggers = triggersOf();
    if (!triggers.length) return;
    harvested = true;
    var bar = document.querySelector("nav.super-navbar");
    if (bar) bar.setAttribute("data-enc-harvest", "");
    var i = 0;
    (function step() {
      if (i >= triggers.length) {
        if (bar) bar.removeAttribute("data-enc-harvest");
        markCurrent();
        return;
      }
      var t = triggers[i++];
      if (record(t)) { step(); return; }
      t.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      t.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      setTimeout(function () {
        record(t);
        t.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
        t.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        setTimeout(step, 30);
      }, 90);
    })();
  }

  /* the bar takes its paper ground only while a menu is open — over a cover it is otherwise
     transparent, which is the whole point of 4f */
  function paint() {
    var bar = document.querySelector("nav.super-navbar");
    if (!bar) return;
    var open = !!bar.querySelector('.super-navbar__list[data-state="open"], ' +
      '.super-navbar__list[aria-expanded="true"]');
    if (open === bar.hasAttribute("data-enc-nav-open")) return;
    if (open) bar.setAttribute("data-enc-nav-open", "");
    else bar.removeAttribute("data-enc-nav-open");
  }

  function tick() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".super-navbar__list-content"), build);
    paint();
    harvest();
    Array.prototype.forEach.call(triggersOf(), record);
    markCurrent();
  }

  /* a marker, so a live page can be asked which build ran — and the readers, so each can be run
     against its page from the console without opening the menu */
  window.encNav = { version: 3, read: READ, draw: DRAW, kind: KIND, shot: shotOf, page: pageOf };

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(tick, 0); })
    .observe(document.body, { childList: true, subtree: true, attributes: true,
      attributeFilter: ["data-state", "aria-expanded"] });
  tick();
  window.addEventListener("load", tick);
  window.addEventListener("popstate", markCurrent);
})();
