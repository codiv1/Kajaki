/* ============================================================
   FORMULARZ KONTAKTOWY — walidacja i ekran potwierdzenia
   Uwaga: formularz nie ma jeszcze backendu — po wysłaniu
   pokazuje tylko potwierdzenie. Podłącz akcję serwerową
   w miejscu oznaczonym niżej.
   ============================================================ */

(function () {
  'use strict';

  const formularz = document.getElementById('formularz');
  const wyslano = document.getElementById('wyslano');
  const reset = document.getElementById('wyslano-reset');

  if (!formularz || !wyslano) return;

  formularz.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!formularz.checkValidity()) {
      formularz.reportValidity();
      return;
    }

    // === tutaj podepnij wysyłkę (fetch do API / usługi formularzy) ===

    formularz.hidden = true;
    wyslano.hidden = false;
    wyslano.focus();
  });

  reset.addEventListener('click', function () {
    formularz.reset();
    wyslano.hidden = true;
    formularz.hidden = false;
    formularz.querySelector('input').focus();
  });

})();
