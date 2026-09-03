/* ============================================================
   MAPA TRAS — karty tras + interaktywna mapa Leaflet
   Dane pochodzą z js/dane-tras.js (RZEKA, INDEKSY, PRZYSTANKI, TRASY)
   ============================================================ */

(function () {
  'use strict';

  const pojemnikMapy = document.getElementById('mapa');
  if (!pojemnikMapy || typeof L === 'undefined') return;

  const podpowiedz = document.getElementById('mapa-podpowiedz');
  const TEKST_DOMYSLNY = 'Najedź na trasę z listy obok';

  /* ---------------- karty tras ---------------- */

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  TRASY.forEach(function (t) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'karta';
    el.dataset.id = t.id;
    el.innerHTML =
      '<div class="numer">' + esc(t.numer) + '</div>' +
      '<h3>' + esc(t.nazwa) + '</h3>' +
      '<div class="znaczniki"><em>' + esc(t.km) + '</em><em>' + esc(t.czas) + '</em></div>' +
      '<p>' + esc(t.opis) + '</p>' +
      '<div class="ceny">' +
        t.ceny.map(c => '<span>' + esc(c[0]) + ' <b>' + esc(c[1]) + '</b></span>').join('') +
      '</div>';

    document.getElementById(t.grupa).appendChild(el);

    el.addEventListener('mouseenter', () => podglad(t.id));
    el.addEventListener('mouseleave', () => podglad(null));
    el.addEventListener('focus', () => podglad(t.id));
    el.addEventListener('blur', () => podglad(null));
    el.addEventListener('click', () => przypnij(t.id));
  });

  /* ---------------- mapa (inicjalizowana leniwie) ---------------- */

  let mapa, otoczka, aktywna, graniceCalosci;
  const warstwyPrzystankow = {};
  let przypieta = null;
  let gotowa = false;

  function zbudujMape() {
    if (gotowa) return;
    gotowa = true;

    mapa = L.map('mapa', { scrollWheelZoom: false, zoomControl: true, attributionControl: true });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    // cały bieg rzeki — dwie linie dla miękkiego konturu
    L.polyline(RZEKA, { color: '#31463F', weight: 9, opacity: .10, lineCap: 'round' }).addTo(mapa);
    L.polyline(RZEKA, { color: '#31463F', weight: 2.5, opacity: .45, lineCap: 'round' }).addTo(mapa);

    // podświetlany odcinek wybranej trasy
    otoczka = L.polyline([], { color: '#FBF8F1', weight: 11, opacity: 0, lineCap: 'round', lineJoin: 'round' }).addTo(mapa);
    aktywna = L.polyline([], { color: '#B06B3F', weight: 5.5, opacity: 0, lineCap: 'round', lineJoin: 'round' }).addTo(mapa);

    PRZYSTANKI.forEach(function (p) {
      const punkt = RZEKA[INDEKSY[p.k]];
      const znacznik = L.circleMarker(punkt, {
        radius: p.baza ? 8 : 5.5,
        color: p.baza ? '#B06B3F' : '#31463F',
        fillColor: p.baza ? '#B06B3F' : '#FBF8F1',
        fillOpacity: 1,
        weight: p.baza ? 3 : 2.5
      }).addTo(mapa);

      znacznik.bindTooltip(p.etykieta, {
        permanent: true,
        direction: p.baza ? 'right' : 'left',
        offset: p.baza ? [10, 0] : [-10, 0],
        className: 'przystanek' + (p.baza ? ' baza' : '')
      });

      warstwyPrzystankow[p.k] = znacznik;
    });

    graniceCalosci = L.latLngBounds(RZEKA);
    mapa.fitBounds(graniceCalosci, { padding: [26, 26] });

    mapa.getContainer().addEventListener('mouseleave', () => maluj(przypieta));

    // jeśli użytkownik najechał na kartę zanim mapa się zbudowała
    if (przypieta || oczekujace) maluj(przypieta || oczekujace);
  }

  /* ---------------- malowanie wybranej trasy ---------------- */

  function odcinek(t) {
    const a = INDEKSY[t.od], b = INDEKSY[t.do];
    return RZEKA.slice(Math.min(a, b), Math.max(a, b) + 1);
  }

  function maluj(id) {
    const t = TRASY.find(x => x.id === id);

    document.querySelectorAll('.karta').forEach(function (k) {
      k.classList.toggle('wybrana', !!id && k.dataset.id === id);
    });

    if (!gotowa) return;

    if (!t) {
      aktywna.setStyle({ opacity: 0 });
      otoczka.setStyle({ opacity: 0 });
      Object.values(warstwyPrzystankow).forEach(m => m.setStyle({ opacity: 1, fillOpacity: 1 }));
      podpowiedz.textContent = TEKST_DOMYSLNY;
      mapa.flyToBounds(graniceCalosci, { padding: [26, 26], duration: .6 });
      return;
    }

    const punkty = odcinek(t);

    otoczka.setLatLngs(punkty).setStyle({ opacity: .95 });
    otoczka.bringToFront();
    aktywna.setLatLngs(punkty).setStyle({ opacity: 1 });
    aktywna.bringToFront();

    PRZYSTANKI.forEach(function (p) {
      const wlaczony = (p.k === t.od || p.k === t.do);
      warstwyPrzystankow[p.k].setStyle({
        opacity: wlaczony ? 1 : .25,
        fillOpacity: wlaczony ? 1 : .25
      });
      if (wlaczony) warstwyPrzystankow[p.k].bringToFront();
    });

    podpowiedz.textContent = t.nazwa + ' · ' + t.km + ' · ' + t.czas;
    mapa.flyToBounds(L.latLngBounds(punkty), { padding: [40, 40], duration: .6 });
  }

  let oczekujace = null;

  function podglad(id) {
    oczekujace = id;
    maluj(id || przypieta);
  }

  function przypnij(id) {
    przypieta = (przypieta === id) ? null : id;
    maluj(przypieta);
  }

  /* ---------------- start dopiero, gdy sekcja jest widoczna ---------------- */

  if ('IntersectionObserver' in window) {
    const oko = new IntersectionObserver(function (wpisy, self) {
      if (!wpisy.some(w => w.isIntersecting)) return;
      self.disconnect();
      zbudujMape();
    }, { rootMargin: '200px' });

    oko.observe(pojemnikMapy);
  } else {
    zbudujMape();
  }

  // po zmianie rozmiaru okna Leaflet musi przeliczyć kontener
  window.addEventListener('resize', function () {
    if (gotowa) mapa.invalidateSize();
  });

})();
