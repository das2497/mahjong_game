import { memo } from 'react';
import { TileData } from '../types';
import { TILE_DISPLAY } from '../tiles';

interface TileProps {
  tile: TileData;
  onClick: (tile: TileData) => void;
  tileWidth: number;
  tileHeight: number;
}

const LAYER_OFFSET_X = 4;
const LAYER_OFFSET_Y = 4;

function TileComponent({ tile, onClick, tileWidth, tileHeight }: TileProps) {
  if (tile.isMatched && !tile.isRemoving) return null;

  const x = tile.col * (tileWidth / 2) + tile.layer * LAYER_OFFSET_X;
  const y = tile.row * (tileHeight / 2) - tile.layer * LAYER_OFFSET_Y;
  const z = tile.layer * 100 + tile.row;

  const key = `${tile.suit}-${tile.value}`;
  const display = TILE_DISPLAY[key];
  const label = display?.label || tile.value;
  const color = display?.color || '#333';

  const suitLabels: Record<string, string> = {
    dots: '筒',
    bamboo: '索',
    chars: '萬',
    wind: '風',
    dragon: '龍',
    flower: '花',
  };

  const suitLabel = suitLabels[tile.suit] || '';
  const isSmall = tileWidth < 45;

  return (
    <div
      className={`absolute select-none ${
        tile.isRemoving ? 'tile-removing' : ''
      }`}
      style={{
        left: x,
        top: y,
        width: tileWidth,
        height: tileHeight,
        zIndex: z,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (tile.isFree && !tile.isRemoving) onClick(tile);
      }}
    >
      {/* 3D depth shadow layers */}
      <div
        className="absolute rounded-md"
        style={{
          left: 3,
          top: 4,
          width: tileWidth - 2,
          height: tileHeight - 2,
          backgroundColor: '#3d2e1a',
          borderRadius: 6,
        }}
      />
      <div
        className="absolute rounded-md"
        style={{
          left: 2,
          top: 3,
          width: tileWidth - 2,
          height: tileHeight - 2,
          backgroundColor: '#5c4a32',
          borderRadius: 6,
        }}
      />
      {/* Main tile face */}
      <div
        className={`
          absolute inset-0 rounded-md cursor-pointer
          flex flex-col items-center justify-center
          transition-all duration-150 overflow-hidden
          ${!tile.isFree ? 'cursor-not-allowed' : ''}
          ${tile.isRemoving ? 'pointer-events-none' : ''}
        `}
        style={{
          background: tile.isFree
            ? tile.isSelected
              ? 'linear-gradient(145deg, #fffde0, #fef3a0)'
              : tile.isHinted
                ? 'linear-gradient(145deg, #e0fffe, #a0f0f0)'
                : 'linear-gradient(145deg, #fffcf0, #f5e6c8)'
            : 'linear-gradient(145deg, #e0d8c8, #ccc0a8)',
          border: tile.isSelected
            ? '2px solid #eab308'
            : tile.isHinted
              ? '2px solid #06b6d4'
              : tile.isFree
                ? '2px solid #d4a574'
                : '2px solid #a89880',
          boxShadow: tile.isSelected
            ? '0 0 12px rgba(234, 179, 8, 0.6), inset 0 1px 0 rgba(255,255,255,0.5)'
            : tile.isHinted
              ? '0 0 12px rgba(6, 182, 212, 0.6), inset 0 1px 0 rgba(255,255,255,0.5)'
              : tile.isFree
                ? 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05)'
                : 'inset 0 1px 0 rgba(255,255,255,0.3)',
          borderRadius: 6,
          transition: tile.isRemoving
            ? 'none'
            : 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
        }}
      >
        {/* Shine effect on top */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: '40%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)',
            borderRadius: '6px 6px 0 0',
          }}
        />
        
        {/* Suit indicator (top-left corner) */}
        <span
          className="absolute font-bold opacity-40 leading-none"
          style={{
            color,
            fontSize: isSmall ? '7px' : '9px',
            top: isSmall ? 2 : 3,
            left: isSmall ? 3 : 4,
          }}
        >
          {suitLabel}
        </span>

        {/* Main character */}
        <span
          className="font-bold leading-none relative"
          style={{
            color,
            fontSize: isSmall ? '14px' : tileWidth > 52 ? '20px' : '16px',
            textShadow: `0 1px 1px rgba(0,0,0,0.1)`,
          }}
        >
          {label}
        </span>

        {/* Value indicator for numbered suits */}
        {(tile.suit === 'dots' || tile.suit === 'bamboo' || tile.suit === 'chars') && (
          <span
            className="font-semibold opacity-60 leading-none relative"
            style={{
              color,
              fontSize: isSmall ? '8px' : '10px',
              marginTop: -1,
            }}
          >
            {tile.value}
          </span>
        )}

        {/* Hover overlay for free tiles */}
        {tile.isFree && !tile.isSelected && !tile.isHinted && (
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-150 pointer-events-none rounded-md"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,200,0.3), rgba(255,200,100,0.15))',
              border: '2px solid rgba(234, 179, 8, 0.4)',
              borderRadius: 5,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default memo(TileComponent);
