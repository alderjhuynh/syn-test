(function () {
  'use strict';

  var KEY = 'syn-skin', MODE_KEY = 'syn-mode', STYLE_KEY = 'syn-style';
  var MODES = [{ id: 'auto', name: 'Auto' }, { id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }];
  var STYLES = [{ id: 'minimal', name: 'Minimal' }, { id: 'maximal', name: 'Maximal' }];
  var SKINS = [
    { id: 'default',   name: 'Original',   css: null,        cssMin: null,      dots: ['#2a3fd6', '#111315'],
      dotsMin: ['#2a3fd6', '#111315'] },
    { id: 'riso',      name: 'Risograph',         css: 'riso',      cssMin: 'minimal', dots: ['#0078bf', '#ff48b0'],
      dotsMin: ['#0067b0', '#ff48b0'],
      fonts: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap' },
    { id: 'papercut',  name: 'Paper-cut strata',  css: 'papercut',  cssMin: 'minimal', dots: ['#e8a35a', '#5b7fa6'],
      dotsMin: ['#e8a35a', '#b39aa8'],
      fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..700,60&display=swap' },
    { id: 'grown',     name: 'Grown materials',   css: 'grown',     cssMin: 'minimal', dots: ['#b4673a', '#6f8f4e'],
      dotsMin: ['#b4562f', '#5f7f3e'],
      fonts: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&display=swap' },
    { id: 'dawn',      name: 'Dawn light',        css: 'dawn',      cssMin: 'minimal', dots: ['#ffb36b', '#2b2f5e'],
      dotsMin: ['#e8a35a', '#34408a'],
      fonts: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
      js: 'src/skins/dawn.js' }
  ];
  var FIRST_VISIT = 'papercut', FIRST_STYLE = 'maximal';

  var script = document.currentScript;
  var root = script ? new URL('../', script.src).href : '/';

  function byId(id) { for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i]; return null; }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(id) { try { localStorage.setItem(KEY, id); } catch (e) {} }
  function readMode() { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } }
  function writeMode(id) { try { localStorage.setItem(MODE_KEY, id); } catch (e) {} }
  function validMode(id) { return id === 'auto' || id === 'light' || id === 'dark'; }
  function readStyle() { try { return localStorage.getItem(STYLE_KEY); } catch (e) { return null; } }
  function writeStyle(id) { try { localStorage.setItem(STYLE_KEY, id); } catch (e) {} }
  function validStyle(id) { return id === 'minimal' || id === 'maximal'; }
  function cssFile(s, st) { return st === 'minimal' ? s.cssMin : s.css; }
  function cssHref(s, st) { var f = cssFile(s, st); return f ? root + 'css/skins/' + f + '.css' : null; }

  var m = /[?&]skin=([\w-]+)/.exec(location.search);
  var current = (m && byId(m[1]) && m[1]) || (byId(read()) && read()) || FIRST_VISIT;
  var html = document.documentElement;

  var sm = /[?&]style=(minimal|maximal)/.exec(location.search);
  var style = (sm && sm[1]) || (validStyle(readStyle()) && readStyle()) || FIRST_STYLE;

  var mm = /[?&]mode=(auto|light|dark)/.exec(location.search);
  var mode = (mm && mm[1]) || (validMode(readMode()) && readMode()) || 'auto';
  function applyMode(id) { if (id === 'auto') html.removeAttribute('data-theme'); else html.setAttribute('data-theme', id); }
  applyMode(mode);

  html.setAttribute('data-skin', current);
  html.setAttribute('data-style', style);
  var loadedCssHref = null, loadedFontsHref = null;
  (function () {
    var s = byId(current), href = cssHref(s, style);
    loadedCssHref = href;
    loadedFontsHref = s.fonts || null;
    if (s.fonts) document.write('<link rel="stylesheet" data-tsw href="' + s.fonts + '">');
    if (href) document.write('<link rel="stylesheet" data-tsw="skin" href="' + href + '">');
  })();

  function loadJs(s) {
    if (!s.js || document.querySelector('script[data-tsw-js="' + s.id + '"]')) return;
    var el = document.createElement('script'); el.src = root + s.js; el.setAttribute('data-tsw-js', s.id);
    document.head.appendChild(el);
  }
  if (style === 'maximal' && byId(current).js) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { loadJs(byId(current)); });
    else loadJs(byId(current));
  }

  var swapSeq = 0;

  function swapTo(id) {
    var s = byId(id); if (!s) return;
    var nextStyle = style;
    var href = cssHref(s, nextStyle);
    var fontsHref = s.fonts || null;
    var seq = ++swapSeq;
    var skinSame = href === loadedCssHref;
    var fontsSame = fontsHref === loadedFontsHref;

    current = id; write(id); render();

    function prune() {
      var old = document.querySelectorAll('link[data-tsw]');
      for (var i = 0; i < old.length; i++) {
        var h = old[i].href;
        if (h !== href && h !== fontsHref) old[i].remove();
      }
    }
    function commit() {
      if (seq !== swapSeq) return;
      html.setAttribute('data-style', nextStyle);
      html.setAttribute('data-skin', id);
      if (nextStyle === 'maximal') loadJs(s);
      prune();
    }

    if (skinSame && fontsSame) { commit(); return; }

    var pending = 0, done = false;
    function finish() {
      if (done) return; done = true;
      commit();
    }
    function oneDone() { pending--; if (pending <= 0) finish(); }
    function add(url, tag) {
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = url; l.setAttribute('data-tsw', tag);
      l.onload = oneDone; l.onerror = oneDone;
      document.head.appendChild(l); pending++;
    }

    if (!fontsSame) {
      loadedFontsHref = fontsHref;
      if (fontsHref) add(fontsHref, 'font');
    }
    if (!skinSame) {
      loadedCssHref = href;
      if (href) add(href, 'skin');
    }
    if (pending) setTimeout(finish, 1500); else finish();
  }

  function setMode(id) { if (!validMode(id)) return; mode = id; applyMode(id); writeMode(id); render(); }
  function setStyle(id) { if (!validStyle(id) || id === style) return; style = id; writeStyle(id); swapTo(current); }

  var CSS =
    '.tsw{position:fixed;z-index:60;left:max(12px,env(safe-area-inset-left,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));font:13px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f3f3f6;-webkit-font-smoothing:antialiased}' +
    '#gallery3d:not([hidden]) ~ .tsw{display:none}' +
    '.tsw *{box-sizing:border-box;margin:0}' +
    '.tsw button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}' +
    '.tsw .tsw-t{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#15151b;border:1px solid #3a3a47;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35)}' +
    '.tsw-t:hover{background:#1e1e27}' +
    '.tsw-k{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9a9aae}' +
    '.tsw-l{position:absolute;left:0;bottom:calc(100% + 8px);width:232px;padding:6px;background:#15151b;border:1px solid #3a3a47;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.45)}' +
    '.tsw-l[hidden]{display:none}' +
    '.tsw-h{padding:6px 8px 8px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9a9aae}' +
    '.tsw-o{display:flex;align-items:center;gap:10px;width:100%;padding:8px;border-radius:9px}' +
    '.tsw-o:hover{background:#23232d}' +
    '.tsw-o[aria-pressed=true]{background:#2b2b38;box-shadow:inset 0 0 0 1px #5b5b72}' +
    '.tsw-d{position:relative;flex:none;width:26px;height:16px}' +
    '.tsw-d i{position:absolute;top:0;width:16px;height:16px;border-radius:50%;mix-blend-mode:screen}' +
    '.tsw-d i:first-child{left:0}.tsw-d i:last-child{left:10px}' +
    '.tsw-m,.tsw-s{display:flex;margin:0 2px 6px;padding:3px;gap:3px;background:#0e0e13;border:1px solid #33333f;border-radius:10px}' +
    '.tsw-m button,.tsw-s button{flex:1;padding:6px 0;text-align:center;border-radius:7px;font-size:12px;color:#b8b8cb}' +
    '.tsw-m button:hover,.tsw-s button:hover{background:#23232d}' +
    '.tsw-m button[aria-pressed=true],.tsw-s button[aria-pressed=true]{background:#f3f3f6;color:#15151b;font-weight:600}' +
    '.tsw-n{flex:1}' +
    '.tsw-e{flex:none;font-size:10px;padding:1px 6px;border:1px solid #4a4a5c;border-radius:99px;color:#9a9aae}' +
    '.tsw :focus-visible{outline:2px solid #8fa2ff;outline-offset:2px}';

  var box, toggle, list;

  function render() {
    if (!box) return;
    var s = byId(current);
    toggle.querySelector('b').textContent = s.name + (mode === 'auto' ? '' : ' \u00b7 ' + mode);
    var badge = toggle.querySelector('.tsw-e');
    badge.textContent = current === 'default' ? 'Base' : (style === 'minimal' ? 'Min' : 'Max');
    badge.title = current === 'default' ? 'Original has no style variant' : (style === 'minimal' ? 'Happy medium' : 'Current skins');
    var ss = list.querySelectorAll('.tsw-s button');
    for (var k = 0; k < ss.length; k++) ss[k].setAttribute('aria-pressed', ss[k].getAttribute('data-style') === style ? 'true' : 'false');
    var ms = list.querySelectorAll('.tsw-m button');
    for (var j = 0; j < ms.length; j++) ms[j].setAttribute('aria-pressed', ms[j].getAttribute('data-mode') === mode ? 'true' : 'false');
    var btns = list.querySelectorAll('.tsw-o');
    for (var i = 0; i < btns.length; i++) {
      var id = btns[i].getAttribute('data-id'), skin = byId(id);
      var dots = (style === 'minimal' ? (skin.dotsMin || skin.dots) : skin.dots);
      var sw = btns[i].querySelectorAll('.tsw-d i');
      sw[0].style.background = dots[0]; sw[1].style.background = dots[1];
      btns[i].setAttribute('aria-pressed', id === current ? 'true' : 'false');
    }
  }
  function setOpen(o) { list.hidden = !o; toggle.setAttribute('aria-expanded', o ? 'true' : 'false'); }

  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    box = document.createElement('div'); box.className = 'tsw';
    box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Theme switcher');
    toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'tsw-t';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'tsw-list');
    toggle.innerHTML = '<span class="tsw-k">theme</span></span>';
    list = document.createElement('div'); list.className = 'tsw-l'; list.id = 'tsw-list'; list.hidden = true;
    var items = '<div class="tsw-h">Style</div><div class="tsw-s" role="group" aria-label="Minimal or maximal">';
    STYLES.forEach(function (s) { items += '<button type="button" data-style="' + s.id + '" aria-pressed="false">' + s.name + '</button>'; });
    items += '</div><div class="tsw-h">Mode</div><div class="tsw-m" role="group" aria-label="Light or dark">';
    MODES.forEach(function (m) { items += '<button type="button" data-mode="' + m.id + '" aria-pressed="false">' + m.name + '</button>'; });
    items += '</div><div class="tsw-h">Skins</div>';
    SKINS.forEach(function (s) {
      var dots = style === 'minimal' ? (s.dotsMin || s.dots) : s.dots;
      items += '<button type="button" class="tsw-o" data-id="' + s.id + '" aria-pressed="false">' +
        '<span class="tsw-d"><i style="background:' + dots[0] + '"></i><i style="background:' + dots[1] + '"></i></span>' +
        '<span class="tsw-n">' + s.name + '</span>' + (s.empty ? '<span class="tsw-e">empty</span>' : '') + '</button>';
    });
    list.innerHTML = items;
    box.appendChild(toggle); box.appendChild(list); document.body.appendChild(box);

    toggle.addEventListener('click', function () { setOpen(list.hidden); });
    list.addEventListener('click', function (e) {
      var sb = e.target.closest('.tsw-s button');
      if (sb) { setStyle(sb.getAttribute('data-style')); return; }
      var mb = e.target.closest('.tsw-m button');
      if (mb) { setMode(mb.getAttribute('data-mode')); return; }
      var b = e.target.closest('.tsw-o'); if (!b) return;
      swapTo(b.getAttribute('data-id'));
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) setOpen(false); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); toggle.focus(); } });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();