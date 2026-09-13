#!/usr/bin/env python3
"""Strip comments from main.css / network.css to produce a paste-ready build.

Super's Custom CSS box has a size limit ("The code snippets you're trying to
save are too large"). This repo's stylesheets are heavily commented on purpose
— the comments are the record of WHY each rule exists — but Super does not
need them. Keep editing main.css; paste dist/main.css.

Only comments and blank-line runs are removed. No selector, declaration or
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
    s = ''.join(out)
    s = re.sub(r'[ \t]+\n', '\n', s)        # trailing whitespace
    s = re.sub(r'\n{3,}', '\n\n', s)        # collapse blank-line runs
    return s.strip() + '\n'

os.makedirs('dist', exist_ok=True)
for name in sys.argv[1:] or ['main.css', 'network.css']:
    if not os.path.exists(name):
        continue
    src = open(name, encoding='utf-8').read()
    dst = strip(src)
    open(os.path.join('dist', name), 'w', encoding='utf-8').write(dst)
    print(f'{name:14} {len(src):>7,} -> {len(dst):>7,} bytes  '
          f'({100 - 100*len(dst)//len(src)}% smaller)')
