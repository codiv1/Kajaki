/* ============================================================
   NAWIGACJA — przyklejony nagłówek, menu mobilne, podświetlanie
   aktywnej sekcji, odsłanianie treści przy przewijaniu
   ============================================================ */

(function () {
  'use strict';

  const naglowek = document.getElementById('naglowek');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  const linki = Array.from(menu.querySelectorAll('a[href^="#"]'));

  /* ---------- przyklejony nagłówek ---------- */

  function przelaczTlo() {
    naglowek.classList.toggle('naglowek--przyklejony', window.scrollY > 40);
  }

  przelaczTlo();
  window.addEventListener('scroll', przelaczTlo, { passive: true });

  /* ---------- menu mobilne ---------- */

  function zamknijMenu() {
    document.body.classList.remove('menu-otwarte');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Otwórz menu');
  }

  hamburger.addEventListener('click', function () {
    const otwarte = document.body.classList.toggle('menu-otwarte');
    hamburger.setAttribute('aria-expanded', String(otwarte));
    hamburger.setAttribute('aria-label', otwarte ? 'Zamknij menu' : 'Otwórz menu');
  });

  // klik w link zamyka menu na mobile
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) zamknijMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') zamknijMenu();
  });

  // powrót do desktopu przy obrocie/zmianie szerokości
  window.matchMedia('(min-width: 901px)').addEventListener('change', zamknijMenu);

  /* ---------- podświetlanie aktywnej sekcji ---------- */

  const sekcje = linki
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sekcje.length) {
    const widoczne = new Set();

    const obserwator = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(w => w.isIntersecting ? widoczne.add(w.target) : widoczne.delete(w.target));

      // aktywna = najwyżej położona z aktualnie widocznych sekcji
      let aktywna = null;
      sekcje.forEach(s => { if (widoczne.has(s) && !aktywna) aktywna = s; });

      linki.forEach(a => {
        a.classList.toggle('aktywny', !!aktywna && a.getAttribute('href') === '#' + aktywna.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sekcje.forEach(s => obserwator.observe(s));
  }

  /* ---------- odsłanianie treści przy przewijaniu ---------- */

  const doOdsloniecia = document.querySelectorAll('.odslon');

  if ('IntersectionObserver' in window) {
    const oko = new IntersectionObserver(function (wpisy, self) {
      wpisy.forEach(function (w) {
        if (!w.isIntersecting) return;
        w.target.classList.add('widoczny');
        self.unobserve(w.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    doOdsloniecia.forEach(el => oko.observe(el));
  } else {
    doOdsloniecia.forEach(el => el.classList.add('widoczny'));
  }

})();
