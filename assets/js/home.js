(function () {
  var A = window.FR, strip = document.getElementById('strip');
  var cards = [].slice.call(strip.querySelectorAll('.card'));
  var bgs = [].slice.call(document.querySelectorAll('.bg-img'));
  var name = document.getElementById('bigName');
  var cNow = document.getElementById('cNow'), cBar = document.getElementById('cBar');
  var mobile = window.matchMedia('(max-width:760px)');
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cur = 0, front = 0, auto = null;

  // Precarga de fondos para que el cambio sea instantáneo
  window.addEventListener('load', function () {
    if (!mobile.matches) return;
    A.forEach(function (a) { var i = new Image(); i.src = '/assets/img/' + a.slug + '.webp'; });
  });

  function setActive(i) {
    if (i === cur) return;
    cur = i;
    var a = A[i];
    cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
    if (!mobile.matches) return finish(a, i);
    var next = bgs[1 - front];
    next.style.objectPosition = a.pos;
    next.style.setProperty('--mz', a.mz || 1);
    next.style.setProperty('--mo', a.mo || '50% 100%');
    next.src = '/assets/img/' + a.slug + '.webp';
    var show = function () { next.classList.add('is-on'); bgs[front].classList.remove('is-on'); front = 1 - front; };
    if (next.complete && next.naturalWidth) show(); else next.onload = show;
    finish(a, i);
  }

  function finish(a, i) {
    name.textContent = a.nombre;
    name.classList.remove('swap'); void name.offsetWidth; name.classList.add('swap');
    cNow.textContent = String(i + 1).padStart(2, '0');
    cBar.style.transform = 'translateX(' + (i * 100) + '%)';
  }

  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }

  // Escritorio: pasar el cursor activa; clic abre la ficha
  cards.forEach(function (c, i) {
    c.addEventListener('mouseenter', function () { if (!mobile.matches) { stopAuto(); setActive(i); } });
    c.addEventListener('focus', function () { stopAuto(); if (!mobile.matches) setActive(i); });
    c.addEventListener('click', function (e) {
      if (mobile.matches && i !== cur) { e.preventDefault(); center(i); }
    });
  });

  // Móvil: la tarjeta centrada en la tira es la activa
  function center(i) {
    var c = cards[i];
    strip.scrollTo({ left: c.offsetLeft - (strip.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }
  var ticking = false;
  strip.addEventListener('scroll', function () {
    if (!mobile.matches || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var mid = strip.scrollLeft + strip.clientWidth / 2, best = 0, d = 1e9;
      cards.forEach(function (c, k) {
        var dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (dd < d) { d = dd; best = k; }
      });
      setActive(best);
    });
  }, { passive: true });

  // Escritorio: pasa solo de artista hasta que el usuario interactúa
  if (!reduce && !mobile.matches) {
    auto = setInterval(function () { setActive((cur + 1) % A.length); }, 4500);
    strip.addEventListener('mouseenter', stopAuto);
  }
})();
