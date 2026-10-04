/* Espoon Leppäversot — small progressive enhancements. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile navigation ---------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Sulje valikko" : "Avaa valikko");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 48.01rem)").addEventListener("change", function (mq) {
      if (mq.matches) setNav(false);
    });
  }

  /* Reveal on scroll ----------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Header hairline once the page is scrolled ---------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Lightbox for gallery photos ------------------------------------------ */
  var triggers = document.querySelectorAll("[data-lightbox]");
  if (triggers.length && typeof HTMLDialogElement === "function") {
    var dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Sulje kuva">&times;</button>' +
      '<img alt=""><p></p>';
    document.body.appendChild(dialog);
    var dImg = dialog.querySelector("img");
    var dCap = dialog.querySelector("p");

    triggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        dImg.src = btn.getAttribute("data-lightbox");
        dImg.alt = img ? img.alt : "";
        var cap = btn.closest("figure") && btn.closest("figure").querySelector("figcaption");
        dCap.textContent = cap ? cap.textContent : "";
        dialog.showModal();
      });
    });
    dialog.querySelector(".lightbox__close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }
})();
