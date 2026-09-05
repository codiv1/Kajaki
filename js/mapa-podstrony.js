/* ============================================================
   MAPA NA PODSTRONIE TRASY — jeden, z góry wybrany odcinek
   Trasę wskazuje atrybut data-trasa na kontenerze #mapa
   (id zgodne z tablicą TRASY w js/dane-tras.js, np. data-trasa="r3").
   Dane: RZEKA, INDEKSY, PRZYSTANKI, TRASY z js/dane-tras.js
   ============================================================ */

(function () {
  'use strict';

  const pojemnik = document.getElementById('mapa');
  if (!pojemnik || typeof L === 'undefined' || typeof TRASY === 'undefined') return;

  const trasa = TRASY.find(t => t.id === pojemnik.dataset.trasa);
  if (!trasa) return;

  const a = INDEKSY[trasa.od], b = INDEKSY[trasa.do];
  const odcinek = RZEKA.slice(Math.min(a, b), Math.max(a, b) + 1);

  let mapa = null;

  function zbudujMape() {
    mapa = L.map('mapa', { scrollWheelZoom: false, zoomControl: true, attributionControl: true });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    // cały bieg rzeki w tle, delikatnie
    L.polyline(RZEKA, { color: '#31463F', weight: 8, opacity: .08, lineCap: 'round' }).addTo(mapa);
    L.polyline(RZEKA, { color: '#31463F', weight: 2, opacity: .30, lineCap: 'round' }).addTo(mapa);

    // odcinek tej trasy — dwie linie dla miękkiego konturu
    L.polyline(odcinek, { color: '#FBF8F1', weight: 11, opacity: .95, lineCap: 'round', lineJoin: 'round' }).addTo(mapa);
    L.polyline(odcinek, { color: '#B06B3F', weight: 5.5, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(mapa);

    PRZYSTANKI.forEach(function (p) {
      const naTrasie = (p.k === trasa.od || p.k === trasa.do);

      const znacznik = L.circleMarker(RZEKA[INDEKSY[p.k]], {
        radius: p.baza ? 8 : 5.5,
        color: p.baza ? '#B06B3F' : '#31463F',
        fillColor: p.baza ? '#B06B3F' : '#FBF8F1',
        fillOpacity: naTrasie ? 1 : .25,
        opacity: naTrasie ? 1 : .25,
        weight: p.baza ? 3 : 2.5
      }).addTo(mapa);

      znacznik.bindTooltip(p.etykieta, {
        permanent: true,
        direction: p.baza ? 'right' : 'left',
        offset: p.baza ? [10, 0] : [-10, 0],
        className: 'przystanek' + (p.baza ? ' baza' : '')
      });
    });

    mapa.fitBounds(L.latLngBounds(odcinek), { padding: [34, 34] });
  }

  /* budujemy dopiero, gdy mapa zbliża się do ekranu */
  if ('IntersectionObserver' in window) {
    const oko = new IntersectionObserver(function (wpisy, self) {
      if (!wpisy.some(w => w.isIntersecting)) return;
      self.disconnect();
      zbudujMape();
    }, { rootMargin: '200px' });

    oko.observe(pojemnik);
  } else {
    zbudujMape();
  }

  // po zmianie rozmiaru okna Leaflet musi przeliczyć kontener
  window.addEventListener('resize', function () {
    if (mapa) mapa.invalidateSize();
  });

})();
