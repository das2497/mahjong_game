import { LayoutPosition } from './types';

// Classic "Turtle" Mahjong layout - exactly 144 tiles
// Coordinates use a grid where each tile occupies 2x2 units
export function getClassicLayout(): LayoutPosition[] {
  const positions: LayoutPosition[] = [];

  // === Layer 0 (86 tiles) ===
  const layer0: [number, number][] = [];
  
  // Row 0: 12 tiles
  for (let c = 2; c <= 24; c += 2) layer0.push([c, 0]);
  
  // Row 1: 8 tiles
  for (let c = 6; c <= 20; c += 2) layer0.push([c, 2]);
  
  // Row 2: 10 tiles
  for (let c = 4; c <= 22; c += 2) layer0.push([c, 4]);
  
  // Row 3: 12 tiles + left wing + right wing = 14
  layer0.push([0, 6]);
  for (let c = 2; c <= 24; c += 2) layer0.push([c, 6]);
  layer0.push([26, 6]);
  
  // Row 4: same as row 3 = 14
  layer0.push([0, 8]);
  for (let c = 2; c <= 24; c += 2) layer0.push([c, 8]);
  layer0.push([26, 8]);
  
  // Row 5: 10 tiles
  for (let c = 4; c <= 22; c += 2) layer0.push([c, 10]);
  
  // Row 6: 8 tiles
  for (let c = 6; c <= 20; c += 2) layer0.push([c, 12]);
  
  // Row 7: 12 tiles
  for (let c = 2; c <= 24; c += 2) layer0.push([c, 14]);
  
  // Layer 0 count: 12 + 8 + 10 + 14 + 14 + 10 + 8 + 12 = 88

  for (const [c, r] of layer0) {
    positions.push({ col: c, row: r, layer: 0 });
  }

  // === Layer 1 (36 tiles) - 6 columns × 6 rows ===
  for (let r = 2; r <= 12; r += 2) {
    for (let c = 7; c <= 17; c += 2) {
      positions.push({ col: c, row: r, layer: 1 });
    }
  }
  // 6 × 6 = 36

  // === Layer 2 (16 tiles) - 4 columns × 4 rows ===
  for (let r = 4; r <= 10; r += 2) {
    for (let c = 9; c <= 15; c += 2) {
      positions.push({ col: c, row: r, layer: 2 });
    }
  }
  // 4 × 4 = 16

  // === Layer 3 (4 tiles) - 2 × 2 ===
  for (let r = 6; r <= 8; r += 2) {
    for (let c = 11; c <= 13; c += 2) {
      positions.push({ col: c, row: r, layer: 3 });
    }
  }
  // 2 × 2 = 4

  // Total: 88 + 36 + 16 + 4 = 144 ✓

  return positions;
}
