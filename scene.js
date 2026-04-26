/**
 * House — Scene Builder
 * Constructs the designer house geometry. All materials PBR-ready.
 */
import * as THREE from 'three';

const C = {
  // Exterior
  concrete:     0xd4cfc8,
  concreteDark: 0xb8b4ae,
  timber:       0x8b6914,
  timberDark:   0x6b4f10,
  glass:        0x8ab8cc,
  glassFrame:   0x2a2a2a,
  roofFlat:     0x4a4845,
  // Interior
  floorWood:    0xc4956a,
  floorTile:    0xe8e4de,
  wallPlaster:  0xf2ede8,
  wallAccent:   0x3d4f5c,
  ceiling:      0xfaf8f5,
  // Garden
  grass:        0x5a8a3c,
  gravel:       0xb8b0a4,
  stone:        0x8a8480,
  soil:         0x6b5040,
};

function mat(color, roughness = 0.85, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(w, h, d, color, roughness) {
  const geo = new THREE.BoxGeometry(w, h, d);
  return new THREE.Mesh(geo, mat(color, roughness));
}

export function buildHouse(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // ── Ground ──────────────────────────────────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    mat(C.grass, 0.95)
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  group.add(ground);

  // Gravel driveway / entrance path
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 12),
    mat(C.gravel, 0.9)
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, 7);
  group.add(path);

  // ── House footprint: two interlocking volumes ─────────────────────────────
  // Main volume — 12m wide, 7m tall, 9m deep
  const mainBody = box(12, 7, 9, C.concrete, 0.88);
  mainBody.position.set(0, 3.5, 0);
  group.add(mainBody);

  // Side wing — lower, extends to the right
  const wing = box(6, 4, 7, C.concrete, 0.88);
  wing.position.set(9, 2, 1);
  group.add(wing);

  // Flat roof details (parapet)
  const parapet1 = box(12.4, 0.3, 0.2, C.roofFlat, 0.9);
  parapet1.position.set(0, 7.15, -4.5);
  group.add(parapet1);
  const parapet2 = parapet1.clone();
  parapet2.position.set(0, 7.15, 4.5);
  group.add(parapet2);

  // ── Timber cladding strip (horizontal bands) ───────────────────────────────
  for (let i = 0; i < 5; i++) {
    const plank = box(12, 0.22, 0.12, i % 2 === 0 ? C.timber : C.timberDark, 0.75);
    plank.position.set(0, 1.2 + i * 1.1, -4.62);
    group.add(plank);
  }

  // ── Windows — front façade ─────────────────────────────────────────────────
  function addWindow(x, y, z, w, h, rot = 0) {
    const frame = box(w + 0.12, h + 0.12, 0.15, C.glassFrame, 0.6);
    frame.position.set(x, y, z);
    frame.rotation.y = rot;
    group.add(frame);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.06),
      new THREE.MeshStandardMaterial({
        color: C.glass,
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
      })
    );
    glass.position.set(x, y, rot === 0 ? z + 0.01 : z);
    glass.rotation.y = rot;
    group.add(glass);
  }

  // Large picture windows on front
  addWindow(-3.5, 4.2, -4.57, 4, 2.2);
  addWindow(3.5, 4.2, -4.57, 2.5, 2.2);
  addWindow(0, 1.5, -4.57, 6, 1.8);

  // Side windows
  addWindow(-6.07, 4, -1, 0.12, 2, Math.PI / 2);
  addWindow(-6.07, 4, 2, 0.12, 2, Math.PI / 2);

  // Wing windows (right side)
  addWindow(12.07, 2, 0, 0.12, 1.6, Math.PI / 2);
  addWindow(12.07, 2, 2.5, 0.12, 1.6, Math.PI / 2);

  // ── Front door ────────────────────────────────────────────────────────────
  const door = box(1.1, 2.3, 0.1, C.glassFrame, 0.5);
  door.position.set(-0.5, 1.15, -4.6);
  group.add(door);

  // Door handle
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8),
    mat(0xc0a030, 0.2, 0.9) // brass
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0.15, 1.1, -4.66);
  group.add(handle);

  // ── Canopy over entrance ───────────────────────────────────────────────────
  const canopy = box(3, 0.12, 2, C.concrete, 0.9);
  canopy.position.set(-0.5, 2.5, -5.6);
  group.add(canopy);

  const canopyPost = box(0.08, 2.5, 0.08, C.glassFrame, 0.6);
  canopyPost.position.set(1, 1.25, -6.5);
  group.add(canopyPost);

  // ── Interior — ground floor (visible through glass) ──────────────────────
  // Floor
  const indoorFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 8.8),
    mat(C.floorWood, 0.6)
  );
  indoorFloor.rotation.x = -Math.PI / 2;
  indoorFloor.position.set(0, 0.02, 0);
  group.add(indoorFloor);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 8.8),
    mat(C.ceiling, 0.95)
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 3.1, 0);
  group.add(ceiling);

  // Internal walls (suggest rooms)
  const partition1 = box(0.1, 3, 4.5, C.wallPlaster, 0.95);
  partition1.position.set(2, 1.5, 2.2);
  group.add(partition1);

  // ── Furniture (rough geometry, will be refined) ───────────────────────────
  // Sofa — L-shape
  const sofaBody = box(3.2, 0.5, 1.0, 0x7a7060, 0.9);
  sofaBody.position.set(-2, 0.45, 1.5);
  group.add(sofaBody);

  const sofaBack = box(3.2, 0.65, 0.28, 0x7a7060, 0.9);
  sofaBack.position.set(-2, 0.77, 1.97);
  group.add(sofaBack);

  const sofaArm = box(0.28, 0.6, 1.0, 0x7a7060, 0.9);
  sofaArm.position.set(-3.44, 0.55, 1.5);
  group.add(sofaArm);

  // Coffee table — smoked glass
  const coffeeTable = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.06, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.6 })
  );
  coffeeTable.position.set(-2, 0.4, 0.5);
  group.add(coffeeTable);

  // Table legs
  for (const [lx, lz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) {
    const leg = box(0.04, 0.38, 0.04, 0x1a1a1a, 0.3);
    leg.position.set(-2 + lx, 0.19, 0.5 + lz);
    group.add(leg);
  }

  // Dining table
  const diningTable = box(2.2, 0.06, 0.95, C.timberDark, 0.5);
  diningTable.position.set(3.5, 0.76, 1.2);
  group.add(diningTable);

  for (const [lx, lz] of [[-1.0, -0.4], [1.0, -0.4], [-1.0, 0.4], [1.0, 0.4]]) {
    const leg = box(0.05, 0.74, 0.05, C.timberDark, 0.5);
    leg.position.set(3.5 + lx, 0.37, 1.2 + lz);
    group.add(leg);
  }

  // ── Interior lighting ─────────────────────────────────────────────────────
  // Pendant light over dining
  const pendantLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xfff5d0, emissive: 0xffeaa0, emissiveIntensity: 1.5 })
  );
  pendantLight.position.set(3.5, 2.8, 1.2);
  group.add(pendantLight);

  const pendant = new THREE.PointLight(0xffeaa0, 1.8, 6);
  pendant.position.set(3.5, 2.7, 1.2);
  group.add(pendant);

  // Cord
  const cord = box(0.01, 0.4, 0.01, 0x333333, 0.8);
  cord.position.set(3.5, 2.95, 1.2);
  group.add(cord);

  // ── Garden features ───────────────────────────────────────────────────────
  // Low retaining wall
  const wall1 = box(10, 0.5, 0.2, C.stone, 0.9);
  wall1.position.set(-1, 0.25, -8.5);
  group.add(wall1);

  // Planting bed
  const bed = box(4, 0.15, 1.5, C.soil, 0.95);
  bed.position.set(-4, 0.07, -6.5);
  group.add(bed);

  // Simple trees (cone + cylinder)
  function addTree(x, z, h = 2.5, spread = 0.9) {
    const trunk = box(0.18, h * 0.4, 0.18, C.timberDark, 0.85);
    trunk.position.set(x, h * 0.2, z);
    group.add(trunk);
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(spread, h * 0.75, 7),
      mat(0x3a7a2a, 0.85)
    );
    canopy.position.set(x, h * 0.6 + spread * 0.3, z);
    group.add(canopy);
  }

  addTree(-8, -5, 5, 1.5);
  addTree(-9, 2, 4, 1.2);
  addTree(8, -6, 6, 1.8);
  addTree(10, 3, 4.5, 1.3);
  addTree(-5, 8, 3.5, 1.0);
  addTree(6, 9, 4, 1.1);

  return group;
}
