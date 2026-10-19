// the gallery itself

'use strict';

var DIRS = {
  North: { x: 0, z: -1 },
  East: { x: 1, z: 0 },
  South: { x: 0, z: 1 },
  West: { x: -1, z: 0 }
};

function wrapText(x, text, px, py, maxW, lh, align) {
  var words = text.split(' ');
  var line = '';
  x.textAlign = align || 'left';

  for (var i = 0; i < words.length; i++) {
    var candidate = line ? line + ' ' + words[i] : words[i];

    if (x.measureText(candidate).width > maxW && line) {
      x.fillText(line, px, py);
      line = words[i];
      py += lh;
    } else {
      line = candidate;
    }
  }

  x.fillText(line, px, py);
  return py;
}

var MODEL_HEIGHT = 2.2;
var MODEL_Y = .8;

function startWorld(qk, pose) {
  var T = window.THREE;
  var Q = QUALITY[qk];
  var host = $('#gl-host');

  // renderer
  var renderer = new T.WebGLRenderer({
    antialias: Q.aa,
    powerPreference: 'high-performance'
  });
  var canvas = renderer.domElement;
  host.appendChild(canvas);

  // scene and camera
  var scene = new T.Scene();
  scene.background = new T.Color('#e8e9eb');
  scene.fog = new T.Fog('#e8e9eb', Q.fog[0], Q.fog[1]);

  var camera = new T.PerspectiveCamera(coarse ? 75 : 70, 1, .2, 70);
  camera.rotation.order = 'YXZ';

  var scale = 1;
  var maxAniso = Math.min(Q.aniso, renderer.capabilities.getMaxAnisotropy());

  function applySize() {
    var w = host.clientWidth || innerWidth;
    var h = host.clientHeight || innerHeight;

    renderer.setPixelRatio(Q.pr * scale);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  applySize();

  // draw a canvas texture at runtime
  function tex(w, h, draw, repeat) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);

    var t = new T.CanvasTexture(c);
    t.anisotropy = maxAniso;

    if (repeat) {
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
    }

    return t;
  }

  // room and mesh bookkeeping
  var rooms = [];
  var byId = {};
  var walls = [];
  var paints = [];
  var spin = [];

  function mkRoom(id, name, x0, z0, x1, z1, wall, floor) {
    var r = {
      id: id,
      name: name,
      x0: x0,
      z0: z0,
      x1: x1,
      z1: z1,
      wall: wall,
      floor: floor,
      group: new T.Group(),
      pools: [],

      // one wall material per room, with a painted gradient and baseboard
      wallMat: new T.MeshBasicMaterial({
        map: tex(64, 256, function (x, w, h) {
          var g = x.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, shade(wall, -.12));
          g.addColorStop(.25, wall);
          g.addColorStop(.85, shade(wall, -.06));
          g.addColorStop(1, shade(wall, -.3));
          x.fillStyle = g;
          x.fillRect(0, 0, w, h);

          x.fillStyle = shade(wall, -.38);
          x.fillRect(0, h * .955, w, h * .045);

          x.fillStyle = shade(wall, .4);
          x.fillRect(0, h * .95, w, 2);
        })
      })
    };

    scene.add(r.group);
    rooms.push(r);
    byId[id] = r;
    return r;
  }

  function add(room, mesh) {
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    room.group.add(mesh);
    return mesh;
  }

  function wallBox(room, ax, az, bx, bz, noCollide) {
    var h = .2;
    var x0 = Math.min(ax, bx) - h;
    var x1 = Math.max(ax, bx) + h;
    var z0 = Math.min(az, bz) - h;
    var z1 = Math.max(az, bz) + h;

    if (!noCollide) {
      walls.push({ x0: x0, x1: x1, z0: z0, z1: z1 });
    }

    var m = new T.Mesh(new T.BoxGeometry(x1 - x0, 5, z1 - z0), room.wallMat);
    m.position.set((x0 + x1) / 2, 2.5, (z0 + z1) / 2);
    add(room, m);
  }

  function plane(room, w, h, map, x, y, z, yaw, opts) {
    var m = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial(Object.assign({ map: map }, DEC, opts || {}))
    );

    m.position.set(x, y, z);
    m.rotation.y = yaw;
    return add(room, m);
  }

  // polygon offset keeps coplanar details from z-fighting
  var DEC = {
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  };

  function MB(o) {
    return new T.MeshBasicMaterial(Object.assign({}, DEC, o));
  }

  var frameMat = new T.MeshBasicMaterial({ color: '#17191c' });
  var whiteMat = MB({ color: '#ffffff' });

  var glowTex = tex(128, 128, function (x, w, h) {
    var g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,238,205,.85)');
    g.addColorStop(1, 'rgba(255,238,205,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  });

  // atrium
  var A = mkRoom('atrium', 'Atrium', -10, -10, 10, 10, '#e9eef5', FLOOR);
  A.doors = ['x0', 'x1', 'z0', 'z1'];

  wallBox(A, -10, -10, -2, -10);
  wallBox(A, 2, -10, 10, -10);
  wallBox(A, -10, 10, -2, 10);
  wallBox(A, 2, 10, 10, 10);
  wallBox(A, -10, -10, -10, -2);
  wallBox(A, -10, 2, -10, 10);
  wallBox(A, 10, -10, 10, -2);
  wallBox(A, 10, 2, 10, 10);

  A.pools.push({ x: 0, z: 0, r: 8, a: .55 });

  // wings
  WINGS.forEach(function (w) {
    var d = DIRS[w.compass];
    var r = { x: -d.z, z: d.x };

    // wing-local coordinates: u runs down the wing, v runs sideways
    function toW(u, v) {
      return {
        x: d.x * (10 + u) + r.x * v,
        z: d.z * (10 + u) + r.z * v
      };
    }

    var a = toW(0, -8);
    var b = toW(18, 8);
    var room = mkRoom(
      w.id,
      w.name,
      Math.min(a.x, b.x),
      Math.min(a.z, b.z),
      Math.max(a.x, b.x),
      Math.max(a.z, b.z),
      w.wall,
      FLOOR
    );

    var doorSide;
    if (d.x === 1) doorSide = 'x0';
    else if (d.x === -1) doorSide = 'x1';
    else if (d.z === 1) doorSide = 'z0';
    else doorSide = 'z1';
    room.doors = [doorSide];

    var p0 = toW(.4, -8);
    var p1 = toW(18, -8);
    var p2 = toW(.4, 8);
    var p3 = toW(18, 8);

    wallBox(room, p0.x, p0.z, p1.x, p1.z);
    wallBox(room, p2.x, p2.z, p3.x, p3.z);

    // south far wall: visible but no collision (secret passage to the hidden room)
    wallBox(room, p1.x, p1.z, p3.x, p3.z, w.id === 'south');

    var inward = Math.atan2(-d.x, -d.z);

    // door lintel and sign (in the atrium)
    var dc = toW(0, 0);
    var horiz = Math.abs(d.x) > 0;
    var lg = new T.BoxGeometry(horiz ? .4 : 3.6, 1.2, horiz ? 3.6 : .4);
    var uv = lg.attributes.uv;

    // squeeze the box UVs into the top of the wall texture so the lintel matches
    for (var q = 0; q < uv.count; q++) {
      uv.setY(q, .76 + uv.getY(q) * .24);
    }

    var lint = new T.Mesh(lg, A.wallMat);
    lint.position.set(dc.x, 4.4, dc.z);
    add(A, lint);

    var sp = toW(-.3, 0);
    plane(A, 3.4, .7, tex(512, 128, function (x, tw, th) {
      x.fillStyle = '#15171a';
      x.fillRect(0, 0, tw, th);

      x.fillStyle = '#ffffff';
      x.textBaseline = 'middle';
      x.textAlign = 'center';

      x.font = '700 46px "Schibsted Grotesk", system-ui, sans-serif';
      x.fillText(w.name, tw / 2, 52);

      x.font = '400 17px "DM Mono", monospace';
      x.fillText(w.where.toUpperCase(), tw / 2, 100);
    }), sp.x, 4.4, sp.z, inward);

    // paintings
    ARTS.filter(function (s) {
      return s.wing === w.id;
    }).forEach(function (art, i) {
      var side = i === 0 ? -1 : 1;
      var u = i === 0 ? 6 : 11;
      var base = toW(u, side * 7.8);
      var n = { x: -side * r.x, z: -side * r.z };
      var yaw = Math.atan2(n.x, n.z);
      var tx = -n.z;
      var tz = n.x;

      function put(mesh, off, lat, y) {
        mesh.position.set(
          base.x + n.x * off + tx * lat,
          y,
          base.z + n.z * off + tz * lat
        );
        mesh.rotation.y = yaw;
        return add(room, mesh);
      }

      // additive glow
      put(new T.Mesh(
        new T.PlaneGeometry(6, 6.4),
        new T.MeshBasicMaterial({
          map: glowTex,
          transparent: true,
          depthWrite: false,
          blending: T.AdditiveBlending,
          opacity: .55,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1
        })
      ), .03, 0, 2.6);

      // frame
      put(new T.Mesh(new T.BoxGeometry(2.5, 3.1, .1), frameMat), .05, 0, 2.5);

      // white mat
      put(new T.Mesh(new T.PlaneGeometry(2.28, 2.88), whiteMat), .112, 0, 2.5);

      // painting
      put(new T.Mesh(
        new T.PlaneGeometry(1.96, 2.45),
        MB({
          map: tex(Q.tex, Q.tex, function (x, tw, th) {
            paint(x, tw, th, art);
          })
        })
      ), .124, 0, 2.5);

      // placard
      put(new T.Mesh(
        new T.PlaneGeometry(1.1, .55),
        MB({
          map: tex(256, 128, function (x, tw, th) {
            x.fillStyle = '#15171a';
            x.fillRect(0, 0, tw, th);
            x.fillStyle = '#f4f5f6';
            x.textBaseline = 'top';
            x.textAlign = 'left';

            x.font = '400 15px "DM Mono", monospace';
            x.fillText(art.id + '  ' + art.year, 14, 12);

            x.font = '500 22px "Schibsted Grotesk", system-ui, sans-serif';
            wrapText(x, art.title, 14, 40, tw - 28, 26);
          })
        })
      ), .05, 1.7, 1.1);

      paints.push({
        art: art,
        x: base.x + n.x * .1,
        z: base.z + n.z * .1,
        n: n,
        room: room.id
      });

      var fp = toW(u, side * (7.8 - 2.4));
      room.pools.push({ x: fp.x, z: fp.z, r: 3.4, a: .5 });
    });

    // title wall
    var tw = toW(17.7, 0);
    plane(room, 8, 2, tex(1024, 256, function (x, cw, ch) {
      x.fillStyle = shade(w.wall, -.5);
      x.textBaseline = 'alphabetic';
      x.textAlign = 'center';

      x.font = '700 112px "Schibsted Grotesk", system-ui, sans-serif';
      x.fillText(w.name, cw / 2, 150);

      x.font = '400 34px "DM Mono", monospace';
      x.fillText(w.where.toUpperCase(), cw / 2, 205);
    }), tw.x, 3, tw.z, inward, { transparent: true });

    var ep = toW(15.2, 0);
    room.pools.push({ x: ep.x, z: ep.z, r: 5, a: .3 });

    // plinth with sculpture
    var pc = toW(9, 0);

    var plinth = new T.Mesh(
      new T.BoxGeometry(.9, 1.1, .9),
      new T.MeshBasicMaterial({ color: '#f2f4f8' })
    );
    plinth.position.set(pc.x, .55, pc.z);
    add(room, plinth);

    var cap = new T.Mesh(
      new T.BoxGeometry(1, .08, 1),
      new T.MeshBasicMaterial({ color: '#15171a' })
    );
    cap.position.set(pc.x, 1.14, pc.z);
    add(room, cap);

    walls.push({
      x0: pc.x - .55,
      x1: pc.x + .55,
      z0: pc.z - .55,
      z1: pc.z + .55
    });

    var geo;
    if (w.id === 'west') geo = new T.TorusGeometry(.34, .1, 12, 24);
    else if (w.id === 'south') geo = new T.SphereGeometry(.4, 16, 12);
    else if (w.id === 'east') geo = new T.ConeGeometry(.36, .8, 6);
    else geo = new T.IcosahedronGeometry(.42, 0);

    var sc = new T.Mesh(geo, new T.MeshBasicMaterial({ color: w.color }));
    sc.position.set(pc.x, 1.68, pc.z);
    sc.add(new T.LineSegments(
      new T.EdgesGeometry(geo),
      new T.LineBasicMaterial({ color: '#1f2633' })
    ));

    room.group.add(sc);
    spin.push({ m: sc, s: .6 });
    room.pools.push({ x: pc.x, z: pc.z, r: 3.2, a: .55 });
  });

  // hidden room, reached by walking through the far wall of the south wing
  // (that wall has no collision)
  var HID = { x0: -8, z0: 28, x1: 8, z1: 40 };
  var H = mkRoom('hidden', 'Hidden Room', HID.x0, HID.z0, HID.x1, HID.z1, '#eee9f3', FLOOR);
  H.doors = [];

  wallBox(H, HID.x0, HID.z0, HID.x0, HID.z1);
  wallBox(H, HID.x1, HID.z0, HID.x1, HID.z1);
  wallBox(H, HID.x0, HID.z1, HID.x1, HID.z1);

  var HC = { x: (HID.x0 + HID.x1) / 2, z: (HID.z0 + HID.z1) / 2 };
  H.pools.push({ x: HC.x, z: HC.z, r: 6, a: .6 });

  var hGroup = new T.Group();
  hGroup.position.set(HC.x, 0, HC.z);
  H.group.add(hGroup);

  var stopped = false;

  if (T.FBXLoader) {
    new T.FBXLoader().load('assets/shork/Shork.fbx', function (obj) {
      if (stopped) return;

      // flat unlit materials, like the rest of the museum
      // (the FBX's Corona material has no map three.js understands, so load
      // the base color texture directly)
      var skin = new T.TextureLoader().load('assets/shork/Shork_BaseColor.jpg');
      skin.anisotropy = maxAniso;

      obj.traverse(function (o) {
        if (!o.isMesh) return;

        var n = [].concat(o.material).length;
        o.material = n > 1
          ? [].concat(o.material).map(function () {
            return new T.MeshBasicMaterial({ map: skin, side: T.DoubleSide });
          })
          : new T.MeshBasicMaterial({ map: skin, side: T.DoubleSide });
      });

      // normalize size, center it on the pivot so it spins in place, and stand
      // it on the floor
      var box = new T.Box3().setFromObject(obj);
      var size = box.getSize(new T.Vector3());
      var ctr = box.getCenter(new T.Vector3());
      var k = MODEL_HEIGHT / Math.max(size.x, size.y, size.z);

      var holder = new T.Group();
      obj.position.set(-ctr.x, -box.min.y, -ctr.z);
      holder.add(obj);
      holder.scale.setScalar(k);

      var pivot = new T.Group();
      pivot.position.y = MODEL_Y;
      pivot.add(holder);
      hGroup.add(pivot);

      spin.push({ m: pivot, s: .8 });
    }, undefined, function () {});
  }

  // atrium centerpiece
  var orb = new T.Group();
  orb.position.set(0, 1.9, 0);
  A.group.add(orb);

  var core = new T.Mesh(
    new T.SphereGeometry(.5, 20, 14),
    new T.MeshBasicMaterial({ color: '#f0b35e' })
  );
  orb.add(core);

  WINGS.forEach(function (w, i) {
    var g = new T.IcosahedronGeometry(.22, 0);
    var m = new T.Mesh(g, new T.MeshBasicMaterial({ color: w.color }));
    var an = i * Math.PI / 2;

    m.position.set(
      Math.cos(an) * 1.3,
      Math.sin(i * 1.7) * .2,
      Math.sin(an) * 1.3
    );
    orb.add(m);
  });

  spin.push({ m: orb, s: .35 });

  var base0 = new T.Mesh(
    new T.CylinderGeometry(1, 1.15, .5, 24),
    new T.MeshBasicMaterial({ color: '#f2f4f8' })
  );
  base0.position.set(0, .25, 0);
  add(A, base0);

  walls.push({ x0: -1.2, x1: 1.2, z0: -1.2, z1: 1.2 });

  // wall text
  function wallText(x, title, body, lines) {
    plane(A, 7, 3.5, tex(1024, 512, function (c, cw, ch) {
      c.fillStyle = '#15171a';
      c.textBaseline = 'alphabetic';

      c.font = '400 28px "DM Mono", monospace';
      c.fillText(title.toUpperCase(), 60, 80);

      c.font = '700 62px "Schibsted Grotesk", system-ui, sans-serif';
      var y = wrapText(c, body, 60, 170, cw - 120, 72);

      c.fillStyle = '#4a4f56';
      c.font = '400 34px "Instrument Sans", system-ui, sans-serif';
      wrapText(c, lines, 60, y + 70, cw - 120, 44);
    }), x, 2.7, -9.7, 0, { transparent: true });
  }

  wallText(
    -6,
    'Driving question',
    'How can a museum of the future inspire hope today?',
    'A museum from the year 2100, looking back at the past of the climate crisis.'
  );

  // floors and ceilings
  rooms.forEach(function (room) {
    var W = room.x1 - room.x0;
    var D = room.z1 - room.z0;
    var cx = (room.x0 + room.x1) / 2;
    var cz = (room.z0 + room.z1) / 2;

    var ft = tex(Q.tex, Q.tex, function (x, S) {
      function mx(v) {
        return (v - room.x0) / W * S;
      }

      function mz(v) {
        return (v - room.z0) / D * S;
      }

      x.fillStyle = room.floor;
      x.fillRect(0, 0, S, S);

      // two-meter slabs with a deterministic tint
      var SL = 2;
      var ix0 = Math.floor(room.x0 / SL);
      var ix1 = Math.ceil(room.x1 / SL);
      var iz0 = Math.floor(room.z0 / SL);
      var iz1 = Math.ceil(room.z1 / SL);

      for (var ix = ix0; ix < ix1; ix++) {
        for (var iz = iz0; iz < iz1; iz++) {
          var rr = rng(hash('slab' + ix + ',' + iz));
          x.fillStyle = rr() < .5
            ? 'rgba(0,0,0,' + (rr() * .05) + ')'
            : 'rgba(255,255,255,' + (rr() * .06) + ')';
          x.fillRect(mx(ix * SL), mz(iz * SL), SL / W * S, SL / D * S);
        }
      }

      // grout lines
      x.fillStyle = 'rgba(40,44,50,.3)';
      var lwx = .05 / W * S;
      var lwz = .05 / D * S;

      for (var gx = ix0; gx <= ix1; gx++) {
        x.fillRect(mx(gx * SL) - lwx / 2, 0, lwx, S);
      }

      for (var gz = iz0; gz <= iz1; gz++) {
        x.fillRect(0, mz(gz * SL) - lwz / 2, S, lwz);
      }

      // compass rose in the atrium
      if (room.id === 'atrium') {
        x.save();
        x.translate(mx(0), mz(0));
        x.scale(S / W, S / D);

        WINGS.forEach(function (w, k) {
          x.fillStyle = rgba(w.color, .2);
          x.beginPath();
          x.moveTo(0, 0);
          x.arc(
            0, 0, 3.4,
            k * Math.PI / 2 - Math.PI / 4 - Math.PI / 2,
            (k + 1) * Math.PI / 2 - Math.PI / 4 - Math.PI / 2
          );
          x.closePath();
          x.fill();
        });

        x.strokeStyle = 'rgba(21,23,26,.55)';
        x.lineWidth = .05;
        x.beginPath();
        x.arc(0, 0, 3.4, 0, 6.3);
        x.stroke();
        x.beginPath();
        x.arc(0, 0, 2.2, 0, 6.3);
        x.stroke();
        x.restore();
      }

      // vignette
      x.fillStyle = 'rgba(18,26,48,.16)';
      x.fillRect(0, 0, S, S);

      // soft shadows along the walls, split around the doorways
      var e = S * .07;

      ['x0', 'x1', 'z0', 'z1'].forEach(function (side) {
        var vert = side === 'x0' || side === 'x1';
        var lo = side === 'x0' || side === 'z0';
        var has = room.doors.indexOf(side) >= 0;
        var cen = vert ? mz(0) : mx(0);
        var hw = 1.8 * S / (vert ? D : W);
        var segments = has ? [[0, cen - hw], [cen + hw, S]] : [[0, S]];

        segments.forEach(function (sg) {
          var g = vert
            ? x.createLinearGradient(lo ? 0 : S, 0, lo ? e : S - e, 0)
            : x.createLinearGradient(0, lo ? 0 : S, 0, lo ? e : S - e);

          g.addColorStop(0, 'rgba(10,14,28,.4)');
          g.addColorStop(1, 'rgba(10,14,28,0)');
          x.fillStyle = g;

          if (vert) {
            x.fillRect(lo ? 0 : S - e, sg[0], e, sg[1] - sg[0]);
          } else {
            x.fillRect(sg[0], lo ? 0 : S - e, sg[1] - sg[0], e);
          }
        });
      });

      // fake light pools
      x.globalCompositeOperation = 'lighter';

      room.pools.forEach(function (p) {
        x.save();
        x.translate(mx(p.x), mz(p.z));
        x.scale(p.r / W * S, p.r / D * S);

        var g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, 'rgba(255,240,215,' + (p.a * .35) + ')');
        g.addColorStop(1, 'rgba(255,240,215,0)');
        x.fillStyle = g;
        x.beginPath();
        x.arc(0, 0, 1, 0, 6.3);
        x.fill();
        x.restore();
      });

      x.globalCompositeOperation = 'source-over';
    });

    var fl = new T.Mesh(
      new T.PlaneGeometry(W, D),
      new T.MeshBasicMaterial({ map: ft })
    );
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(cx, 0, cz);
    add(room, fl);

    // ceiling: a white panel with an inset rectangle, repeated across the room
    var ct = tex(128, 128, function (x, s) {
      x.fillStyle = '#e6e7e9';
      x.fillRect(0, 0, s, s);

      var g = x.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#f4f4f4');
      x.fillStyle = g;
      x.fillRect(s * .3, s * .3, s * .4, s * .4);

      x.strokeStyle = 'rgba(60,70,90,.35)';
      x.lineWidth = 2;
      x.strokeRect(s * .3, s * .3, s * .4, s * .4);
    }, [W / 5, D / 5]);

    var ce = new T.Mesh(
      new T.PlaneGeometry(W, D),
      new T.MeshBasicMaterial({ map: ct })
    );
    ce.rotation.x = Math.PI / 2;
    ce.position.set(cx, 5, cz);
    add(room, ce);
  });

  // skylight above the atrium
  var sky = new T.Mesh(
    new T.PlaneGeometry(7, 7),
    MB({ color: '#eef4fa' })
  );
  sky.rotation.x = Math.PI / 2;
  sky.position.set(0, 4.96, 0);
  add(A, sky);

  // player state
  var pos = pose || { x: 0, z: 7, yaw: 0, pitch: 0 };
  var P = {
    x: pos.x,
    z: pos.z,
    yaw: pos.yaw || 0,
    pitch: pos.pitch || 0
  };

  var keys = {};
  var joyV = { x: 0, y: 0 };
  var paused = false;
  var cur = 'atrium';
  var lastCur = '';
  var nearest = null;
  var raf = 0;
  var last = performance.now();
  var cleanup = [];
  var RAD = .35;

  function collide(nx, nz) {
    for (var it = 0; it < 2; it++) {
      for (var i = 0; i < walls.length; i++) {
        var w = walls[i];
        var cx = Math.max(w.x0, Math.min(nx, w.x1));
        var cz = Math.max(w.z0, Math.min(nz, w.z1));
        var dx = nx - cx;
        var dz = nz - cz;
        var d2 = dx * dx + dz * dz;

        if (d2 < RAD * RAD) {
          if (d2 > 1e-8) {
            var d = Math.sqrt(d2);
            nx = cx + dx / d * RAD;
            nz = cz + dz / d * RAD;
          } else {
            // exactly inside a wall: push out through the nearest edge
            var l = nx - w.x0;
            var rr = w.x1 - nx;
            var t = nz - w.z0;
            var b = w.z1 - nz;
            var m = Math.min(l, rr, t, b);

            if (m === l) nx = w.x0 - RAD;
            else if (m === rr) nx = w.x1 + RAD;
            else if (m === t) nz = w.z0 - RAD;
            else nz = w.z1 + RAD;
          }
        }
      }
    }

    return [nx, nz];
  }

  function roomAt(x, z) {
    for (var i = 0; i < rooms.length; i++) {
      var r = rooms[i];
      if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return r.id;
    }
    return cur;
  }

  // event listeners that stop() can remove again
  function on(t, ev, fn, o) {
    t.addEventListener(ev, fn, o);
    cleanup.push(function () {
      t.removeEventListener(ev, fn, o);
    });
  }

  function readNearest() {
    if (nearest && !paused) openPlacard(nearest.art.id);
  }

  on(window, 'keydown', function (e) {
    if (!modal.hidden) return;

    var k = e.key.toLowerCase();

    if (k === 'w' || k === 'arrowup') keys.f = 1;
    else if (k === 's' || k === 'arrowdown') keys.b = 1;
    else if (k === 'a') keys.l = 1;
    else if (k === 'd') keys.r = 1;
    else if (k === 'arrowleft') keys.tl = 1;
    else if (k === 'arrowright') keys.tr = 1;
    else if (k === 'shift') keys.sh = 1;
    else if (k === 'e') readNearest();
    else if (k === 'f') toggleStats();
    else if (k === 'escape' && !document.pointerLockElement) exit3D();

    if (k.indexOf('arrow') === 0) e.preventDefault();
  });

  on(window, 'keyup', function (e) {
    var k = e.key.toLowerCase();

    if (k === 'w' || k === 'arrowup') keys.f = 0;
    else if (k === 's' || k === 'arrowdown') keys.b = 0;
    else if (k === 'a') keys.l = 0;
    else if (k === 'd') keys.r = 0;
    else if (k === 'arrowleft') keys.tl = 0;
    else if (k === 'arrowright') keys.tr = 0;
    else if (k === 'shift') keys.sh = 0;
  });

  on(window, 'blur', function () {
    keys = {};
  });

  // pointer lock
  var look = { id: null, x: 0, y: 0 };

  function tryLock() {
    try {
      var p = canvas.requestPointerLock && canvas.requestPointerLock();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  world_tryLock = tryLock;

  on(canvas, 'pointerdown', function (e) {
    look.id = e.pointerId;
    look.x = e.clientX;
    look.y = e.clientY;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (x) {}

    if (e.pointerType === 'mouse' && !document.pointerLockElement && !paused) {
      tryLock();
    }
  });

  on(canvas, 'pointermove', function (e) {
    if (paused) return;

    if (document.pointerLockElement === canvas) {
      P.yaw -= e.movementX * .0022;
      P.pitch = Math.max(-1.2, Math.min(1.2, P.pitch - e.movementY * .0022));
      return;
    }

    if (look.id !== e.pointerId) return;

    P.yaw -= (e.clientX - look.x) * .0048;
    P.pitch = Math.max(-1.2, Math.min(1.2, P.pitch - (e.clientY - look.y) * .0048));
    look.x = e.clientX;
    look.y = e.clientY;
  });

  function endLook(e) {
    if (look.id === e.pointerId) look.id = null;
  }

  on(canvas, 'pointerup', endLook);
  on(canvas, 'pointercancel', endLook);

  // on-screen joystick
  var joy = $('#joy');
  var knob = $('#knob');
  var joyId = null;

  function setJoy(e) {
    var rect = joy.getBoundingClientRect();
    var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    var dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    var m = Math.hypot(dx, dy);

    if (m > 1) {
      dx /= m;
      dy /= m;
    }

    joyV.x = dx;
    joyV.y = dy;
    knob.style.transform = 'translate(' + dx * 34 + 'px,' + dy * 34 + 'px)';
  }

  function endJoy(e) {
    if (e.pointerId !== joyId) return;

    joyId = null;
    joyV.x = 0;
    joyV.y = 0;
    knob.style.transform = '';
  }

  on(joy, 'pointerdown', function (e) {
    joyId = e.pointerId;

    try {
      joy.setPointerCapture(e.pointerId);
    } catch (x) {}

    setJoy(e);
  });

  on(joy, 'pointermove', function (e) {
    if (e.pointerId === joyId) setJoy(e);
  });

  on(joy, 'pointerup', endJoy);
  on(joy, 'pointercancel', endJoy);
  on(window, 'resize', applySize);

  // hud
  var readBtn = $('#gl-read');
  var roomPill = $('#gl-room');
  var statsEl = $('#gl-stats');
  var mm = $('#gl-map').getContext('2d');
  var pillT = 0;
  var statsOn = false;
  var fpsShown = 60;

  readBtn.onclick = readNearest;

  function toggleStats() {
    statsOn = !statsOn;
    statsEl.hidden = !statsOn;
    $('#gl-stats-btn').setAttribute('aria-pressed', String(statsOn));
  }

  $('#gl-stats-btn').onclick = toggleStats;

  function drawMap() {
    mm.clearRect(0, 0, 124, 124);
    mm.save();
    mm.translate(62, 62);

    var s = 124 / 62;
    mm.scale(s, s);

    rooms.forEach(function (r) {
      if (r.id === 'hidden' && cur !== 'hidden') return;

      mm.fillStyle = r.id === cur
        ? 'rgba(255,255,255,.6)'
        : 'rgba(255,255,255,.26)';
      mm.fillRect(r.x0, r.z0, r.x1 - r.x0, r.z1 - r.z0);
    });

    mm.fillStyle = '#e6e8eb';
    paints.forEach(function (p) {
      mm.fillRect(p.x - .7, p.z - .7, 1.4, 1.4);
    });

    mm.translate(P.x, P.z);
    mm.rotate(Math.atan2(-Math.cos(P.yaw), -Math.sin(P.yaw)));

    mm.fillStyle = '#ffb24a';
    mm.beginPath();
    mm.moveTo(2.4, 0);
    mm.lineTo(-1.6, 1.6);
    mm.lineTo(-1.6, -1.6);
    mm.closePath();
    mm.fill();

    mm.restore();
  }

  var frames = 0;
  var acc = 0;
  var fc = 0;
  var since = 0;
  var mapN = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);

    var dt = Math.min(.05, (now - last) / 1000);
    last = now;

    if (!paused) {
      // movement
      var fx = -Math.sin(P.yaw);
      var fz = -Math.cos(P.yaw);
      var rx = Math.cos(P.yaw);
      var rz = -Math.sin(P.yaw);
      var f = (keys.f ? 1 : 0) - (keys.b ? 1 : 0) - joyV.y;
      var sd = (keys.r ? 1 : 0) - (keys.l ? 1 : 0) + joyV.x;
      var m = Math.hypot(f, sd);

      if (m > 1) {
        f /= m;
        sd /= m;
      }

      var sp = (keys.sh ? 5.6 : 3.4) * dt;

      if (f || sd) {
        var c = collide(
          P.x + (fx * f + rx * sd) * sp,
          P.z + (fz * f + rz * sd) * sp
        );
        P.x = c[0];
        P.z = c[1];
      }

      if (keys.tl) P.yaw += 1.8 * dt;
      if (keys.tr) P.yaw -= 1.8 * dt;

      if (!reduceMotion) {
        spin.forEach(function (s) {
          s.m.rotation.y += s.s * dt;
        });
      }

      cur = roomAt(P.x, P.z);

      if (cur !== lastCur) {
        lastCur = cur;
        roomPill.textContent = byId[cur].name;
        roomPill.classList.add('on');
        clearTimeout(pillT);
        pillT = setTimeout(function () {
          roomPill.classList.remove('on');
        }, 2400);

        rooms.forEach(function (r) {
          r.group.visible =
            r.id === cur ||
            cur === 'atrium' ||
            r.id === 'atrium' ||
            (cur === 'hidden' && r.id === 'south') ||
            (cur === 'south' && r.id === 'hidden');
        });
      }

      // find the nearest readable painting
      var best = null;
      var bd = 1e9;

      paints.forEach(function (p) {
        if (!byId[p.room].group.visible) return;

        var dx = p.x - P.x;
        var dz = p.z - P.z;
        var dist = Math.hypot(dx, dz);

        if (dist > 4.6 || dist < .3) return;
        if (-dx * p.n.x - dz * p.n.z <= 0) return;
        if ((dx * fx + dz * fz) / dist < .76) return;

        if (dist < bd) {
          bd = dist;
          best = p;
        }
      });

      if (best !== nearest) {
        nearest = best;

        if (best) {
          readBtn.textContent = 'Read placard: ' + best.art.title + (coarse ? '' : '  [E]');
          readBtn.hidden = false;
        } else {
          readBtn.hidden = true;
        }
      }
    }

    camera.position.set(P.x, 1.65, P.z);
    camera.rotation.set(P.pitch, P.yaw, 0, 'YXZ');
    renderer.render(scene, camera);

    // measure fps once a second and adapt the render scale
    acc += dt;
    fc++;

    if (acc >= 1) {
      var fps = fc / acc;
      fpsShown = fps;
      acc = 0;
      fc = 0;
      since++;

      if (since >= 2) {
        if (fps < 40 && scale > .55) {
          scale = Math.max(.55, scale - .15);
          applySize();
          since = 0;
        } else if (fps > 57 && scale < 1) {
          scale = Math.min(1, scale + .1);
          applySize();
          since = 0;
        }
      }

      if (statsOn) {
        var i = renderer.info;
        statsEl.textContent =
          'fps ' + fps.toFixed(0) +
          '\ndraw calls ' + i.render.calls +
          '\ntriangles ' + i.render.triangles +
          '\ntextures ' + i.memory.textures +
          '\nquality ' + Q.label +
          '\nrender scale ' + (scale * 100).toFixed(0) + '%';
      }
    }

    if (++mapN % 4 === 0) drawMap();
  }

  roomPill.textContent = '';

  rooms.forEach(function (r) {
    r.group.visible = true;
  });

  raf = requestAnimationFrame(frame);

  return {
    pause: function (v) {
      paused = v;

      if (v) {
        keys = {};
        joyV.x = 0;
        joyV.y = 0;
        look.id = null;
      }

      last = performance.now();
    },

    pose: function () {
      return { x: P.x, z: P.z, yaw: P.yaw, pitch: P.pitch };
    },

    stop: function () {
      stopped = true;
      cancelAnimationFrame(raf);
      cleanup.forEach(function (f) {
        f();
      });

      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();

        var ms = [].concat(o.material || []);
        ms.forEach(function (m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });

      renderer.dispose();

      try {
        renderer.forceContextLoss();
      } catch (e) {}

      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
