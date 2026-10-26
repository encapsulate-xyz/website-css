#!/usr/bin/env python3
"""Strip comments from main.css / network.css to produce a paste-ready build.

Super's Custom CSS box has a size limit ("The code snippets you're trying to
save are too large"). This repo's stylesheets are heavily commented on purpose
— the comments are the record of WHY each rule exists — but Super does not
need them. Keep editing main.css; paste dist/main.css.

Comments are removed and whitespace is collapsed (outside strings). No selector, declaration or
value is touched, so the deployed CSS is byte-for-byte equivalent in behaviour.
"""
import re, os, sys

def strip(css: str) -> str:
    out, i, n = [], 0, len(css)
    while i < n:
        ch = css[i]
        # Skip over strings and url() so a /* inside a data URI or font name
        # is never mistaken for a comment opener.
        if ch in '"\'':
            q = ch; j = i + 1
            while j < n and css[j] != q:
                j += 2 if css[j] == '\\' else 1
            out.append(css[i:j+1]); i = j + 1; continue
        if css.startswith('/*', i):
            end = css.find('*/', i + 2)
            i = n if end == -1 else end + 2
            continue
        out.append(ch); i += 1
    return ''.join(out)

def squeeze(css: str) -> str:
    """Collapse whitespace outside strings: runs become one space, and spaces
    next to { } ; , go. Selectors keep their descendant spaces, so nothing
    changes meaning. Worth ~8% on top of comment stripping."""
    out, buf, i, n = [], [], 0, len(css)
    def flush():
        t = re.sub(r'\s+', ' ', ''.join(buf))
        out.append(re.sub(r' ?([{};,]) ?', r'\1', t)); buf.clear()
    while i < n:
        ch = css[i]
        if ch in '"\'':
            flush(); q = ch; j = i + 1
            while j < n and css[j] != q:
                j += 2 if css[j] == '\\' else 1
            out.append(css[i:j+1]); i = j + 1; continue
        buf.append(ch); i += 1
    flush()
    return ''.join(out).replace('}', '}\n').strip() + '\n'

# the scripts every head links (each is copied to dist/ minified, below)
JS = ['anchors.js', 'blocks.js', 'blog.js', 'booking.js', 'brand.js', 'chain.js', 'contact.js', 'covers.js', 'filterbar.js', 'footer.js', 'governance.js', 'guide.js', 'guides.js', 'home.js', 'investments.js', 'navbar.js', 'network.js', 'notfound.js', 'post.js', 'security.js', 'services.js']

os.makedirs('dist', exist_ok=True)
for name in sys.argv[1:] or ['main.css', 'home.css', 'network.css', 'governance.css', 'blog.css', 'brand.css', 'contact-us.css', 'guides.css', 'investments.css', 'post.css', 'guide.css', 'security.css', 'services.css', 'guides.css', 'chain.css', 'legal.css', 'notfound.css']:
    if not os.path.exists(name):
        continue
    src = open(name, encoding='utf-8').read()
    dst = squeeze(strip(src))
    open(os.path.join('dist', name), 'w', encoding='utf-8').write(dst)
    print(f'{name:14} {len(src):>7,} -> {len(dst):>7,} bytes  '
          f'({100 - 100*len(dst)//len(src)}% smaller)')

# dist/site.css — the site head's one stylesheet (2026-10-26): Super's theme (minima), main.css, the page sheets every
# page carries and the web fonts, in the order the head used to link them one by one. Eight stylesheets from three
# servers held every page's first paint; one from the server the scripts already come from holds it for less
# (docs/audit.md, "The first paint"). Super's minima is fetched again at every build, so the copy in vendor/ follows
# Super's own; offline, the copy is used as it is.
SITE = ['vendor/minima.min.css', 'main.css', 'post.css', 'blog.css', 'guide.css', 'chain.css', 'notfound.css', 'fonts.css']
if not sys.argv[1:]:
    import urllib.request
    MINIMA = 'https://sites.super.so/builder/themes/minima/minima.min.css'
    try:
        live = urllib.request.urlopen(MINIMA, timeout=5).read().decode('utf-8')
        if live != open(SITE[0], encoding='utf-8').read():
            open(SITE[0], 'w', encoding='utf-8').write(live)
            print('vendor/minima.min.css: Super changed its theme stylesheet — the copy is updated (see git diff)')
    except OSError as e:
        print(f'vendor/minima.min.css: Super could not be reached ({e}) — the copy is used as it is')
    parts = []
    for name in SITE:
        src = open(name, encoding='utf-8').read()
        parts.append(src.strip() + '\n' if name.startswith('vendor/') else squeeze(strip(src)))
    site = ''.join(parts)
    open(os.path.join('dist', 'site.css'), 'w', encoding='utf-8').write(site)
    print(f"{'site.css':14} {len(site):>7,} bytes ({' + '.join(os.path.basename(n) for n in SITE)})")

# The homepage dial: home.js and its styles home-dial.css. Both are served from the repo via
# jsDelivr and linked from the homepage's Code -> Head (see "Serving from GitHub" in CLAUDE.md),
# so they are written to dist/ like the stylesheets.
if not sys.argv[1:]:
    if os.path.exists('home-dial.css'):
        src = open('home-dial.css', encoding='utf-8').read()
        dst = squeeze(strip(src))
        open(os.path.join('dist', 'home-dial.css'), 'w', encoding='utf-8').write(dst)
        print(f"{'home-dial.css':14} {len(src):>7,} -> {len(dst):>7,} bytes")
    # the homepage's loop, regrounded to paper: copied as-is, like the JS
    if os.path.exists(os.path.join('video', 'home-loop-paper.mp4')):
        import shutil
        os.makedirs(os.path.join('dist', 'video'), exist_ok=True)
        shutil.copy(os.path.join('video', 'home-loop-paper.mp4'),
                    os.path.join('dist', 'video', 'home-loop-paper.mp4'))
        n = os.path.getsize(os.path.join('dist', 'video', 'home-loop-paper.mp4'))
        print(f"{'home-loop.mp4':14} {n:>7,} -> dist/video/home-loop-paper.mp4 (copied)")
    # Every script, minified (2026-10-25, PageSpeed: "Minify JavaScript — est. savings of 91 KiB"). Whitespace and
    # comments only: no variable is renamed and no statement rewritten, so dist/ runs exactly as the source does —
    # esbuild parses each file and prints it back without the spaces. The source keeps its comments, which are the
    # record of why each part exists; a source map beside each file (x.js.map) gives DevTools the real lines.
    # esbuild is pinned in package.json: `npm ci` once on a new machine.
    ESBUILD = os.path.join('node_modules', '.bin', 'esbuild')
    if not os.path.exists(ESBUILD):
        sys.exit("build.py: esbuild is missing — run `npm ci` in the repo first (package.json pins it)")
    import subprocess
    for js in JS:
        if not os.path.exists(js):
            continue
        subprocess.run([ESBUILD, js, '--minify-whitespace', '--legal-comments=none', '--charset=utf8',
                        '--sourcemap', '--sources-content=true', '--log-level=warning',
                        '--outfile=' + os.path.join('dist', js)], check=True)
        print(f"{js:14} {os.path.getsize(js):>7,} -> {os.path.getsize(os.path.join('dist', js)):>7,} bytes (minified)")
    # the hero's still is preloaded from the tag home.css draws it from, or the preload is a wasted download
    head = open(os.path.join('head', 'home.html'), encoding='utf-8').read()
    pre = re.search(r'website-css@(v\d+)/img/home-loop-poster', head)
    css = re.search(r'website-css@(v\d+)/dist/home\.css', head)
    if pre and css and pre.group(1) != css.group(1):
        print(f"WARNING head/home.html: the poster preload is on {pre.group(1)} but home.css on {css.group(1)} — give them the same tag")
    # the headings' font is preloaded from the tag site.css draws it from, or it is downloaded twice
    head = open(os.path.join('head', 'site.html'), encoding='utf-8').read()
    css = re.search(r'website-css@(v\d+)/dist/site\.css', head)
    for pre in re.finditer(r'website-css@(v\d+)/fonts/([\w.-]+)', head):
        if css and pre.group(1) != css.group(1):
            print(f"WARNING head/site.html: the {pre.group(2)} preload is on {pre.group(1)} but site.css on {css.group(1)} — give them the same tag")
        if not os.path.exists(os.path.join('fonts', pre.group(2))):
            print(f"WARNING head/site.html: the preloaded fonts/{pre.group(2)} is not in fonts/")
    stale = os.path.join('dist', 'home-head.html')
    if os.path.exists(stale):
        os.remove(stale)
