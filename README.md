# leppaversot.fi

Website of Partiolippukunta Espoon Leppäversot ry — a static site built with plain HTML, one global CSS file and a little vanilla JavaScript. No libraries, no build step, no external requests (fonts and images are all local).

## Structure

```
index.html                Tervetuloa (front page)
ajankohtaista/index.html  Ajankohtaista
ilmoittaudu/index.html    Ilmoittautuminen
varusteet/index.html      Varusteet
yhteystiedot/index.html   Yhteystiedot
kalenteri/index.html      Adventtikalenteri (not in the menu, linked directly)
calendar/index.html       Advent Calendar, English version of kalenteri/ (not in the menu)
home/index.html           Redirect from the old Google Sites URL /home → /
404.html                  Not-found page (uses root-absolute asset paths)
assets/css/style.css      All styles; colours and fonts are CSS variables at the top
assets/js/layout.js       Shared header + footer (written into every page)
assets/js/main.js         Mobile menu, scroll reveal, header hairline, photo lightbox
assets/fonts/             Fraunces + Nunito Sans (SIL Open Font License)
assets/img/               Photos (full + -800 variants), logo.svg (official ELV logo) and favicon
```

Each page lives in its own folder so the old URLs (`/ajankohtaista`, `/ilmoittaudu`, …) keep working.

## Editing

- Text: edit the page's `index.html` directly.
- Header, navigation and footer: edit `assets/js/layout.js` — one place for all pages. Each page includes it with
  `<script src="../assets/js/layout.js" data-part="header"></script>` (and `data-part="footer"`), and marks its menu item with `<body data-page="…">`.
- Events: `ajankohtaista/index.html` has a "Partiovuosi" list; copy an `<li>` to add an item (instructions in an HTML comment there).
- New photo: add `name.jpg` (≈1600px wide) and `name-800.jpg` to `assets/img/`, e.g.
  `magick original.jpg -strip -resize 1600x1600\> -quality 80 name.jpg`

## Local preview

```
python3 serve.py
```
then open http://localhost:8000/ (another port: `python3 serve.py 8080`).

`serve.py` is a small live-reload server using only Python's standard library: CSS changes are swapped in without a reload, other changes reload the page and restore the scroll position. Missing pages get `404.html`, like on the host. `python3 -m http.server 8000` still works for a plain preview.

## Deploy

Upload the repository contents (except `.git` and `serve.py`) to any static host (GitHub Pages, Netlify, Cloudflare Pages, a plain web server). Configure the host to serve `404.html` for missing pages.
