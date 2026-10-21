(function () {
  'use strict';
  if (window.__dawnFallback) return;
  window.__dawnFallback = true;
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline:scroll()')) return;
  var html = document.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  var raf = 0;
  function on() { return html.getAttribute('data-style') !== 'minimal' && (html.getAttribute('data-skin') === 'dawn' || html.getAttribute('data-light') === 'dawn'); }
  function update() {
    raf = 0;
    if (!on()) return;
    var max = html.scrollHeight - innerHeight;
    var t = max > 0 ? Math.min(1, Math.max(0, (window.pageYOffset || html.scrollTop) / max)) : 0;
    html.style.setProperty('--dw-t', t.toFixed(4));
  }
  function req() { if (!raf) raf = requestAnimationFrame(update); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  req();
})();
