'use strict';

window.MODEL_BUILDERS = window.MODEL_BUILDERS || {};
window.MODEL_THUMBS = window.MODEL_THUMBS || {};

window.MODEL_BUILDERS.satellite = function (T, opts) {
  var accent = (opts && opts.color) || '#9fb4ee';
  var INK = '#1f2633';
  var g = new T.Group();
  var edgeMat = new T.LineBasicMaterial({ color: INK });

  function tex(w, h, fn) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }
  function part(geo, mat, x, y, z, parent, noEdge) {
    var m = new T.Mesh(geo, mat instanceof T.Material ? mat : new T.MeshBasicMaterial({ color: mat }));
    m.position.set(x, y, z);
    if (!noEdge) m.add(new T.LineSegments(new T.EdgesGeometry(geo, 30), edgeMat));
    (parent || g).add(m);
    return m;
  }

  // solar cells: dark blue grid
  var solarTex = tex(256, 128, function (x, w, h) {
    x.fillStyle = '#1d3f8a'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#6f93d8'; x.lineWidth = 3;
    for (var i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8, h); x.stroke(); }
    for (var j = 0; j <= 4; j++) { x.beginPath(); x.moveTo(0, j * h / 4); x.lineTo(w, j * h / 4); x.stroke(); }
    x.strokeStyle = '#e8eefc'; x.lineWidth = 8; x.strokeRect(0, 0, w, h);
  });
  // radiator: white panel with the coolant lines showing
  var radTex = tex(256, 256, function (x, w, h) {
    x.fillStyle = '#f4f5f6'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#ff8a4a'; x.lineWidth = 6;
    for (var i = 0; i < 7; i++) { var yy = 22 + i * 35; x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
    x.strokeStyle = '#aeb5be'; x.lineWidth = 3;
    for (var k = 0; k < 7; k++) { var yk = 40 + k * 35; x.beginPath(); x.moveTo(0, yk); x.lineTo(w, yk); x.stroke(); }
    x.strokeStyle = '#8b929b'; x.lineWidth = 8; x.strokeRect(0, 0, w, h);
  });

  var Y = .44;   // bus centre height

  // 1. display stand
  part(new T.CylinderGeometry(.14, .15, .03, 28), '#15171a', 0, .015, 0);
  part(new T.CylinderGeometry(.018, .018, .24, 10), '#7d8794', 0, .15, 0);
  part(new T.CylinderGeometry(.05, .05, .02, 18), '#b9c0ca', 0, .27, 0);

  // 2. gold-foil bus
  part(new T.BoxGeometry(.24, .26, .24), '#d9a83a', 0, Y, 0);
  part(new T.BoxGeometry(.25, .015, .25), '#8a6a1c', 0, Y - .1, 0, null, true);
  part(new T.BoxGeometry(.25, .015, .25), '#8a6a1c', 0, Y + .1, 0, null, true);

  // 3. compute module on the front: dark rack faces with status lights
  part(new T.BoxGeometry(.17, .17, .03), '#2b3340', 0, Y, .135);
  for (var r = 0; r < 4; r++) {
    part(new T.BoxGeometry(.14, .02, .01), '#3d4858', 0, Y - .06 + r * .04, .155, null, true);
    part(new T.BoxGeometry(.012, .012, .012), r % 2 ? '#6fbf7f' : accent, .055, Y - .06 + r * .04, .163, null, true);
  }

  // 4. solar arrays (XY plane) on booms
  [-1, 1].forEach(function (s) {
    part(new T.CylinderGeometry(.008, .008, .06, 8), '#7d8794', s * .15, Y, 0, null, true).rotation.z = Math.PI / 2;
    var panel = new T.Mesh(new T.BoxGeometry(.3, .22, .008), [
      new T.MeshBasicMaterial({ color: '#e8eefc' }), new T.MeshBasicMaterial({ color: '#e8eefc' }),
      new T.MeshBasicMaterial({ color: '#e8eefc' }), new T.MeshBasicMaterial({ color: '#e8eefc' }),
      new T.MeshBasicMaterial({ map: solarTex }), new T.MeshBasicMaterial({ map: solarTex })
    ]);
    panel.position.set(s * .33, Y, 0);
    panel.add(new T.LineSegments(new T.EdgesGeometry(panel.geometry), edgeMat));
    g.add(panel);
  });

  // 5. radiators (YZ plane): the point of the exhibit, waste heat goes to space
  [-1, 1].forEach(function (s) {
    var radMat = new T.MeshBasicMaterial({ map: radTex });
    var side = new T.MeshBasicMaterial({ color: '#d9dde3' });
    var panel = new T.Mesh(new T.BoxGeometry(.008, .28, .3), [radMat, radMat, side, side, side, side]);
    panel.position.set(0, Y, s * .35);
    panel.add(new T.LineSegments(new T.EdgesGeometry(panel.geometry), edgeMat));
    g.add(panel);
    // coolant lines from bus to panel
    [-.07, .07].forEach(function (dy) {
      part(new T.CylinderGeometry(.009, .009, .08, 8), '#ff7a3d', 0, Y + dy, s * .16, null, true).rotation.x = Math.PI / 2;
    });
  });

  // 6. comms dish and star tracker on top
  part(new T.CylinderGeometry(.012, .012, .08, 8), '#7d8794', 0, Y + .17, 0, null, true);
  var dish = part(new T.SphereGeometry(.1, 20, 8, 0, Math.PI * 2, 0, .75), new T.MeshBasicMaterial({ color: '#f2f4f8', side: T.DoubleSide }), 0, Y + .27, 0, null, true);
  dish.rotation.x = Math.PI - .35;
  dish.position.y = Y + .3;
  part(new T.CylinderGeometry(.006, .006, .09, 6), '#7d8794', 0, Y + .3, .035, null, true).rotation.x = .35;
  part(new T.CylinderGeometry(.022, .026, .05, 12), '#15171a', -.07, Y + .15, -.06);

  return g;
};

// front schematic for the 2D card
window.MODEL_THUMBS.satellite = function (x, W, H) {
  var cx = W / 2, u = W / 100, cy = H / u * .52;
  function rect(c, rx, ry, rw, rh) { x.fillStyle = c; x.fillRect(cx + rx * u, (cy + ry) * u, rw * u, rh * u); }
  rect('#15171a', -14, 34, 28, 3);
  rect('#7d8794', -1.5, 8, 3, 28);
  // radiators, seen at an angle behind the bus
  x.fillStyle = '#f4f5f6'; x.strokeStyle = '#8b929b'; x.lineWidth = u * .6;
  [[-1, 1]].forEach(function () {});
  x.beginPath(); x.moveTo(cx + 12 * u, (cy - 16) * u); x.lineTo(cx + 24 * u, (cy - 26) * u); x.lineTo(cx + 24 * u, (cy + 6) * u); x.lineTo(cx + 12 * u, (cy + 14) * u); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(cx - 12 * u, (cy - 16) * u); x.lineTo(cx - 24 * u, (cy - 26) * u); x.lineTo(cx - 24 * u, (cy + 6) * u); x.lineTo(cx - 12 * u, (cy + 14) * u); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = '#ff8a4a'; x.lineWidth = u * .8;
  for (var i = 0; i < 4; i++) {
    x.beginPath(); x.moveTo(cx + 12 * u, (cy - 11 + i * 7) * u); x.lineTo(cx + 24 * u, (cy - 21 + i * 7) * u); x.stroke();
    x.beginPath(); x.moveTo(cx - 12 * u, (cy - 11 + i * 7) * u); x.lineTo(cx - 24 * u, (cy - 21 + i * 7) * u); x.stroke();
  }
  // solar arrays
  [-1, 1].forEach(function (s) {
    var x0 = s > 0 ? 15 : -45;
    rect('#1d3f8a', x0, -14, 30, 24);
    x.strokeStyle = '#6f93d8'; x.lineWidth = u * .5;
    for (var k = 1; k < 6; k++) { x.beginPath(); x.moveTo(cx + (x0 + k * 5) * u, (cy - 14) * u); x.lineTo(cx + (x0 + k * 5) * u, (cy + 10) * u); x.stroke(); }
    for (var j = 1; j < 3; j++) { x.beginPath(); x.moveTo(cx + x0 * u, (cy - 14 + j * 8) * u); x.lineTo(cx + (x0 + 30) * u, (cy - 14 + j * 8) * u); x.stroke(); }
  });
  rect('#d9a83a', -13, -15, 26, 28);
  rect('#2b3340', -9, -9, 18, 16);
  rect('#6fbf7f', 5, -6, 2, 2);
  // dish
  x.fillStyle = '#f2f4f8'; x.beginPath(); x.ellipse(cx, (cy - 24) * u, 9 * u, 4 * u, 0, 0, 6.3); x.fill();
  rect('#7d8794', -.8, -22, 1.6, 7);
};
