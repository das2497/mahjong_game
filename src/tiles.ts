export interface TileType {
  suit: string;
  value: string;
  symbol: string;
}

// Mahjong tile definitions - each type appears 4 times
export const TILE_TYPES: TileType[] = [
  // Dots (circles) 1-9
  { suit: 'dots', value: '1', symbol: '🀙' },
  { suit: 'dots', value: '2', symbol: '🀚' },
  { suit: 'dots', value: '3', symbol: '🀛' },
  { suit: 'dots', value: '4', symbol: '🀜' },
  { suit: 'dots', value: '5', symbol: '🀝' },
  { suit: 'dots', value: '6', symbol: '🀞' },
  { suit: 'dots', value: '7', symbol: '🀟' },
  { suit: 'dots', value: '8', symbol: '🀠' },
  { suit: 'dots', value: '9', symbol: '🀡' },
  // Bamboo 1-9
  { suit: 'bamboo', value: '1', symbol: '🀐' },
  { suit: 'bamboo', value: '2', symbol: '🀑' },
  { suit: 'bamboo', value: '3', symbol: '🀒' },
  { suit: 'bamboo', value: '4', symbol: '🀓' },
  { suit: 'bamboo', value: '5', symbol: '🀔' },
  { suit: 'bamboo', value: '6', symbol: '🀕' },
  { suit: 'bamboo', value: '7', symbol: '🀖' },
  { suit: 'bamboo', value: '8', symbol: '🀗' },
  { suit: 'bamboo', value: '9', symbol: '🀘' },
  // Characters 1-9
  { suit: 'chars', value: '1', symbol: '🀇' },
  { suit: 'chars', value: '2', symbol: '🀈' },
  { suit: 'chars', value: '3', symbol: '🀉' },
  { suit: 'chars', value: '4', symbol: '🀊' },
  { suit: 'chars', value: '5', symbol: '🀋' },
  { suit: 'chars', value: '6', symbol: '🀌' },
  { suit: 'chars', value: '7', symbol: '🀍' },
  { suit: 'chars', value: '8', symbol: '🀎' },
  { suit: 'chars', value: '9', symbol: '🀏' },
  // Winds
  { suit: 'wind', value: 'east', symbol: '🀀' },
  { suit: 'wind', value: 'south', symbol: '🀁' },
  { suit: 'wind', value: 'west', symbol: '🀂' },
  { suit: 'wind', value: 'north', symbol: '🀃' },
  // Dragons
  { suit: 'dragon', value: 'red', symbol: '🀄' },
  { suit: 'dragon', value: 'green', symbol: '🀅' },
  { suit: 'dragon', value: 'white', symbol: '🀆' },
  // Flowers (each unique but match with each other)
  { suit: 'flower', value: 'plum', symbol: '🏵️' },
  { suit: 'flower', value: 'orchid', symbol: '🌸' },
  { suit: 'flower', value: 'chrysanthemum', symbol: '🌼' },
  { suit: 'flower', value: 'bamboo_f', symbol: '🎋' },
];

// For display purposes - fallback symbols using text
export const TILE_DISPLAY: Record<string, { label: string; color: string }> = {
  'dots-1': { label: '一筒', color: '#1a5fb4' },
  'dots-2': { label: '二筒', color: '#1a5fb4' },
  'dots-3': { label: '三筒', color: '#1a5fb4' },
  'dots-4': { label: '四筒', color: '#1a5fb4' },
  'dots-5': { label: '五筒', color: '#1a5fb4' },
  'dots-6': { label: '六筒', color: '#1a5fb4' },
  'dots-7': { label: '七筒', color: '#1a5fb4' },
  'dots-8': { label: '八筒', color: '#1a5fb4' },
  'dots-9': { label: '九筒', color: '#1a5fb4' },
  'bamboo-1': { label: '一索', color: '#26a269' },
  'bamboo-2': { label: '二索', color: '#26a269' },
  'bamboo-3': { label: '三索', color: '#26a269' },
  'bamboo-4': { label: '四索', color: '#26a269' },
  'bamboo-5': { label: '五索', color: '#26a269' },
  'bamboo-6': { label: '六索', color: '#26a269' },
  'bamboo-7': { label: '七索', color: '#26a269' },
  'bamboo-8': { label: '八索', color: '#26a269' },
  'bamboo-9': { label: '九索', color: '#26a269' },
  'chars-1': { label: '一萬', color: '#c01c28' },
  'chars-2': { label: '二萬', color: '#c01c28' },
  'chars-3': { label: '三萬', color: '#c01c28' },
  'chars-4': { label: '四萬', color: '#c01c28' },
  'chars-5': { label: '五萬', color: '#c01c28' },
  'chars-6': { label: '六萬', color: '#c01c28' },
  'chars-7': { label: '七萬', color: '#c01c28' },
  'chars-8': { label: '八萬', color: '#c01c28' },
  'chars-9': { label: '九萬', color: '#c01c28' },
  'wind-east': { label: '東', color: '#613583' },
  'wind-south': { label: '南', color: '#613583' },
  'wind-west': { label: '西', color: '#613583' },
  'wind-north': { label: '北', color: '#613583' },
  'dragon-red': { label: '中', color: '#e01b24' },
  'dragon-green': { label: '發', color: '#33d17a' },
  'dragon-white': { label: '白', color: '#5e5c64' },
  'flower-plum': { label: '梅', color: '#e66100' },
  'flower-orchid': { label: '蘭', color: '#e66100' },
  'flower-chrysanthemum': { label: '菊', color: '#e66100' },
  'flower-bamboo_f': { label: '竹', color: '#e66100' },
};
