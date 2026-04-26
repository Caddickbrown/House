/**
 * House — a large, detailed designer residence.
 * Concrete, glass, timber. Brutalist-meets-warm.
 *
 * Layout:
 *   Ground floor:  Entry hall · Open kitchen/dining · Living room (double-height)
 *                  Utility · WC · Study/Library · Garage (2-car)
 *   First floor:   Gallery landing · Master suite · 2× bedrooms · 2× bathrooms
 *   Exterior:      Stone terrace · Lap pool · Main garden
 *                  Garden studio · Walled kitchen garden · Driveway
 *
 * Scale: main block ~42×22m, plot ~200×180m
 */

import * as THREE from 'three';

// ─── Palette ────────────────────────────────────────────────────────────────
const P = {
  concrete:    0xd4cec8,
  concreteDk:  0xb8b0a8,
  timber:      0xa0724a,
  timberDk:    0x7a5535,
  glass:       0x8ec8e8,
  steel:       0x8a9098,
  steelDk:     0x606870,
  white:       0xf5f2ee,
  offWhite:    0xe8e2d8,
  floorWood:   0xc8a070,
  floorWoodDk: 0xa07848,
  stone:       0xb0a898,
  stoneDk:     0x887e74,
  marble:      0xe8e0d8,
  grass:       0x6a9a3a,
  gravel:      0xb8b0a0,
  water:       0x3878a8,
  soil:        0x5a4030,
};

function stdMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0, ...opts });
}
function box(w, h, d, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stdMat(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function plane(w, d, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), stdMat(color, opts));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

// ─── Room zones (for HUD label detection) ───────────────────────────────────
export const ROOMS = [
  { label: 'Entry Hall',      x: 0,    z: -12,  r: 6  },
  { label: 'Living Room',     x: -14,  z: 0,    r: 10 },
  { label: 'Kitchen',         x: 10,   z: -2,   r: 8  },
  { label: 'Dining',          x: 5,    z: 8,    r: 7  },
  { label: 'Study',           x: 18,   z: 8,    r: 6  },
  { label: 'Utility Room',    x: 18,   z: -8,   r: 5  },
  { label: 'Garage',          x: 26,   z: 0,    r: 8  },
  { label: 'Master Suite',    x: -12,  z: -2,   r: 8, floor: 1 },
  { label: 'Bedroom 2',       x: 4,    z: -10,  r: 6, floor: 1 },
  { label: 'Bedroom 3',       x: 14,   z: -10,  r: 6, floor: 1 },
  { label: 'Gallery Landing', x: 0,    z: 2,    r: 6, floor: 1 },
  { label: 'Terrace',         x: -5,   z: 18,   r: 12 },
  { label: 'Pool',            x: 5,    z: 30,   r: 8  },
  { label: 'Garden',          x: 0,    z: 52,   r: 22 },
  { label: 'Studio',          x: 22,   z: 35,   r: 8  },
  { label: 'Kitchen Garden',  x: -22,  z: 40,   r: 10 },
];

export function getRoomLabel(x, z, y) {
  const floor = y > 3.8 ? 1 : 0;
  let best = null, bestDist = Infinity;
  for (const r of ROOMS) {
    if ((r.floor || 0) !== floor) continue;
    const dx = x - r.x, dz = z - r.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < r.r && dist < bestDist) { best = r.label; bestDist = dist; }
  }
  return best || '';
}

// ─── Main build ──────────────────────────────────────────────────────────────
export function buildHouse(scene) {
  buildGround(scene);
  buildMainBlock(scene);
  buildGarage(scene);
  buildFirstFloor(scene);
  buildRoof(scene);
  buildTerrace(scene);
  buildPool(scene);
  buildGarden(scene);
  buildStudio(scene);
  buildKitchenGarden(scene);
  buildDriveway(scene);
  buildTrees(scene);
}

// ─── Ground & plot ───────────────────────────────────────────────────────────
function buildGround(scene) {
  const lawn = plane(200, 200, P.grass);
  lawn.position.set(0, 0, 25);
  scene.add(lawn);

  const forecourt = plane(40, 20, P.gravel);
  forecourt.position.set(12, 0.01, -20);
  scene.add(forecourt);

  function boundaryWall(w, h, d, x, z) {
    const m = box(w, h, d, P.stone);
    m.position.set(x, h/2, z);
    scene.add(m);
  }
  boundaryWall(200, 0.8, 0.3, 0, -29);
  boundaryWall(0.3, 0.8, 220, -100, 25);
  boundaryWall(0.3, 0.8, 220, 100, 25);
}

// ─── Ground floor ────────────────────────────────────────────────────────────
function buildMainBlock(scene) {
  const FH = 3.4, WT = 0.3;

  // Foundation slab edge
  const slab = box(42, 0.3, 22, P.concreteDk);
  slab.position.set(0, -0.15, 0);
  slab.receiveShadow = true;
  scene.add(slab);

  // Interior floor
  const gFloor = plane(40, 20, P.floorWood);
  gFloor.position.set(0, 0.01, 0);
  scene.add(gFloor);

  buildSouthFacade(scene, FH, WT);
  buildNorthFacade(scene, FH, WT);
  buildWestFacade(scene, FH, WT);
  buildEastFacade(scene, FH, WT);

  buildEntryHall(scene, FH);
  buildLivingRoom(scene, FH);
  buildKitchen(scene, FH);
  buildDining(scene, FH);
  buildStudy(scene, FH);
  buildUtility(scene, FH);
  buildWC(scene, FH);
  buildStaircase(scene, FH);
}

function buildSouthFacade(scene, fh, wt) {
  // Concrete piers flanking glazed entry
  [{ x: -18.5 }, { x: 18.5 }].forEach(({ x }) => {
    const pier = box(3, fh, wt, P.concrete);
    pier.position.set(x, fh/2, -11);
    scene.add(pier);
  });
  const lintel = box(34, 0.5, wt, P.concrete);
  lintel.position.set(0, fh - 0.25, -11);
  scene.add(lintel);
  const cladTop = box(34, 0.6, 0.1, P.timber);
  cladTop.position.set(0, fh - 0.9, -10.9);
  scene.add(cladTop);

  // Large glass panes
  [-8, 8].forEach(x => {
    const gl = box(6, fh - 0.5, 0.08, P.glass, { transparent: true, opacity: 0.4, roughness: 0.05, metalness: 0.3 });
    gl.position.set(x, fh/2 - 0.25, -10.95);
    scene.add(gl);
  });
  // Front door
  const door = box(1.1, 2.4, 0.06, P.steelDk);
  door.position.set(0, 1.2, -10.93);
  scene.add(door);
  const handle = box(0.05, 0.35, 0.06, 0xc8a838);
  handle.position.set(0.45, 1.1, -10.9);
  scene.add(handle);
  // Flanking panels
  [-14, 14].forEach(x => {
    const pan = box(6, fh, wt, P.concrete);
    pan.position.set(x, fh/2, -11);
    scene.add(pan);
  });
  // Olive trees flanking door
  [[-3, -10.5], [3, -10.5]].forEach(([x, z]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.8, 7), stdMat(0x8a7a60));
    trunk.position.set(x, 0.9, z);
    trunk.castShadow = true;
    scene.add(trunk);
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.7, 7, 5), stdMat(0x8aaa78));
    canopy.position.set(x, 2.3, z);
    canopy.castShadow = true;
    scene.add(canopy);
  });
}

function buildNorthFacade(scene, fh, wt) {
  for (let i = 0; i < 5; i++) {
    const col = box(0.3, fh, wt, P.steelDk);
    col.position.set(-16 + i * 8, fh/2, 11);
    scene.add(col);
  }
  for (let i = 0; i < 4; i++) {
    const gp = box(7.4, fh, 0.06, P.glass, { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.3 });
    gp.position.set(-12 + i * 8, fh/2, 11);
    scene.add(gp);
  }
  const trackBot = box(32, 0.05, 0.06, P.steel);
  trackBot.position.set(0, 0.025, 11);
  scene.add(trackBot);
}

function buildWestFacade(scene, fh, wt) {
  const wall = box(wt, fh, 22, P.concrete);
  wall.position.set(-20, fh/2, 0);
  scene.add(wall);
  [-4, 4].forEach(z => {
    const win = box(0.09, 1.2, 0.7, P.glass, { transparent: true, opacity: 0.45 });
    win.position.set(-19.85, 2.0, z);
    scene.add(win);
  });
}

function buildEastFacade(scene, fh, wt) {
  const wall = box(wt, fh, 22, P.timberDk);
  wall.position.set(20, fh/2, 0);
  scene.add(wall);
  for (let y = 0.3; y < fh - 0.3; y += 0.35) {
    const strip = box(0.05, 0.05, 21, P.timber);
    strip.position.set(20.1, y, 0);
    scene.add(strip);
  }
}

function buildEntryHall(scene, fh) {
  const partW = box(0.2, fh, 12, P.offWhite);
  partW.position.set(-6, fh/2, -5);
  scene.add(partW);
  const hallFloor = plane(14, 8, P.stoneDk);
  hallFloor.position.set(0, 0.04, -8.5);
  scene.add(hallFloor);
  // Coat rack
  const rack = box(1.4, 0.05, 0.06, P.timber);
  rack.position.set(-4, 1.9, -10.5);
  scene.add(rack);
  [-0.5, 0, 0.5].forEach(dx => {
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), stdMat(P.steel));
    hook.position.set(-4 + dx, 1.82, -10.45);
    hook.rotation.x = 0.4;
    scene.add(hook);
  });
  // Console table
  const ct = box(1.2, 0.85, 0.4, P.timberDk);
  ct.position.set(4, 0.425, -10.0);
  scene.add(ct);
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.3, 8), stdMat(0x5a9a60));
  vase.position.set(4, 0.95, -10.0);
  scene.add(vase);
}

function buildLivingRoom(scene, fh) {
  // Double-height — ceiling is at first floor level (~3.7) but open to roof lantern
  const fw = box(0.15, fh, 20, P.timber);
  fw.position.set(-19.8, fh/2, 0);
  scene.add(fw);
  for (let y = 0.3; y < fh - 0.2; y += 0.4) {
    const g = box(0.05, 0.05, 20, P.timberDk);
    g.position.set(-19.75, y, 0);
    scene.add(g);
  }
  // Area rug
  const rug = plane(8, 6, 0x7a5a48);
  rug.position.set(-13, 0.06, 2);
  scene.add(rug);
  // Sofa — L-shaped
  const sofaBody = box(5, 0.7, 2.2, 0x5a7a8a);
  sofaBody.position.set(-14, 0.35, 1);
  scene.add(sofaBody);
  const sofaBack = box(5, 0.9, 0.3, 0x4a6a7a);
  sofaBack.position.set(-14, 0.8, 2.05);
  scene.add(sofaBack);
  const sofaArm = box(0.3, 0.9, 2.2, 0x4a6a7a);
  sofaArm.position.set(-16.35, 0.8, 1);
  scene.add(sofaArm);
  const sofaChaise = box(2.2, 0.7, 2.5, 0x5a7a8a);
  sofaChaise.position.set(-11.3, 0.35, -0.65);
  scene.add(sofaChaise);
  // Cushions
  [[-15, 1.5], [-14, 1.5], [-13, 1.5]].forEach(([x, z]) => {
    const c = box(0.5, 0.4, 0.35, 0xd0c8b8);
    c.position.set(x, 0.75, z);
    scene.add(c);
  });
  // Coffee table
  const ctf = box(1.6, 0.38, 0.9, P.steelDk);
  ctf.position.set(-13, 0.19, -0.5);
  scene.add(ctf);
  const ctfGlass = box(1.5, 0.05, 0.8, 0x3a5a70, { transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.5 });
  ctfGlass.position.set(-13, 0.41, -0.5);
  scene.add(ctfGlass);
  const bk = box(0.35, 0.04, 0.25, 0x8a6030);
  bk.position.set(-13.2, 0.44, -0.5);
  scene.add(bk);
  // Floor lamp
  const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8), stdMat(P.steelDk));
  lp.position.set(-11, 0.9, 1.5);
  scene.add(lp);
  const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.35, 12, 1, true), stdMat(0xe8e0c8, { side: THREE.DoubleSide }));
  ls.position.set(-11, 1.9, 1.5);
  scene.add(ls);
  const ll = new THREE.PointLight(0xffe8c0, 1.2, 8);
  ll.position.set(-11, 1.85, 1.5);
  scene.add(ll);
  // TV wall unit
  const tvUnit = box(2.8, 0.5, 0.35, P.timberDk);
  tvUnit.position.set(-8, 0.8, -4.8);
  scene.add(tvUnit);
  const tv = box(2.2, 1.3, 0.06, 0x0a0a0a);
  tv.position.set(-8, 1.7, -4.75);
  scene.add(tv);
  const tvGlow = box(2.1, 1.2, 0.02, 0x1a2030, { emissive: 0x0a1020, emissiveIntensity: 0.3 });
  tvGlow.position.set(-8, 1.7, -4.74);
  scene.add(tvGlow);
  // Bookshelf built-in
  const bsf = box(2, fh * 0.85, 0.3, P.offWhite);
  bsf.position.set(-19.5, fh * 0.425, -6);
  scene.add(bsf);
  [0.6, 1.4, 2.2].forEach(y => {
    const plank = box(1.9, 0.03, 0.28, P.timberDk);
    plank.position.set(-19.5, y, -6);
    scene.add(plank);
    const bookColors = [0x8b4040, 0x406a8b, 0x5a8b40, 0x8b7040, 0x705a8b];
    bookColors.forEach((c, i) => {
      const bkm = box(0.12, 0.28, 0.25, c);
      bkm.position.set(-20.3 + i * 0.15, y + 0.15, -6);
      scene.add(bkm);
    });
  });
  // Large abstract artwork
  const art = box(1.8, 1.1, 0.04, 0x2a3a4a);
  art.position.set(-19.7, 2.0, 2);
  scene.add(art);
  const artInner = box(1.6, 0.9, 0.02, 0x4a6a88);
  artInner.position.set(-19.68, 2.0, 2);
  scene.add(artInner);
}

function buildKitchen(scene, fh) {
  const kFloor = plane(16, 16, P.marble);
  kFloor.position.set(10, 0.04, -2);
  scene.add(kFloor);
  // Island
  const island = box(3.2, 0.9, 1.4, P.white);
  island.position.set(10, 0.45, -1);
  scene.add(island);
  const islandTop = box(3.3, 0.04, 1.5, P.marble);
  islandTop.position.set(10, 0.92, -1);
  scene.add(islandTop);
  // Bar stools
  [-0.8, 0, 0.8].forEach(dx => {
    const ss = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.08, 10), stdMat(P.steelDk));
    ss.position.set(10 + dx, 0.85, -2.2);
    scene.add(ss);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.78, 8), stdMat(P.steel));
    sp.position.set(10 + dx, 0.43, -2.2);
    scene.add(sp);
  });
  // Wall units
  const wUnits = box(10, 0.7, 0.5, P.white);
  wUnits.position.set(9, 2.6, 10.5);
  scene.add(wUnits);
  // Base units
  const bUnits = box(10, 0.9, 0.6, P.white);
  bUnits.position.set(9, 0.45, 10.6);
  scene.add(bUnits);
  const worktop = box(10, 0.04, 0.62, P.stone);
  worktop.position.set(9, 0.92, 10.6);
  scene.add(worktop);
  // Hob on island
  const hob = box(0.6, 0.01, 0.5, 0x1a1a1a);
  hob.position.set(9.5, 0.93, -1);
  scene.add(hob);
  [[-0.15,-0.1],[0.15,-0.1],[-0.15,0.1],[0.15,0.1]].forEach(([dx,dz]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 4, 16), stdMat(0x303030));
    ring.rotation.x = Math.PI/2;
    ring.position.set(9.5+dx, 0.94, -1+dz);
    scene.add(ring);
  });
  // Extractor hood
  const hood = box(0.8, 0.12, 0.6, P.steelDk);
  hood.position.set(9.5, 2.2, -1);
  scene.add(hood);
  const hoodStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), stdMat(P.steel));
  hoodStem.position.set(9.5, 2.7, -1);
  scene.add(hoodStem);
  // Sink
  const sink = box(0.7, 0.12, 0.45, P.steel, { roughness: 0.2, metalness: 0.8 });
  sink.position.set(12, 0.98, 10.55);
  scene.add(sink);
  const tapBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6), stdMat(P.steel, { metalness: 0.9, roughness: 0.1 }));
  tapBase.position.set(12, 1.17, 10.4);
  scene.add(tapBase);
  // Fridge
  const fridge = box(0.7, 2.0, 0.65, P.steel, { roughness: 0.3, metalness: 0.6 });
  fridge.position.set(18.5, 1.0, 10.5);
  scene.add(fridge);
  const fridgeHandle = box(0.04, 0.4, 0.06, P.steelDk);
  fridgeHandle.position.set(18.18, 1.4, 10.2);
  scene.add(fridgeHandle);
  // Light
  const kLight = new THREE.PointLight(0xffe4a0, 0.8, 12);
  kLight.position.set(9, 2.3, 8);
  scene.add(kLight);
}

function buildDining(scene, fh) {
  // Table
  const table = box(3.0, 0.06, 1.4, P.white);
  table.position.set(5, 0.75, 8);
  scene.add(table);
  [[-1.2,-0.5],[1.2,-0.5],[-1.2,0.5],[1.2,0.5]].forEach(([dx,dz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.72, 8), stdMat(P.steel));
    leg.position.set(5+dx, 0.36, 8+dz);
    scene.add(leg);
  });
  // Chairs
  [[-1.8,8],[1.8,8],[-0.6,8.9],[0.6,8.9],[-0.6,7.1],[0.6,7.1]].forEach(([dx,z]) => {
    const seat = box(0.42, 0.05, 0.42, P.offWhite);
    seat.position.set(5+dx, 0.46, z);
    scene.add(seat);
    const back = box(0.42, 0.5, 0.04, P.offWhite);
    back.position.set(5+dx, 0.7, z + (z > 8 ? 0.2 : -0.2));
    scene.add(back);
    [[-0.17,-0.17],[0.17,-0.17],[-0.17,0.17],[0.17,0.17]].forEach(([ldx,ldz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 6), stdMat(P.steel));
      leg.position.set(5+dx+ldx, 0.22, z+ldz);
      scene.add(leg);
    });
  });
  // Pendant lights
  [5 - 0.7, 5 + 0.7].forEach(x => {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.8, 6), stdMat(P.steelDk));
    cord.position.set(x, 3.0, 8);
    scene.add(cord);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.22, 12, 1, true), stdMat(P.marble, { side: THREE.DoubleSide }));
    shade.position.set(x, 2.45, 8);
    scene.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), stdMat(0xffe8c0, { emissive: 0xffe090, emissiveIntensity: 1.0 }));
    bulb.position.set(x, 2.45, 8);
    scene.add(bulb);
    const pl = new THREE.PointLight(0xfff0c8, 1.4, 10);
    pl.position.set(x, 2.45, 8);
    scene.add(pl);
  });
  // Sideboard
  const sb = box(2.4, 0.85, 0.45, P.timberDk);
  sb.position.set(-2, 0.425, 10.6);
  scene.add(sb);
  const decanter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.35, 8), stdMat(0x3a5a38, { transparent: true, opacity: 0.7 }));
  decanter.position.set(-2, 0.89, 10.4);
  scene.add(decanter);
}

function buildStudy(scene, fh) {
  const wallS = box(8, fh, 0.2, P.offWhite);
  wallS.position.set(18, fh/2, 4.1);
  scene.add(wallS);
  const wallW = box(0.2, fh, 7, P.offWhite);
  wallW.position.set(14.1, fh/2, 7.6);
  scene.add(wallW);
  const studyFloor = plane(6, 8, P.floorWoodDk);
  studyFloor.position.set(18, 0.04, 8);
  scene.add(studyFloor);
  // Desk
  const deskTop = box(2.0, 0.04, 0.9, P.timberDk);
  deskTop.position.set(18, 0.76, 7.5);
  scene.add(deskTop);
  [[-0.9,-0.4],[0.9,-0.4],[-0.9,0.4],[0.9,0.4]].forEach(([dx,dz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.73, 6), stdMat(P.steelDk));
    leg.position.set(18+dx, 0.365, 7.5+dz);
    scene.add(leg);
  });
  const monitor = box(0.7, 0.42, 0.04, 0x0a0a0a);
  monitor.position.set(18, 0.99, 7.1);
  scene.add(monitor);
  const kbd = box(0.45, 0.018, 0.15, P.steel);
  kbd.position.set(18, 0.79, 7.7);
  scene.add(kbd);
  // Desk lamp
  const dlBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.04, 8), stdMat(P.steelDk));
  dlBase.position.set(17.3, 0.8, 7.15);
  scene.add(dlBase);
  const dlPost = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 6), stdMat(P.steel));
  dlPost.position.set(17.3, 0.99, 7.15);
  dlPost.rotation.z = 0.3;
  scene.add(dlPost);
  const dlLight = new THREE.PointLight(0xfff0c0, 0.6, 5);
  dlLight.position.set(17.0, 1.18, 7.15);
  scene.add(dlLight);
  // Bookshelves
  const bsf = box(0.25, fh * 0.9, 5, P.offWhite);
  bsf.position.set(19.8, fh * 0.45, 7);
  scene.add(bsf);
  [0.5, 1.2, 1.9, 2.6].forEach(y => {
    const plk = box(0.22, 0.03, 4.8, P.timber);
    plk.position.set(19.8, y, 7);
    scene.add(plk);
    const bookColors = [0x7a3a3a, 0x3a527a, 0x7a6030, 0x3a7a4a, 0x5a3a7a, 0x7a5a3a, 0x3a7a7a];
    bookColors.forEach((c, i) => {
      const bkm = box(0.12, 0.22, 0.21, c);
      bkm.position.set(17.6 + i * 0.14, y + 0.13, 7);
      scene.add(bkm);
    });
  });
}

function buildUtility(scene, fh) {
  const wallN = box(6, fh, 0.2, P.offWhite);
  wallN.position.set(18, fh/2, -5.1);
  scene.add(wallN);
  const wallW = box(0.2, fh, 6, P.offWhite);
  wallW.position.set(14.1, fh/2, -8.1);
  scene.add(wallW);
  const wm = box(0.65, 0.85, 0.6, P.white);
  wm.position.set(18.5, 0.425, -9.5);
  scene.add(wm);
  const dryer = box(0.65, 0.85, 0.6, P.white);
  dryer.position.set(17.8, 0.425, -9.5);
  scene.add(dryer);
  const utilTop = box(1.5, 0.04, 0.62, P.stone);
  utilTop.position.set(18.15, 0.9, -9.5);
  scene.add(utilTop);
}

function buildWC(scene, fh) {
  const wallW = box(0.2, fh, 3, P.white);
  wallW.position.set(-4.1, fh/2, -8.5);
  scene.add(wallW);
  const wallS = box(4, fh, 0.2, P.white);
  wallS.position.set(-8.1, fh/2, -10.1);
  scene.add(wallS);
  const toilet = box(0.4, 0.42, 0.55, P.white);
  toilet.position.set(-8.5, 0.21, -8.8);
  scene.add(toilet);
  const basin = box(0.42, 0.18, 0.32, P.white);
  basin.position.set(-6.5, 0.82, -9.8);
  scene.add(basin);
}

function buildStaircase(scene, fh) {
  const stepCount = 14;
  const stepH = (fh + 0.3) / stepCount;
  const stepD = 0.32;
  for (let i = 0; i < stepCount; i++) {
    const step = box(1.4, 0.04, stepD, P.floorWood);
    step.position.set(2.5, i * stepH + stepH/2, -8.0 + i * stepD);
    scene.add(step);
  }
  // Glass balustrade
  const bal = box(0.04, 0.9, stepCount * stepD + 0.2, P.glass, { transparent: true, opacity: 0.3 });
  bal.position.set(1.8, fh * 0.5, -8.0 + stepCount * stepD / 2);
  scene.add(bal);
  const rail = box(0.04, 0.04, stepCount * stepD + 0.3, P.steelDk);
  rail.position.set(1.8, fh * 0.9, -8.0 + stepCount * stepD / 2);
  scene.add(rail);
  // Top landing
  const landing = box(2.5, 0.12, 2.5, P.floorWood);
  landing.position.set(2.5, fh + 0.06, -8 + stepCount * stepD + 1);
  scene.add(landing);
}

// ─── Garage ──────────────────────────────────────────────────────────────────
function buildGarage(scene) {
  const gw = 12, gh = 3.0, gd = 10;
  const gFloor = plane(gw, gd, P.concreteDk);
  gFloor.position.set(26, 0.01, 0);
  scene.add(gFloor);
  const wallN = box(gw, gh, 0.2, P.concrete);
  wallN.position.set(26, gh/2, 5.1);
  scene.add(wallN);
  const wallS = box(gw, gh, 0.2, P.concrete);
  wallS.position.set(26, gh/2, -5.1);
  scene.add(wallS);
  const wallW = box(0.2, gh, gd, P.concrete);
  wallW.position.set(20.1, gh/2, 0);
  scene.add(wallW);
  const roofG = box(gw, 0.3, gd, P.concreteDk);
  roofG.position.set(26, gh + 0.15, 0);
  scene.add(roofG);
  // Garage doors
  [-3, 3].forEach(dx => {
    const gd2 = box(5.6, 2.3, 0.08, P.steel, { roughness: 0.4, metalness: 0.6 });
    gd2.position.set(26 + dx, 1.15, -5);
    scene.add(gd2);
    [0.5, 1.0, 1.5, 2.0].forEach(y => {
      const rib = box(5.5, 0.04, 0.04, P.steelDk);
      rib.position.set(26 + dx, y, -4.96);
      scene.add(rib);
    });
  });
  // Car
  const carBody = box(4.2, 1.3, 1.9, 0x2a2e32);
  carBody.position.set(26, 0.65, 1);
  scene.add(carBody);
  const carRoof = box(2.4, 0.6, 1.85, 0x22262a);
  carRoof.position.set(25.8, 1.6, 1);
  scene.add(carRoof);
  [[-1.5,0.35,-1.0],[-1.5,0.35,1.0],[1.5,0.35,-1.0],[1.5,0.35,1.0]].forEach(([dx,y,dz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 10), stdMat(0x1a1a1a));
    wheel.rotation.z = Math.PI/2;
    wheel.position.set(26+dx, y, 1+dz);
    scene.add(wheel);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 8), stdMat(P.steel, { metalness: 0.8, roughness: 0.2 }));
    rim.rotation.z = Math.PI/2;
    rim.position.set(26+dx, y, 1+dz);
    scene.add(rim);
  });
  const gLight = new THREE.PointLight(0xfff8f0, 1.0, 16);
  gLight.position.set(26, gh - 0.2, 0);
  scene.add(gLight);
}

// ─── First floor ─────────────────────────────────────────────────────────────
function buildFirstFloor(scene) {
  const GFH = 3.4, FFH = 3.0;
  const FY = GFH + 0.3;

  // Floor slab (not over double-height living room)
  const slab1 = box(28, 0.3, 22, P.concreteDk);
  slab1.position.set(4, FY - 0.15, 0);
  scene.add(slab1);
  const ffFloor = plane(28, 22, P.floorWood);
  ffFloor.position.set(4, FY + 0.01, 0);
  scene.add(ffFloor);

  // Gallery balustrade overlooking living room
  const bal = box(0.04, 0.9, 6, P.glass, { transparent: true, opacity: 0.35 });
  bal.position.set(-2, FY + 0.45, 0);
  scene.add(bal);
  const rail = box(0.04, 0.04, 6.1, P.steelDk);
  rail.position.set(-2, FY + 0.9, 0);
  scene.add(rail);

  buildMasterSuite(scene, FY, FFH);
  buildBedroom(scene, FY, FFH, 4, -8);
  buildBedroom(scene, FY, FFH, 14, -8);
  buildBathroom(scene, FY, -6, -8);

  // South facade first floor
  const ffS = box(32, FFH, 0.25, P.concrete);
  ffS.position.set(4, FY + FFH/2, -11);
  scene.add(ffS);
  [0, 8, 16].forEach(dx => {
    const win = box(6, 0.8, 0.08, P.glass, { transparent: true, opacity: 0.4 });
    win.position.set(-10 + dx, FY + 2.0, -10.96);
    scene.add(win);
  });
  // North facade first floor
  const ffN = box(32, FFH, 0.25, P.concrete);
  ffN.position.set(4, FY + FFH/2, 11);
  scene.add(ffN);
  [[-12, 11], [0, 11], [12, 11]].forEach(([x, z]) => {
    const wd = box(3.8, FFH * 0.85, 0.08, P.glass, { transparent: true, opacity: 0.4 });
    wd.position.set(x, FY + FFH * 0.5, z);
    scene.add(wd);
  });
}

function buildMasterSuite(scene, FY, FFH) {
  // Partition walls
  const p1 = box(0.2, FFH, 14, P.offWhite);
  p1.position.set(-6, FY + FFH/2, -4);
  scene.add(p1);
  const p2 = box(14, FFH, 0.2, P.offWhite);
  p2.position.set(-13, FY + FFH/2, 4.1);
  scene.add(p2);
  // Bed
  const bedBase = box(2.2, 0.42, 2.6, P.timberDk);
  bedBase.position.set(-14, FY + 0.21, 0);
  scene.add(bedBase);
  const mattress = box(2.0, 0.28, 2.4, P.offWhite);
  mattress.position.set(-14, FY + 0.49, 0);
  scene.add(mattress);
  const duvet = box(1.9, 0.14, 2.2, P.white);
  duvet.position.set(-14, FY + 0.56, 0.1);
  scene.add(duvet);
  const pillowL = box(0.7, 0.15, 0.55, P.white);
  pillowL.position.set(-14.55, FY + 0.64, -0.95);
  scene.add(pillowL);
  const pillowR = box(0.7, 0.15, 0.55, P.white);
  pillowR.position.set(-13.45, FY + 0.64, -0.95);
  scene.add(pillowR);
  const headboard = box(2.2, 0.7, 0.12, P.timberDk);
  headboard.position.set(-14, FY + 0.66, -1.35);
  scene.add(headboard);
  // Bedside lamps
  [-14.9, -13.1].forEach(x => {
    const bst = box(0.45, 0.5, 0.4, P.timber);
    bst.position.set(x, FY + 0.25, -0.5);
    scene.add(bst);
    const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.2, 8, 1, true), stdMat(0xe8e0c0, { side: THREE.DoubleSide }));
    ls.position.set(x, FY + 0.65, -0.5);
    scene.add(ls);
    const bl = new THREE.PointLight(0xffe8c0, 0.5, 5);
    bl.position.set(x, FY + 0.65, -0.5);
    scene.add(bl);
  });
  // Wardrobe
  const wrdr = box(8, FFH * 0.9, 0.65, P.white);
  wrdr.position.set(-14, FY + FFH * 0.45, 3.7);
  scene.add(wrdr);
  [-17,-15.5,-14,-12.5,-11].forEach(x => {
    const wd = box(1.35, FFH * 0.88, 0.04, P.offWhite);
    wd.position.set(x, FY + FFH * 0.44, 3.4);
    scene.add(wd);
  });
  // Armchair
  const armSeat = box(0.8, 0.45, 0.8, 0x7a6a5a);
  armSeat.position.set(-18, FY + 0.225, 2);
  scene.add(armSeat);
  const armBack = box(0.8, 0.65, 0.12, 0x7a6a5a);
  armBack.position.set(-18, FY + 0.72, 2.38);
  scene.add(armBack);
}

function buildBedroom(scene, FY, FFH, x, z) {
  const pw = box(0.2, FFH, 8, P.offWhite);
  pw.position.set(x - 3, FY + FFH/2, z + 2);
  scene.add(pw);
  const bedBase = box(1.6, 0.4, 2.0, P.timber);
  bedBase.position.set(x, FY + 0.2, z + 0.5);
  scene.add(bedBase);
  const mattress = box(1.5, 0.22, 1.85, P.offWhite);
  mattress.position.set(x, FY + 0.41, z + 0.5);
  scene.add(mattress);
  const duvet = box(1.45, 0.12, 1.7, 0xd8d0c8);
  duvet.position.set(x, FY + 0.47, z + 0.6);
  scene.add(duvet);
  const headboard = box(1.6, 0.55, 0.1, P.timberDk);
  headboard.position.set(x, FY + 0.55, z - 0.45);
  scene.add(headboard);
  const wrdr = box(1.2, FFH * 0.85, 0.55, P.white);
  wrdr.position.set(x + 2.5, FY + FFH * 0.425, z - 3.0);
  scene.add(wrdr);
}

function buildBathroom(scene, FY, x, z) {
  const bath = box(1.5, 0.5, 0.7, P.white);
  bath.position.set(x - 1, FY + 0.25, z - 2);
  scene.add(bath);
  const bathRim = box(1.52, 0.05, 0.72, P.marble);
  bathRim.position.set(x - 1, FY + 0.51, z - 2);
  scene.add(bathRim);
  const showerBase = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), stdMat(P.stone));
  showerBase.rotation.x = -Math.PI/2;
  showerBase.position.set(x + 1.5, FY + 0.02, z - 2);
  scene.add(showerBase);
  const shGlass = box(0.04, 2.0, 1.0, P.glass, { transparent: true, opacity: 0.3 });
  shGlass.position.set(x + 1.0, FY + 1.0, z - 2);
  scene.add(shGlass);
  const basin = box(0.5, 0.18, 0.38, P.white);
  basin.position.set(x + 0.5, FY + 0.82, z + 1.5);
  scene.add(basin);
  const toilet = box(0.38, 0.4, 0.52, P.white);
  toilet.position.set(x - 2, FY + 0.2, z + 1.5);
  scene.add(toilet);
}

// ─── Roof ────────────────────────────────────────────────────────────────────
function buildRoof(scene) {
  const GFH = 3.4, FFH = 3.0;
  const FY = GFH + 0.3;
  const roofY = FY + FFH;

  const roofSlab = box(42, 0.35, 24, P.concreteDk);
  roofSlab.position.set(0, roofY + 0.17, 0);
  scene.add(roofSlab);
  // Parapets
  [
    [0, roofY + 0.7, 12.1, 42, 0.8, 0.25],
    [0, roofY + 0.7, -12.1, 42, 0.8, 0.25],
    [-21, roofY + 0.7, 0, 0.25, 0.8, 24],
    [21, roofY + 0.7, 0, 0.25, 0.8, 24],
  ].forEach(([x,y,z,w,h,d]) => {
    const p = box(w, h, d, P.concrete);
    p.position.set(x, y, z);
    scene.add(p);
  });
  // Roof lantern over living room (double-height zone)
  const lantern = box(10, 0.35, 8, P.glass, { transparent: true, opacity: 0.5, roughness: 0.05, metalness: 0.3 });
  lantern.position.set(-13, roofY + 0.17, 2);
  scene.add(lantern);
  const lFrame = box(10.2, 0.08, 8.2, P.steelDk);
  lFrame.position.set(-13, roofY + 0.04, 2);
  scene.add(lFrame);
  [-4, 0, 4].forEach(dx => {
    const bar = box(0.05, 0.35, 8, P.steelDk);
    bar.position.set(-13 + dx, roofY + 0.17, 2);
    scene.add(bar);
  });
  // Skylights over landing
  [0, 5].forEach(dx => {
    const sky = box(1.2, 0.12, 0.8, P.glass, { transparent: true, opacity: 0.55, roughness: 0.05 });
    sky.position.set(2 + dx, roofY + 0.18, -4);
    scene.add(sky);
  });
}

// ─── Terrace ─────────────────────────────────────────────────────────────────
function buildTerrace(scene) {
  const terrace = new THREE.Mesh(new THREE.PlaneGeometry(42, 12), stdMat(P.stone));
  terrace.rotation.x = -Math.PI/2;
  terrace.position.set(0, 0.02, 17);
  terrace.receiveShadow = true;
  scene.add(terrace);
  // Paver joints
  for (let i = -20; i < 22; i += 1.2) {
    const joint = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 12), stdMat(P.stoneDk));
    joint.rotation.x = -Math.PI/2;
    joint.position.set(i, 0.025, 17);
    scene.add(joint);
  }
  // Steps down
  const step1 = box(40, 0.15, 0.5, P.stoneDk);
  step1.position.set(0, 0.075, 23.2);
  scene.add(step1);
  const step2 = box(40, 0.15, 0.5, P.stone);
  step2.position.set(0, -0.05, 23.7);
  scene.add(step2);
  // Outdoor dining
  const oTable = box(2.0, 0.04, 1.0, P.steelDk, { metalness: 0.7, roughness: 0.3 });
  oTable.position.set(-8, 0.76, 17);
  scene.add(oTable);
  [[-0.8,-0.4],[0.8,-0.4],[-0.8,0.4],[0.8,0.4]].forEach(([dx,dz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.73, 6), stdMat(P.steelDk));
    leg.position.set(-8+dx, 0.365, 17+dz);
    scene.add(leg);
  });
  [[-9.3,16.4],[-6.7,16.4],[-9.3,17.6],[-6.7,17.6]].forEach(([x,z]) => {
    const s = box(0.4, 0.04, 0.4, P.steel, { metalness: 0.6 });
    s.position.set(x, 0.46, z);
    scene.add(s);
  });
  // Concrete bench
  const bench = box(10, 0.4, 0.5, P.concrete);
  bench.position.set(8, 0.2, 12.5);
  scene.add(bench);
  const benchSeat = box(10, 0.06, 0.5, P.timber);
  benchSeat.position.set(8, 0.43, 12.5);
  scene.add(benchSeat);
  // Planters with shrubs
  [-18, 18].forEach(x => {
    const planter = box(1.2, 0.6, 8, P.concreteDk);
    planter.position.set(x, 0.3, 17);
    scene.add(planter);
    [-2.5, 0, 2.5].forEach(dz => {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 5), stdMat(P.grass));
      shrub.position.set(x, 1.1, 17 + dz);
      shrub.castShadow = true;
      scene.add(shrub);
    });
  });
}

// ─── Pool ────────────────────────────────────────────────────────────────────
function buildPool(scene) {
  const poolSurround = plane(18, 7, P.stone);
  poolSurround.position.set(5, 0.01, 30);
  scene.add(poolSurround);
  const poolWater = plane(13.8, 3.4, P.water);
  poolWater.position.set(5, -0.08, 30);
  scene.add(poolWater);
  // Perimeter lip
  [[5, 30+1.75, 14.3, 0.12, 0.12], [5, 30-1.75, 14.3, 0.12, 0.12]].forEach(([x,z,w,h,d]) => {
    const lip = box(w, h, d, P.marble);
    lip.position.set(x, 0.06, z);
    scene.add(lip);
  });
  [[5+7, 30, 0.12, 0.12, 3.5], [5-7, 30, 0.12, 0.12, 3.5]].forEach(([x,z,w,h,d]) => {
    const lip = box(w, h, d, P.marble);
    lip.position.set(x, 0.06, z);
    scene.add(lip);
  });
  // Pool walls below water
  const pBottom = plane(14, 3.5, 0x2a6080);
  pBottom.position.set(5, -1.4, 30);
  scene.add(pBottom);
  // Sun loungers
  [28, 32].forEach(z => {
    const lounger = box(1.8, 0.08, 0.65, P.offWhite);
    lounger.position.set(14, 0.04, z);
    scene.add(lounger);
    const headEnd = box(1.8, 0.3, 0.08, P.offWhite);
    headEnd.position.set(14, 0.19, z - 0.38);
    headEnd.rotation.x = -0.4;
    scene.add(headEnd);
    const towel = box(1.5, 0.03, 0.5, 0x8ab8d8);
    towel.position.set(14, 0.14, z);
    scene.add(towel);
  });
}

// ─── Garden ──────────────────────────────────────────────────────────────────
function buildGarden(scene) {
  const meadow = plane(30, 20, 0x7aaa40);
  meadow.position.set(-5, 0.02, 58);
  scene.add(meadow);
  // Wildflower patches
  [[-8,52],[5,60],[10,54],[-3,58]].forEach(([x,z]) => {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(1.4, 8), stdMat(0xc88040));
    patch.rotation.x = -Math.PI/2;
    patch.position.set(x, 0.03, z);
    scene.add(patch);
  });
  // Retaining wall
  const retWall = box(40, 0.5, 0.3, P.stoneDk);
  retWall.position.set(0, 0.25, 44);
  scene.add(retWall);
}

// ─── Garden Studio ───────────────────────────────────────────────────────────
function buildStudio(scene) {
  const sx = 22, sz = 35, sw = 7, sh = 2.8, sd = 5;
  const sFloor = plane(sw, sd, P.floorWood);
  sFloor.position.set(sx, 0.01, sz);
  scene.add(sFloor);
  const wallS = box(sw, sh, 0.2, P.timber);
  wallS.position.set(sx, sh/2, sz - sd/2);
  scene.add(wallS);
  const wallN = box(sw, sh, 0.2, P.timber);
  wallN.position.set(sx, sh/2, sz + sd/2);
  scene.add(wallN);
  const wallW = box(0.2, sh, sd, P.timber);
  wallW.position.set(sx - sw/2, sh/2, sz);
  scene.add(wallW);
  // East wall — mostly glass
  const sGlass = box(sw * 0.85, sh * 0.8, 0.06, P.glass, { transparent: true, opacity: 0.4, roughness: 0.05 });
  sGlass.position.set(sx, sh * 0.45, sz + sd/2);
  scene.add(sGlass);
  const sRoof = box(sw + 0.4, 0.2, sd + 0.4, P.timberDk);
  sRoof.position.set(sx, sh + 0.1, sz);
  scene.add(sRoof);
  // Desk inside
  const stDesk = box(1.5, 0.05, 0.7, P.timberDk);
  stDesk.position.set(sx, 0.73, sz + 1.5);
  scene.add(stDesk);
  // Path
  const stPath = plane(1.2, 6, P.gravel);
  stPath.position.set(sx - sw/2 - 0.6, 0.02, sz - 1);
  scene.add(stPath);
}

// ─── Kitchen Garden ──────────────────────────────────────────────────────────
function buildKitchenGarden(scene) {
  const kgx = -22, kgz = 40;
  // Walls
  [
    [kgx, kgz - 8, 14, 0.7, 0.25],
    [kgx, kgz + 8, 14, 0.7, 0.25],
    [kgx - 7, kgz, 0.25, 0.7, 14],
    [kgx + 7, kgz, 0.25, 0.7, 14],
  ].forEach(([x,z,w,h,d]) => {
    const wall = box(w, h, d, P.stoneDk);
    wall.position.set(x, h/2, z);
    scene.add(wall);
  });
  // Raised beds
  [[-2,-3],[2,-3],[-2,2],[2,2]].forEach(([dx,dz]) => {
    const bed = box(2.8, 0.35, 2.2, P.stoneDk);
    bed.position.set(kgx+dx, 0.175, kgz+dz);
    scene.add(bed);
    const soil = plane(2.6, 2.0, P.soil);
    soil.position.set(kgx+dx, 0.36, kgz+dz);
    scene.add(soil);
    for (let r = -0.7; r <= 0.7; r += 0.35) {
      for (let c = -0.8; c <= 0.8; c += 0.3) {
        const plant = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.18 + Math.random()*0.12, 5),
          stdMat(0x4a8a30)
        );
        plant.position.set(kgx+dx+c, 0.48, kgz+dz+r);
        scene.add(plant);
      }
    }
  });
  const kgPath = plane(1.0, 16, P.gravel);
  kgPath.position.set(kgx, 0.02, kgz);
  scene.add(kgPath);
  const butt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.8, 10), stdMat(P.steelDk));
  butt.position.set(kgx + 6, 0.4, kgz - 6);
  scene.add(butt);
}

// ─── Driveway ────────────────────────────────────────────────────────────────
function buildDriveway(scene) {
  const drive = plane(14, 28, P.gravel);
  drive.position.set(18, 0.02, -14);
  scene.add(drive);
  [-4, 4].forEach(dx => {
    const pillar = box(0.5, 1.2, 0.5, P.stone);
    pillar.position.set(18+dx, 0.6, -27.5);
    scene.add(pillar);
    const cap = box(0.65, 0.12, 0.65, P.stoneDk);
    cap.position.set(18+dx, 1.26, -27.5);
    scene.add(cap);
  });
  [-25, -22, -19].forEach(z => {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.6, 8), stdMat(P.steelDk));
    bollard.position.set(22, 0.3, z);
    scene.add(bollard);
    const bl = new THREE.PointLight(0xffee88, 0.4, 4);
    bl.position.set(22, 0.65, z);
    scene.add(bl);
  });
}

// ─── Trees ───────────────────────────────────────────────────────────────────
function buildTrees(scene) {
  const treeData = [
    [-30, 45, 0.9], [-30, 28, 0.7], [30, 52, 1.0], [25, 42, 0.8],
    [-10, 65, 1.1], [15, 62, 0.9], [-22, 58, 0.85], [5, 72, 1.2],
    [-35, 60, 0.95], [35, 35, 0.7],
    [12, -16, 0.5], [12, -20, 0.5], [12, -24, 0.5], // avenue
    [-25, 15, 0.75], [-28, 5, 0.7],
  ];
  treeData.forEach(([x, z, scale]) => {
    const trunkH = 3.5 * scale;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, trunkH, 8),
      stdMat(P.timberDk)
    );
    trunk.position.set(x, trunkH/2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    [[0, trunkH + 1.2*scale, 0, 2.0*scale],
     [-0.6*scale, trunkH + 0.7*scale, 0.4*scale, 1.4*scale],
     [0.5*scale, trunkH + 0.9*scale, -0.3*scale, 1.5*scale]].forEach(([dx,dy,dz,r]) => {
      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(r, 7, 5),
        stdMat(P.grass)
      );
      canopy.position.set(x+dx, dy, z+dz);
      canopy.castShadow = true;
      scene.add(canopy);
    });
  });
}
