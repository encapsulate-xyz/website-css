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

os.makedirs('dist', exist_ok=True)
for name in sys.argv[1:] or ['main.css', 'home.css', 'network.css', 'governance.css', 'blog.css', 'brand.css', 'contact-us.css', 'guides.css', 'investments.css', 'post.css', 'guide.css', 'security.css', 'services.css', 'guides.css', 'chain.css', 'legal.css']:
    if not os.path.exists(name):
        continue
    src = open(name, encoding='utf-8').read()
    dst = squeeze(strip(src))
    open(os.path.join('dist', name), 'w', encoding='utf-8').write(dst)
    print(f'{name:14} {len(src):>7,} -> {len(dst):>7,} bytes  '
          f'({100 - 100*len(dst)//len(src)}% smaller)')

# The homepage dial: home.js and its styles home-dial.css. Both are served from the repo via
# jsDelivr and linked from the homepage's Code -> Head (see "Serving from GitHub" in CLAUDE.md),
# so they are written to dist/ like the stylesheets.
if not sys.argv[1:]:
    if os.path.exists('home-dial.css'):
        src = open('home-dial.css', encoding='utf-8').read()
        dst = squeeze(strip(src))
        open(os.path.join('dist', 'home-dial.css'), 'w', encoding='utf-8').write(dst)
        print(f"{'home-dial.css':14} {len(src):>7,} -> {len(dst):>7,} bytes")
    if os.path.exists('home.js'):
        js = open('home.js', encoding='utf-8').read()
        open(os.path.join('dist', 'home.js'), 'w', encoding='utf-8').write(js)
        print(f"{'home.js':14} {len(js):>7,} -> dist/home.js (copied)")
    if os.path.exists('guide.js'):
        js = open('guide.js', encoding='utf-8').read()
        open(os.path.join('dist', 'guide.js'), 'w', encoding='utf-8').write(js)
        print(f"{'guide.js':14} {len(js):>7,} -> dist/guide.js (copied)")
    if os.path.exists('navbar.js'):
        js = open('navbar.js', encoding='utf-8').read()
        open(os.path.join('dist', 'navbar.js'), 'w', encoding='utf-8').write(js)
        print(f"{'navbar.js':14} {len(js):>7,} -> dist/navbar.js (copied)")
    if os.path.exists('footer.js'):
        js = open('footer.js', encoding='utf-8').read()
        open(os.path.join('dist', 'footer.js'), 'w', encoding='utf-8').write(js)
        print(f"{'footer.js':14} {len(js):>7,} -> dist/footer.js (copied)")
    if os.path.exists('guides.js'):
        js = open('guides.js', encoding='utf-8').read()
        open(os.path.join('dist', 'guides.js'), 'w', encoding='utf-8').write(js)
        print(f"{'guides.js':14} {len(js):>7,} -> dist/guides.js (copied)")
    if os.path.exists('brand.js'):
        js = open('brand.js', encoding='utf-8').read()
        open(os.path.join('dist', 'brand.js'), 'w', encoding='utf-8').write(js)
        print(f"{'brand.js':14} {len(js):>7,} -> dist/brand.js (copied)")
    # the homepage's loop, regrounded to paper: copied as-is, like the JS
    if os.path.exists(os.path.join('video', 'home-loop-paper.mp4')):
        import shutil
        os.makedirs(os.path.join('dist', 'video'), exist_ok=True)
        shutil.copy(os.path.join('video', 'home-loop-paper.mp4'),
                    os.path.join('dist', 'video', 'home-loop-paper.mp4'))
        n = os.path.getsize(os.path.join('dist', 'video', 'home-loop-paper.mp4'))
        print(f"{'home-loop.mp4':14} {n:>7,} -> dist/video/home-loop-paper.mp4 (copied)")
    if os.path.exists('post.js'):
        js = open('post.js', encoding='utf-8').read()
        open(os.path.join('dist', 'post.js'), 'w', encoding='utf-8').write(js)
        print(f"{'post.js':14} {len(js):>7,} -> dist/post.js (copied)")
    if os.path.exists('investments.js'):
        js = open('investments.js', encoding='utf-8').read()
        open(os.path.join('dist', 'investments.js'), 'w', encoding='utf-8').write(js)
        print(f"{'investments.js':14} {len(js):>7,} -> dist/investments.js (copied)")
    if os.path.exists('security.js'):
        js = open('security.js', encoding='utf-8').read()
        open(os.path.join('dist', 'security.js'), 'w', encoding='utf-8').write(js)
        print(f"{'security.js':14} {len(js):>7,} -> dist/security.js (copied)")
    if os.path.exists('booking.js'):
        js = open('booking.js', encoding='utf-8').read()
        open(os.path.join('dist', 'booking.js'), 'w', encoding='utf-8').write(js)
        print(f"{'booking.js':14} {len(js):>7,} -> dist/booking.js (copied)")
    if os.path.exists('contact.js'):
        js = open('contact.js', encoding='utf-8').read()
        open(os.path.join('dist', 'contact.js'), 'w', encoding='utf-8').write(js)
        print(f"{'contact.js':14} {len(js):>7,} -> dist/contact.js (copied)")
    if os.path.exists('governance.js'):
        js = open('governance.js', encoding='utf-8').read()
        open(os.path.join('dist', 'governance.js'), 'w', encoding='utf-8').write(js)
        print(f"{'governance.js':14} {len(js):>7,} -> dist/governance.js (copied)")
    if os.path.exists('blog.js'):
        js = open('blog.js', encoding='utf-8').read()
        open(os.path.join('dist', 'blog.js'), 'w', encoding='utf-8').write(js)
        print(f"{'blog.js':14} {len(js):>7,} -> dist/blog.js (copied)")
    if os.path.exists('network.js'):
        js = open('network.js', encoding='utf-8').read()
        open(os.path.join('dist', 'network.js'), 'w', encoding='utf-8').write(js)
        print(f"{'network.js':14} {len(js):>7,} -> dist/network.js (copied)")
    if os.path.exists('services.js'):
        js = open('services.js', encoding='utf-8').read()
        open(os.path.join('dist', 'services.js'), 'w', encoding='utf-8').write(js)
        print(f"{'services.js':14} {len(js):>7,} -> dist/services.js (copied)")
    if os.path.exists('chain.js'):
        js = open('chain.js', encoding='utf-8').read()
        open(os.path.join('dist', 'chain.js'), 'w', encoding='utf-8').write(js)
        print(f"{'chain.js':14} {len(js):>7,} -> dist/chain.js (copied)")
    if os.path.exists('filterbar.js'):
        js = open('filterbar.js', encoding='utf-8').read()
        open(os.path.join('dist', 'filterbar.js'), 'w', encoding='utf-8').write(js)
        print(f"{'filterbar.js':14} {len(js):>7,} -> dist/filterbar.js (copied)")
    if os.path.exists('blocks.js'):
        js = open('blocks.js', encoding='utf-8').read()
        open(os.path.join('dist', 'blocks.js'), 'w', encoding='utf-8').write(js)
        print(f"{'blocks.js':14} {len(js):>7,} -> dist/blocks.js (copied)")
    if os.path.exists('covers.js'):
        js = open('covers.js', encoding='utf-8').read()
        open(os.path.join('dist', 'covers.js'), 'w', encoding='utf-8').write(js)
        print(f"{'covers.js':14} {len(js):>7,} -> dist/covers.js (copied)")
    stale = os.path.join('dist', 'home-head.html')
    if os.path.exists(stale):
        os.remove(stale)
