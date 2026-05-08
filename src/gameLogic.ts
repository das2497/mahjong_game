import { TileData, LayoutPosition, GameState } from './types';
import { TILE_TYPES, TileType } from './tiles';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if two tiles match (same suit and value, or both flowers)
export function tilesMatch(a: TileData, b: TileData): boolean {
  if (a.id === b.id) return false;
  // Flowers all match each other
  if (a.suit === 'flower' && b.suit === 'flower') return true;
  return a.suit === b.suit && a.value === b.value;
}

// Check if a tile is free (can be selected)
// A tile is free if:
// 1. No tile is directly on top of it (covering it)
// 2. It has at least one free side (left OR right not blocked)
export function isTileFree(tile: TileData, allTiles: TileData[]): boolean {
  if (tile.isMatched) return false;
  
  const activeTiles = allTiles.filter(t => !t.isMatched);
  
  // Check if any tile on a higher layer overlaps this tile
  const isBlocked = activeTiles.some(t => {
    if (t.id === tile.id) return false;
    if (t.layer <= tile.layer) return false;
    // Tiles overlap if their positions overlap (each tile is 2x2 in half-units)
    const overlapX = Math.abs(t.col - tile.col) < 2;
    const overlapY = Math.abs(t.row - tile.row) < 2;
    return overlapX && overlapY;
  });
  
  if (isBlocked) return false;
  
  // Check left and right sides on the same layer
  const leftBlocked = activeTiles.some(t => {
    if (t.id === tile.id) return false;
    if (t.layer !== tile.layer) return false;
    return t.col === tile.col - 2 && Math.abs(t.row - tile.row) < 2;
  });
  
  const rightBlocked = activeTiles.some(t => {
    if (t.id === tile.id) return false;
    if (t.layer !== tile.layer) return false;
    return t.col === tile.col + 2 && Math.abs(t.row - tile.row) < 2;
  });
  
  // Tile is free if at least one side is open
  return !leftBlocked || !rightBlocked;
}

// Update the free status of all tiles
export function updateFreeTiles(tiles: TileData[]): TileData[] {
  return tiles.map(tile => ({
    ...tile,
    isFree: isTileFree(tile, tiles),
  }));
}

// Find all available matching pairs among free tiles
export function findMatchingPairs(tiles: TileData[]): [TileData, TileData][] {
  const freeTiles = tiles.filter(t => t.isFree && !t.isMatched);
  const pairs: [TileData, TileData][] = [];
  
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (tilesMatch(freeTiles[i], freeTiles[j])) {
        pairs.push([freeTiles[i], freeTiles[j]]);
      }
    }
  }
  
  return pairs;
}

// Get a hint (one matching pair)
export function getHint(tiles: TileData[]): [TileData, TileData] | null {
  const pairs = findMatchingPairs(tiles);
  if (pairs.length === 0) return null;
  return pairs[Math.floor(Math.random() * pairs.length)];
}

// Check game state
export function checkGameState(tiles: TileData[]): GameState {
  const remaining = tiles.filter(t => !t.isMatched);
  if (remaining.length === 0) return 'won';
  
  const pairs = findMatchingPairs(tiles);
  if (pairs.length === 0) return 'lost';
  
  return 'playing';
}

// Create tile assignments for positions - guarantees all tiles can be paired
export function createTiles(positions: LayoutPosition[]): TileData[] {
  const count = positions.length;
  // Must be even
  const pairCount = Math.floor(count / 2);
  
  // Build a pool of pair-types
  // Regular tiles (35 types) can each produce pairs
  // Flowers (4 tiles) all match each other, so any 2 flowers form a pair
  const regularTiles = TILE_TYPES.filter(t => t.suit !== 'flower');
  const flowerTiles = TILE_TYPES.filter(t => t.suit === 'flower');
  
  // We'll create exactly pairCount pairs
  const pairs: [TileType, TileType][] = [];
  
  // First, add flower pairs (use 2 pairs of flowers = 4 flower tiles)
  const flowerPairCount = Math.min(2, pairCount);
  for (let i = 0; i < flowerPairCount; i++) {
    pairs.push([flowerTiles[i * 2 % flowerTiles.length], flowerTiles[(i * 2 + 1) % flowerTiles.length]]);
  }
  
  // Fill remaining with regular tile pairs (each regular type can have up to 2 pairs = 4 tiles)
  const shuffledRegular = shuffle(regularTiles);
  let regIdx = 0;
  const usageCount = new Map<string, number>();
  
  while (pairs.length < pairCount) {
    const tt = shuffledRegular[regIdx % shuffledRegular.length];
    const key = `${tt.suit}-${tt.value}`;
    const used = usageCount.get(key) || 0;
    
    if (used < 2) { // Max 2 pairs (4 tiles) per type
      pairs.push([tt, tt]);
      usageCount.set(key, used + 1);
    }
    
    regIdx++;
    
    // Safety: if we've gone through all types twice, reset
    if (regIdx > shuffledRegular.length * 3) {
      // Just reuse any type
      const tt2 = shuffledRegular[pairs.length % shuffledRegular.length];
      pairs.push([tt2, tt2]);
    }
  }
  
  // Flatten pairs into single array and shuffle
  const allTileTypes: TileType[] = [];
  for (const [a, b] of pairs) {
    allTileTypes.push(a, b);
  }
  
  const shuffledTiles = shuffle(allTileTypes).slice(0, count);
  
  // Assign to positions
  return positions.map((pos, i) => ({
    id: i,
    suit: shuffledTiles[i].suit,
    value: shuffledTiles[i].value,
    symbol: shuffledTiles[i].symbol,
    col: pos.col,
    row: pos.row,
    layer: pos.layer,
    isFree: false,
    isSelected: false,
    isHinted: false,
    isRemoving: false,
    isMatched: false,
  }));
}

// Shuffle remaining tiles in place (keeping positions, randomizing tile faces)
// Ensures tiles still form valid pairs
export function shuffleRemainingTiles(tiles: TileData[]): TileData[] {
  const remaining = tiles.filter(t => !t.isMatched);
  const matched = tiles.filter(t => t.isMatched);
  
  // Extract tile type info from remaining
  const tileTypes = remaining.map(t => ({
    suit: t.suit,
    value: t.value,
    symbol: t.symbol,
  }));
  
  const shuffledTypes = shuffle(tileTypes);
  
  const newRemaining = remaining.map((tile, i) => ({
    ...tile,
    suit: shuffledTypes[i].suit,
    value: shuffledTypes[i].value,
    symbol: shuffledTypes[i].symbol,
    isSelected: false,
    isHinted: false,
  }));
  
  return [...newRemaining, ...matched];
}
