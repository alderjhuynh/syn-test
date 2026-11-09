'use strict';

window.MODEL_BUILDERS = window.MODEL_BUILDERS || {};
window.MODEL_THUMBS = window.MODEL_THUMBS || {};

window.MODEL_BUILDERS.fusion = function (T, opts) {
  var accent = (opts && opts.color) || '#2fb3c4';
  var INK = '#1f2633';
  var g = new T.Group();

  function mat(c, o) { return new T.MeshBasicMaterial(Object.assign({ color: c }, o || {})); }
  var edgeMat = new T.LineBasicMaterial({ color: INK });

  function part(geo, color, x, y, z, o) {
    var m = new T.Mesh(geo, mat(color, o && o.mat));
    m.position.set(x, y, z);
    if (o && o.rx) m.rotation.x = o.rx;
    if (o && o.rz) m.rotation.z = o.rz;
    if (o && o.sy) m.scale.y = o.sy;
    if (!(o && o.noEdge)) m.add(new T.LineSegments(new T.EdgesGeometry(geo, 30), edgeMat));
    (o && o.parent || g).add(m);
    return m;
  }

  var CORE_Y = .43;
  var R = .16; 

  part(new T.CylinderGeometry(.46, .46, .05, 40), '#d9dde3', 0, .025, 0);
  part(new T.CylinderGeometry(.42, .42, .02, 40), '#b9c0ca', 0, .06, 0);
  [0, 1, 2, 3].forEach(function (i) {
    var a = i * Math.PI / 2 + Math.PI / 4;
    part(new T.BoxGeometry(.06, .035, .035), '#8b929b', Math.cos(a) * .46, .03, Math.sin(a) * .46, { noEdge: false }).rotation.y = -a;
  });

  // seawater lithium blanket / tritium breeding tank
  part(new T.CylinderGeometry(.27, .3, .12, 32), accent, 0, .13, 0);
  part(new T.CylinderGeometry(.285, .285, .015, 32), '#f2f4f8', 0, .2, 0);

  // central solenoid
  part(new T.CylinderGeometry(.045, .045, .5, 20), '#7d8794', 0, CORE_Y, 0);
  part(new T.CylinderGeometry(.06, .06, .03, 20), '#15171a', 0, CORE_Y + .26, 0);

  // plasma ring
  var plasma = new T.Mesh(
    new T.TorusGeometry(R, .045, 14, 40),
    mat('#ffb24a', { transparent: true, opacity: .95 })
  );
  plasma.rotation.x = Math.PI / 2;
  plasma.position.y = CORE_Y;
  g.add(plasma);
  var core = new T.Mesh(new T.TorusGeometry(R, .018, 8, 40), mat('#fff4d6'));
  core.rotation.x = Math.PI / 2;
  core.position.y = CORE_Y;
  g.add(core);

  // toroidal field coils
  var N = 16;
  for (var i = 0; i < N; i++) {
    var holder = new T.Group();
    holder.rotation.y = i * 2 * Math.PI / N;
    g.add(holder);
    var coil = part(new T.TorusGeometry(.12, .014, 8, 24), i % 2 ? '#2b3340' : '#3a4454',
      R, CORE_Y, 0, { parent: holder, sy: 1.55, noEdge: true });
    coil.position.set(R, CORE_Y, 0);
  }

  // top cryostat lid
  part(new T.CylinderGeometry(.19, .19, .03, 32), '#d9dde3', 0, CORE_Y + .3, 0);
  part(new T.CylinderGeometry(.1, .12, .035, 24), '#b9c0ca', 0, CORE_Y + .33, 0);

  // intake pipe and heat-exchanger drum
  var water = '#3a86c8';
  part(new T.CylinderGeometry(.085, .085, .26, 20), '#f2f4f8', .34, .21, 0);
  part(new T.CylinderGeometry(.088, .088, .03, 20), water, .34, .15, 0);
  part(new T.CylinderGeometry(.088, .088, .03, 20), water, .34, .27, 0);

  // pipes from housing to drum and up to the core
  part(new T.CylinderGeometry(.018, .018, .12, 10), water, .26, .13, 0, { rz: Math.PI / 2 });
  part(new T.CylinderGeometry(.018, .018, .14, 10), water, .26, .27, 0, { rz: Math.PI / 2, noEdge: true });

  // desalination column 
  part(new T.CylinderGeometry(.075, .075, .09, 18), '#e6f1f8', -.35, .12, .05);
  part(new T.CylinderGeometry(.065, .065, .09, 18), '#cfe4f1', -.35, .21, .05);
  part(new T.CylinderGeometry(.055, .055, .09, 18), '#b8d7ea', -.35, .30, .05);
  part(new T.CylinderGeometry(.018, .018, .12, 10), '#6fc0e8', -.3, .15, .03, { rz: Math.PI / 2 });

  // aquaculture tank + district heat line
  part(new T.BoxGeometry(.2, .07, .12), '#6fbf7f', .0, .105, -.36);
  part(new T.BoxGeometry(.17, .012, .09), '#bfe9c8', 0, .145, -.36, { noEdge: true });
  part(new T.CylinderGeometry(.014, .014, .22, 10), '#c46a4a', -.16, .09, -.3, { rz: Math.PI / 2, noEdge: true }).rotation.y = .6;

  return g;
};

window.MODEL_THUMBS.fusion = function (x, W, H) {
  var cx = W / 2, u = W / 100;
  function rect(c, rx, ry, rw, rh) { x.fillStyle = c; x.fillRect(cx + rx * u, ry * u, rw * u, rh * u); }
  function ell(c, ex, ey, ew, eh, lw) {
    x.beginPath(); x.ellipse(cx + ex * u, ey * u, ew * u, eh * u, 0, 0, 6.3);
    if (lw) { x.lineWidth = lw * u; x.strokeStyle = c; x.stroke(); } else { x.fillStyle = c; x.fill(); }
  }
  var base = H / u - 12;
  rect('#d9dde3', -36, base - 4, 72, 4);
  rect('#2fb3c4', -23, base - 14, 46, 10);
  rect('#7d8794', -3.5, base - 56, 7, 42);
  for (var i = 0; i < 9; i++) ell('#2b3340', 0, base - 36, 8 + i * 2.4, 22, .9);
  ell('#ffb24a', 0, base - 36, 15, 4.5, 3.6);
  rect('#d9dde3', -17, base - 62, 34, 3);
  rect('#f2f4f8', 26, base - 30, 9, 22);
  rect('#3a86c8', 26, base - 20, 9, 2.5);
  rect('#b8d7ea', -42, base - 24, 9, 20);
  rect('#6fbf7f', -12, base - 9, 24, 4.5);
};
