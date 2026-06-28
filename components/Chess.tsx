"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Chessboard } from 'react-chessboard';
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertCircle, Trophy, Flag, Crown } from 'lucide-react';
import type { PieceSymbol, Square } from 'chess.js';
import { useChessGame, type GameState } from '@/hooks/useChessGame';
import { motion, AnimatePresence } from 'framer-motion';

// ── Module-level constants ───────────────────────────────────────────

const PIECE_UNICODE: Record<string, Record<PieceSymbol, string>> = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

// Static style objects, module-level so they're never new references
// and never invalidate useMemo / boardOptions deps.
const BOARD_STYLE = {
    borderRadius: '3px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1)',
} as const;

const DROP_SQUARE_STYLE = { backgroundColor: 'rgba(20,85,30,0.5)' } as const;
const DARK_SQUARE_STYLE = { backgroundColor: 'var(--chess-dark-square,  #b58863)' } as const;
const LIGHT_SQUARE_STYLE = { backgroundColor: 'var(--chess-light-square, #f0d9b5)' } as const;

const SPRING_FAST = { type: 'spring', stiffness: 400, damping: 25 } as const;

// Static config, icons created once, never re-instantiated per render
const STATUS_CONFIG: Record<string, {
    icon: React.ReactNode;
    text: string;
    bg: string;
    border: string;
}> = {
    player_won: {
        icon: <Trophy className="h-4 w-4 shrink-0" />,
        text: 'You win! Reverb is impressed.',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
    reverb_won: {
        icon: <Crown className="h-4 w-4 shrink-0" />,
        text: 'You lost. Play again?',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
    },
    stalemate: {
        icon: <Flag className="h-4 w-4 shrink-0" />,
        text: 'Stalemate, a draw.',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    draw: {
        icon: <Flag className="h-4 w-4 shrink-0" />,
        text: 'Draw, well matched.',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
};

// ── Sub-components ───────────────────────────────────────────────────

const MaterialAdvantage = memo(function MaterialAdvantage({
    whiteCaptured,
    blackCaptured,
}: {
    whiteCaptured: Array<{ type: PieceSymbol; color: 'w' }>;
    blackCaptured: Array<{ type: PieceSymbol; color: 'b' }>;
}) {
    const whiteValue = blackCaptured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);
    const blackValue = whiteCaptured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);
    const advantage = whiteValue - blackValue;

    return (
        <div className="flex items-center justify-between w-full min-h-[22px]">
            <div className="flex items-center gap-px flex-wrap">
                {whiteCaptured.map((piece, i) => (
                    <motion.span
                        key={`w-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.75 }}
                        transition={{ ...SPRING_FAST, delay: i * 0.04 }}
                        className="text-sm leading-none"
                        aria-hidden="true"
                    >
                        {PIECE_UNICODE.w[piece.type]}
                    </motion.span>
                ))}
                {advantage < 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground ml-1">
                        +{Math.abs(advantage)}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-px flex-wrap justify-end">
                {advantage > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground mr-1">
                        +{advantage}
                    </span>
                )}
                {blackCaptured.map((piece, i) => (
                    <motion.span
                        key={`b-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.75 }}
                        transition={{ ...SPRING_FAST, delay: i * 0.04 }}
                        className="text-sm leading-none"
                        aria-hidden="true"
                    >
                        {PIECE_UNICODE.b[piece.type]}
                    </motion.span>
                ))}
            </div>
        </div>
    );
});

const GameStatusBanner = memo(function GameStatusBanner({
    gameState,
}: {
    gameState: GameState;
}) {
    const c = STATUS_CONFIG[gameState];
    if (!c) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${c.bg} border ${c.border} text-sm font-medium`}
            role="status"
            aria-live="polite"
        >
            {c.icon}
            <span>{c.text}</span>
        </motion.div>
    );
});

const ThinkingDots = memo(function ThinkingDots() {
    return (
        <span className="inline-flex gap-[3px] ml-1" aria-hidden="true">
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    className="inline-block w-[4px] h-[4px] rounded-full bg-current"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                />
            ))}
        </span>
    );
});

const PromotionButton = memo(function PromotionButton({
    piece,
    onPromote,
}: {
    piece: PieceSymbol;
    onPromote: (p: PieceSymbol) => void;
}) {
    const handleClick = useCallback(() => onPromote(piece), [piece, onPromote]);
    const label = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn', k: 'King' }[piece] ?? piece;

    return (
        <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="w-16 h-16 flex items-center justify-center text-5xl rounded-xl border-2 border-border bg-background hover:border-foreground/30 hover:bg-muted transition-colors cursor-pointer shadow-sm hover:shadow-md"
            aria-label={`Promote to ${label}`}
        >
            {PIECE_UNICODE.w[piece]}
        </motion.button>
    );
});

// ── Main component ───────────────────────────────────────────────────

export default function ChessGame() {
    const [mounted, setMounted] = useState(false);

    const {
        game,
        gameState,
        isThinking,
        isGameOver,
        reverbMessage,
        capturedPieces,
        pendingPromotion,
        customSquareStyles,
        handleSquareClick,
        handlePieceDrop,
        handlePromotion,
        resetGame,
    } = useChessGame(10);

    useEffect(() => { setMounted(true); }, []);

    const onPieceDrop = useCallback(
        ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
            if (!sourceSquare || !targetSquare) return false;
            return handlePieceDrop(sourceSquare as Square, targetSquare as Square);
        },
        [handlePieceDrop],
    );

    const onSquareClick = useCallback(
        ({ square }: SquareHandlerArgs): void => {
            handleSquareClick(square as Square);
        },
        [handleSquareClick],
    );

    const fen = game.fen();
    const turn = game.turn();
    const moveCount = Math.ceil(game.history().length / 2);

    const boardOptions = useMemo(() => ({
        id: 'chess-vs-reverb',
        position: fen,
        onPieceDrop,
        onSquareClick,
        customSquareStyles,
        showNotation: false,
        allowDragOffBoard: true,
        allowDragging: !isThinking && turn === 'w' && !isGameOver,
        animationDurationInMs: 150,
        dropSquareStyle: DROP_SQUARE_STYLE,
        darkSquareStyle: DARK_SQUARE_STYLE,
        lightSquareStyle: LIGHT_SQUARE_STYLE,
        boardOrientation: 'white' as const,
        boardStyle: BOARD_STYLE,
    }), [fen, onPieceDrop, onSquareClick, customSquareStyles, isThinking, turn, isGameOver]);

    const playerStatus = isGameOver
        ? 'Game over'
        : turn === 'w' ? 'Your turn' : 'Waiting…';

    const showBanner = gameState !== 'playing' && gameState !== 'check';

    if (!mounted) return null;

    return (
        <div
            className="w-full max-w-[360px] mx-auto select-none"
            id="chess-game-container"
        >
            {/* ── Top bar ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0" aria-hidden="true">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 flex items-center justify-center shadow-sm">
                            <span className="text-white dark:text-zinc-900 font-bold text-xs">R</span>
                        </div>
                        {isThinking && (
                            <motion.div
                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-yellow-400 border-2 border-background"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-tight">Reverb</p>
                        <p className="text-[11px] text-muted-foreground leading-tight flex items-center truncate">
                            {isThinking
                                ? <><span>thinking</span><ThinkingDots /></>
                                : reverbMessage
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <AnimatePresence mode="wait">
                        {gameState === 'check' && (
                            <motion.div
                                key="check-badge"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={SPRING_FAST}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400"
                                role="alert"
                                aria-live="assertive"
                            >
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                <span className="text-[11px] font-semibold">Check</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={resetGame}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 cursor-pointer rounded-md"
                        disabled={isThinking}
                        title="New game"
                        aria-label="Start new game"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* ── Material strip ────────────────────────────── */}
            <div className="px-1 mb-1.5">
                <MaterialAdvantage
                    whiteCaptured={capturedPieces.white}
                    blackCaptured={capturedPieces.black}
                />
            </div>

            {/* ── Game-over banner ──────────────────────────── */}
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        key="status-banner"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-2"
                    >
                        <GameStatusBanner gameState={gameState} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Board ─────────────────────────────────────── */}
            <div className="relative w-full">
                <Chessboard options={boardOptions} />

                <AnimatePresence>
                    {isThinking && (
                        <motion.div
                            key="thinking-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 pointer-events-none rounded"
                            style={{
                                background:
                                    'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.04) 100%)',
                            }}
                            aria-hidden="true"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* ── Bottom bar ────────────────────────────────── */}
            <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm"
                        aria-hidden="true"
                    >
                        <span className="text-white font-bold text-xs">Y</span>
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold leading-tight">You</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                            {playerStatus}
                        </p>
                    </div>
                </div>

                {moveCount > 0 && (
                    <div className="text-[11px] text-muted-foreground font-medium tabular-nums">
                        Move {moveCount}
                    </div>
                )}
            </div>

            {/* ── Promotion dialog ──────────────────────────── */}
            <AnimatePresence>
                {pendingPromotion && (
                    <motion.div
                        key="promotion-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Choose promotion piece"
                    >
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.88, opacity: 0 }}
                            transition={SPRING_FAST}
                            className="bg-popover border border-border rounded-2xl p-6 shadow-2xl"
                        >
                            <h3 className="text-xs font-semibold mb-4 text-center text-muted-foreground uppercase tracking-widest">
                                Promote to
                            </h3>
                            <div className="flex gap-3">
                                {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map(piece => (
                                    <PromotionButton
                                        key={piece}
                                        piece={piece}
                                        onPromote={handlePromotion}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}