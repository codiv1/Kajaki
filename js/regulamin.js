/* ============================================================
   REGULAMIN — rozwijanie i zwijanie pełnej treści
   Zwinięta wysokość pochodzi z CSS (.regulamin__tresc), tutaj
   ustawiamy tylko konkretny piksel na czas animacji.
   ============================================================ */

(function () {
  'use strict';

  const panel = document.getElementById('regulamin-panel');
  const tresc = document.getElementById('regulamin-tresc');
  const przycisk = document.getElementById('regulamin-przycisk');
  const etykieta = document.getElementById('regulamin-etykieta');

  if (!panel || !tresc || !przycisk) return;

  let otwarty = false;

  function dopasujWysokosc() {
    if (otwarty) tresc.style.maxHeight = tresc.scrollHeight + 'px';
  }

  przycisk.addEventListener('click', function () {
    otwarty = !otwarty;

    panel.classList.toggle('regulamin--otwarty', otwarty);
    przycisk.setAttribute('aria-expanded', String(otwarty));
    if (etykieta) etykieta.textContent = otwarty ? 'Zwiń regulamin' : 'Rozwiń pełny regulamin';

    if (otwarty) {
      dopasujWysokosc();
      return;
    }

    // zwijanie: wracamy do wysokości z CSS
    tresc.style.maxHeight = '';

    // gdyby nagłówek sekcji uciekł nad ekran, wracamy do niego
    const gora = panel.getBoundingClientRect().top;
    if (gora < 0) {
      const przesuniecie = window.scrollY + gora - 120;
      window.scrollTo({ top: Math.max(przesuniecie, 0), behavior: 'smooth' });
    }
  });

  // po zmianie szerokości okna tekst łamie się inaczej, więc przeliczamy limit
  window.addEventListener('resize', dopasujWysokosc);

})();
