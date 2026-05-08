import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { TileData, GameState } from '../types';
import { getClassicLayout } from '../layouts';
import {
  createTiles,
  updateFreeTiles,
  tilesMatch,
  getHint,
  checkGameState,
  shuffleRemainingTiles,
  findMatchingPairs,
} from '../gameLogic';
import TileComponent from './Tile';

export default function GameBoard() {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [shufflesLeft, setShufflesLeft] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [combo, setCombo] = useState(0);
  const [matchFlash, setMatchFlash] = useState('');
  const lastMatchTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameState]);

  const initGame = useCallback(() => {
    const layout = getClassicLayout();
    let newTiles = createTiles(layout);
    newTiles = updateFreeTiles(newTiles);
    setTiles(newTiles);
    setGameState('playing');
    setScore(0);
    setMoves(0);
    setHintsUsed(0);
    setShufflesLeft(3);
    setTimer(0);
    setIsRunning(true);
    setShowWinModal(false);
    setShowLoseModal(false);
    setCombo(0);
    setMatchFlash('');
    lastMatchTime.current = 0;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleTileClick = useCallback(
    (clickedTile: TileData) => {
      if (gameState !== 'playing') return;

      setTiles(prev => {
        const selected = prev.find(t => t.isSelected && !t.isMatched);

        // Deselect if clicking same tile
        if (selected && selected.id === clickedTile.id) {
          return prev.map(t => ({ ...t, isSelected: false, isHinted: false }));
        }

        if (selected) {
          // Check match
          if (tilesMatch(selected, clickedTile)) {
            const now = Date.now();
            const isCombo = now - lastMatchTime.current < 3000;
            lastMatchTime.current = now;

            const newCombo = isCombo ? combo + 1 : 0;
            setCombo(newCombo);

            const comboBonus = newCombo * 15;
            const points = 50 + comboBonus;
            setScore(s => s + points);
            setMoves(m => m + 1);
            setMatchFlash(`+${points}`);
            setTimeout(() => setMatchFlash(''), 1200);

            // Mark tiles as removing (animation)
            const withRemoving = prev.map(t => {
              if (t.id === selected.id || t.id === clickedTile.id) {
                return { ...t, isSelected: false, isHinted: false, isRemoving: true };
              }
              return { ...t, isSelected: false, isHinted: false };
            });

            // After animation completes, mark as matched and update free tiles
            setTimeout(() => {
              setTiles(prevTiles => {
                const withMatched = prevTiles.map(t => {
                  if (t.id === selected.id || t.id === clickedTile.id) {
                    return { ...t, isMatched: true, isRemoving: false };
                  }
                  return t;
                });
                const updated = updateFreeTiles(withMatched);
                const state = checkGameState(updated);
                if (state === 'won') {
                  setGameState('won');
                  setIsRunning(false);
                  setTimeout(() => setShowWinModal(true), 600);
                } else if (state === 'lost') {
                  setGameState('lost');
                  setIsRunning(false);
                  setTimeout(() => setShowLoseModal(true), 600);
                }
                return updated;
              });
            }, 400);

            return withRemoving;
          } else {
            // No match - select new tile, give feedback
            return prev.map(t => ({
              ...t,
              isSelected: t.id === clickedTile.id,
              isHinted: false,
            }));
          }
        }

        // First selection
        return prev.map(t => ({
          ...t,
          isSelected: t.id === clickedTile.id,
          isHinted: false,
        }));
      });
    },
    [gameState, combo],
  );

  const handleHint = useCallback(() => {
    if (gameState !== 'playing') return;
    const hint = getHint(tiles);
    if (hint) {
      setHintsUsed(h => h + 1);
      setScore(s => Math.max(0, s - 20));
      setTiles(prev =>
        prev.map(t => ({
          ...t,
          isHinted: t.id === hint[0].id || t.id === hint[1].id,
          isSelected: false,
        })),
      );
    }
  }, [tiles, gameState]);

  const handleShuffle = useCallback(() => {
    if (gameState !== 'playing' || shufflesLeft <= 0) return;
    setShufflesLeft(s => s - 1);
    setScore(s => Math.max(0, s - 50));
    setTiles(prev => {
      const shuffled = shuffleRemainingTiles(prev);
      return updateFreeTiles(shuffled);
    });
  }, [gameState, shufflesLeft]);

  // Board sizing
  const { boardWidth, boardHeight, tileW, tileH } = useMemo(() => {
    if (tiles.length === 0) return { boardWidth: 800, boardHeight: 600, tileW: 50, tileH: 65 };

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const tileW = vw < 640 ? 32 : vw < 768 ? 38 : vw < 1024 ? 46 : 54;
    const tileH = Math.round(tileW * 1.35);

    let maxCol = 0, maxRow = 0, maxLayer = 0;
    for (const t of tiles) {
      if (t.col > maxCol) maxCol = t.col;
      if (t.row > maxRow) maxRow = t.row;
      if (t.layer > maxLayer) maxLayer = t.layer;
    }

    const w = (maxCol + 2) * (tileW / 2) + maxLayer * 5 + tileW;
    const h = (maxRow + 2) * (tileH / 2) + maxLayer * 5 + tileH;
    return { boardWidth: w, boardHeight: h, tileW, tileH };
  }, [tiles]);

  const remainingTiles = tiles.filter(t => !t.isMatched).length;
  const totalTiles = tiles.length;
  const matchablePairs = useMemo(() => findMatchingPairs(tiles).length, [tiles]);
  const progress = totalTiles > 0 ? ((totalTiles - remainingTiles) / totalTiles) * 100 : 0;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 text-white overflow-hidden">
      {/* Header */}
      <header className="w-full px-3 md:px-6 pt-3 pb-2 bg-black/20 backdrop-blur-sm border-b border-green-800/40">
        <div className="max-w-6xl mx-auto">
          {/* Title + Stats Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-amber-300 tracking-wide flex items-center gap-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <span className="text-2xl md:text-3xl">🀄</span>
              <span>Mahjong Solitaire</span>
            </h1>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <StatBox label="SCORE" value={String(score)} />
              <StatBox label="TIME" value={formatTime(timer)} mono />
              <StatBox label="TILES" value={`${remainingTiles}`} sub={`/ ${totalTiles}`} />
              <StatBox label="PAIRS" value={String(matchablePairs)} highlight={matchablePairs <= 3 && matchablePairs > 0} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <ActionButton onClick={initGame} color="amber" icon="🔄" label="New Game" />
            <ActionButton
              onClick={handleHint}
              disabled={gameState !== 'playing' || matchablePairs === 0}
              color="cyan"
              icon="💡"
              label="Hint"
              badge={hintsUsed > 0 ? String(hintsUsed) : undefined}
            />
            <ActionButton
              onClick={handleShuffle}
              disabled={gameState !== 'playing' || shufflesLeft <= 0}
              color="violet"
              icon="🔀"
              label={`Shuffle (${shufflesLeft})`}
            />
          </div>

          {/* Combo / match flash */}
          <div className="h-6 flex items-center justify-center">
            {combo > 0 && (
              <span className="text-yellow-300 font-bold text-sm animate-bounce">
                🔥 Combo x{combo}! +{combo * 15} bonus
              </span>
            )}
            {matchFlash && (
              <span className="text-green-300 font-bold text-lg animate-ping opacity-80 ml-4">
                {matchFlash}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Game Board Area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-auto p-4"
      >
        <div
          className="relative"
          style={{ width: boardWidth, height: boardHeight }}
        >
          {/* Green felt background */}
          <div
            className="absolute rounded-2xl"
            style={{
              left: -16,
              top: -16,
              width: boardWidth + 32,
              height: boardHeight + 32,
              background: 'radial-gradient(ellipse at center, rgba(34,87,52,0.5) 0%, rgba(20,60,35,0.6) 100%)',
              border: '2px solid rgba(255,255,255,0.05)',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          />

          {/* Tiles */}
          {tiles
            .filter(t => !t.isMatched || t.isRemoving)
            .sort((a, b) => {
              if (a.layer !== b.layer) return a.layer - b.layer;
              if (a.row !== b.row) return a.row - b.row;
              return a.col - b.col;
            })
            .map(tile => (
              <TileComponent
                key={tile.id}
                tile={tile}
                onClick={handleTileClick}
                tileWidth={tileW}
                tileHeight={tileH}
              />
            ))}
        </div>
      </div>

      {/* Footer hint */}
      <footer className="w-full px-4 py-2 bg-black/20 border-t border-green-800/30">
        <p className="text-center text-green-400/50 text-xs max-w-2xl mx-auto">
          Click two matching free tiles to remove them • Free tiles have bright faces and at least one open side •
          Clear all tiles to win!
        </p>
      </footer>

      {/* ===== WIN MODAL ===== */}
      {showWinModal && (
        <Modal>
          <div className="bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 rounded-2xl p-6 md:p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-amber-500/40 relative overflow-hidden">
            {/* Decorative sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-3xl font-bold text-amber-200 mb-1">You Win!</h2>
            <p className="text-amber-100/80 mb-5 text-sm">All tiles cleared — well done!</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <ModalStat label="Score" value={String(score)} />
              <ModalStat label="Time" value={formatTime(timer)} />
              <ModalStat label="Moves" value={String(moves)} />
            </div>
            <button
              onClick={initGame}
              className="w-full px-6 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-white font-bold rounded-xl
                         hover:from-amber-400 hover:to-amber-600 shadow-lg text-lg transition-all active:scale-95"
            >
              🔄 Play Again
            </button>
          </div>
        </Modal>
      )}

      {/* ===== LOSE MODAL ===== */}
      {showLoseModal && (
        <Modal>
          <div className="bg-gradient-to-br from-red-900 via-rose-900 to-red-950 rounded-2xl p-6 md:p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-red-500/40">
            <div className="text-5xl mb-3">😔</div>
            <h2 className="text-2xl font-bold text-red-200 mb-1">No More Moves</h2>
            <p className="text-red-100/70 mb-5 text-sm">
              {shufflesLeft > 0
                ? 'Try shuffling the remaining tiles!'
                : 'No matching pairs left. Start a new game!'}
            </p>
            <div className="flex flex-col gap-2">
              {shufflesLeft > 0 && (
                <button
                  onClick={() => {
                    setShowLoseModal(false);
                    setGameState('playing');
                    setIsRunning(true);
                    handleShuffle();
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-b from-violet-500 to-violet-700 text-white font-bold rounded-xl
                             hover:from-violet-400 hover:to-violet-600 shadow-lg transition-all active:scale-95"
                >
                  🔀 Shuffle ({shufflesLeft})
                </button>
              )}
              <button
                onClick={initGame}
                className="w-full px-6 py-3 bg-gradient-to-b from-amber-500 to-amber-700 text-white font-bold rounded-xl
                           hover:from-amber-400 hover:to-amber-600 shadow-lg transition-all active:scale-95"
              >
                🔄 New Game
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ——— Sub-components ———

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      {children}
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center bg-black/30 rounded-lg px-2.5 py-1 min-w-[56px] ${
        highlight ? 'ring-1 ring-red-400/60' : ''
      }`}
    >
      <span className="text-amber-300/80 text-[10px] font-semibold tracking-wider">{label}</span>
      <span className={`font-bold text-base md:text-lg leading-tight ${mono ? 'font-mono' : ''} ${highlight ? 'text-red-300' : ''}`}>
        {value}
        {sub && <span className="text-xs opacity-50">{sub}</span>}
      </span>
    </div>
  );
}

function ModalStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 rounded-lg p-2">
      <div className="text-amber-300/70 text-xs">{label}</div>
      <div className="text-xl font-bold font-mono">{value}</div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  color,
  icon,
  label,
  badge,
}: {
  onClick: () => void;
  disabled?: boolean;
  color: 'amber' | 'cyan' | 'violet';
  icon: string;
  label: string;
  badge?: string;
}) {
  const colorClasses = {
    amber:
      'from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:from-amber-600 active:to-amber-800',
    cyan:
      'from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 active:from-cyan-600 active:to-cyan-800',
    violet:
      'from-violet-500 to-violet-700 hover:from-violet-400 hover:to-violet-600 active:from-violet-600 active:to-violet-800',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-b ${colorClasses[color]} text-white font-semibold rounded-lg
                   shadow-lg shadow-black/25 transition-all text-xs md:text-sm active:scale-95
                   disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100`}
    >
      {icon} {label}
      {badge && (
        <span className="ml-1 bg-white/20 rounded-full px-1.5 text-[10px]">{badge}</span>
      )}
    </button>
  );
}
