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
for name in sys.argv[1:] or ['main.css', 'home.css', 'network.css']:
    if not os.path.exists(name):
        continue
    src = open(name, encoding='utf-8').read()
    dst = squeeze(strip(src))
    open(os.path.join('dist', name), 'w', encoding='utf-8').write(dst)
    print(f'{name:14} {len(src):>7,} -> {len(dst):>7,} bytes  '
          f'({100 - 100*len(dst)//len(src)}% smaller)')

# home.js is pasted into Super's homepage Code -> Head, which takes HTML. The dial's styles
# (home-dial.css) only matter when the script runs, so they travel with it as a <style> block
# rather than adding to home.css, which is near Super's size limit.
if os.path.exists('home.js') and not sys.argv[1:]:
    js = open('home.js', encoding='utf-8').read()
    css = squeeze(strip(open('home-dial.css', encoding='utf-8').read())) if os.path.exists('home-dial.css') else ''
    out = ('<style>\n' + css + '</style>\n' if css else '') + '<script>\n' + js + '</script>\n'
    open(os.path.join('dist', 'home-head.html'), 'w', encoding='utf-8').write(out)
    print(f"home.js + home-dial.css -> dist/home-head.html  {len(out):>7,} bytes")
