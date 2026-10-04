# leppaversot.fi

Website of Partiolippukunta Espoon Leppäversot ry — a static site built with plain HTML, one global CSS file and a little vanilla JavaScript. No libraries, no build step, no external requests (fonts and images are all local).

## Structure

```
index.html                Tervetuloa (front page)
ajankohtaista/index.html  Ajankohtaista
ilmoittaudu/index.html    Ilmoittautuminen
varusteet/index.html      Varusteet
yhteystiedot/index.html   Yhteystiedot
home/index.html           Redirect from the old Google Sites URL /home → /
404.html                  Not-found page (uses root-absolute asset paths)
assets/css/style.css      All styles; colours and fonts are CSS variables at the top
assets/js/layout.js       Shared header + footer (written into every page)
assets/js/main.js         Mobile menu, scroll reveal, header hairline, photo lightbox
assets/fonts/             Fraunces + Nunito Sans (SIL Open Font License)
assets/img/               Photos (full + -800 variants) and favicon
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
python3 -m http.server 8000
```
then open http://localhost:8000/.

## Deploy

Upload the repository contents (except `.git`) to any static host (GitHub Pages, Netlify, Cloudflare Pages, a plain web server). Configure the host to serve `404.html` for missing pages.
