export interface TileData {
  id: number;
  suit: string;
  value: string;
  symbol: string;
  // Position in the layout grid
  col: number;
  row: number;
  layer: number;
  // State
  isFree: boolean;
  isSelected: boolean;
  isHinted: boolean;
  isRemoving: boolean;
  isMatched: boolean;
}

export interface LayoutPosition {
  col: number;
  row: number;
  layer: number;
}

export type GameState = 'playing' | 'won' | 'lost';
