/*
  Shared header and footer for every page — edit them here, once.

  Usage in a page (plain, non-deferred script tags so there is no flicker):
    <body data-page="ajankohtaista">
      <script src="../assets/js/layout.js" data-part="header"></script>
      ...page content...
      <script src="../assets/js/layout.js" data-part="footer"></script>

  The script writes its part in place of itself. Links are made relative to
  the site root using the script's own src, so the site works from any folder
  (and even when opened straight from disk).
*/
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  /* "../assets/js/layout.js" -> "../", "assets/js/layout.js" -> "" */
  var root = script.getAttribute("src").replace(/assets\/js\/layout\.js.*$/, "");
  var home = root || "./";
  var page = (document.body && document.body.getAttribute("data-page")) || "";

  var PAGES = [
    { id: "home", href: "", label: "Tervetuloa!" },
    { id: "ajankohtaista", href: "ajankohtaista/", label: "Ajankohtaista" },
    { id: "ilmoittaudu", href: "ilmoittaudu/", label: "Ilmoittautuminen" },
    { id: "varusteet", href: "varusteet/", label: "Varusteet" },
    { id: "yhteystiedot", href: "yhteystiedot/", label: "Yhteystiedot" }
  ];

  var LEAF =
    '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M16 27C9 25 5.5 18.5 7 12.5 8.3 7.3 12.6 5.4 16 8.2 ' +
    '19.4 5.4 23.7 7.3 25 12.5 26.5 18.5 23 25 16 27Z"/><path d="M16 30.5V11M16 21.5l-4.5-4M16 21.5l4.5-4M16 ' +
    '15.5l-3.5-3M16 15.5l3.5-3"/></svg>';

  var BRAND =
    '<a class="brand" href="' + home + '">' + LEAF +
    "<span>Espoon Leppäversot<small>Partiolippukunta</small></span></a>";

  function navItems() {
    return PAGES.map(function (p) {
      var current = p.id === page ? ' aria-current="page"' : "";
      return '<li><a href="' + (root + p.href || "./") + '"' + current + ">" + p.label + "</a></li>";
    }).join("");
  }

  var header =
    '<a class="skip-link" href="#main">Siirry sisältöön</a>' +
    '<header class="site-header">' +
      '<div class="wrap">' +
        BRAND +
        '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Avaa valikko"><span></span></button>' +
        '<nav class="nav" id="site-nav" aria-label="Päävalikko"><ul>' + navItems() + "</ul></nav>" +
      "</div>" +
    "</header>";

  var footer =
    '<footer class="site-footer">' +
      '<div class="wrap footer-grid">' +
        "<div>" + BRAND +
          "<p>Partiolippukunta Espoon Leppäversot ry kokoontuu maanantaisin Valotalolla Matinkylässä.</p>" +
        "</div>" +
        "<div><h2>Käyntiosoite</h2>" +
          "<address>Valotalo<br>Matinkartanontie 13 A<br>02230 Espoo</address>" +
        "</div>" +
        "<div><h2>Partio</h2><ul>" +
          '<li><a href="https://papa.partio.fi/">Pääkaupunkiseudun Partiolaiset</a></li>' +
          '<li><a href="https://www.partio.fi/">Suomen Partiolaiset</a></li>' +
          '<li><a href="' + root + 'yhteystiedot/">Yhteystiedot</a></li>' +
        "</ul></div>" +
      "</div>" +
      '<div class="wrap footer-bottom">' +
        "<span>© " + new Date().getFullYear() + " Partiolippukunta Espoon Leppäversot ry</span>" +
        "<span>Y-tunnus 3061849-3</span>" +
      "</div>" +
    "</footer>";

  var part = script.getAttribute("data-part");
  var html = part === "header" ? header : part === "footer" ? footer : "";
  if (html) script.insertAdjacentHTML("beforebegin", html);
  script.parentNode.removeChild(script);
})();
