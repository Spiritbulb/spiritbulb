import { useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { ChessEngine } from '@chessle/chess.js-extended';
import type { Square, PieceSymbol } from 'chess.js';

export interface CapturedPieces {
    white: Array<{ type: PieceSymbol; color: 'w' }>;
    black: Array<{ type: PieceSymbol; color: 'b' }>;
}

export type GameState =
    | 'playing'
    | 'check'
    | 'checkmate'
    | 'stalemate'
    | 'draw'
    | 'player_won'
    | 'reverb_won';

// ── Square style tokens ──────────────────────────────────────────────
// All visual constants live here so the component owns zero board styling.

/** Selected piece — yellow tint, chess.com style */
const SQ_SELECTED = { background: 'rgba(255, 215, 0, 0.55)' };

/**
 * Move-hint dot for empty squares.
 * A small centred disc — visible on both light and dark squares.
 */
const SQ_MOVE_HINT = {
    background: 'radial-gradient(circle, rgba(0,0,0,0.22) 29%, transparent 29%)',
};

/**
 * Capture-hint for enemy-occupied squares.
 * A ring around the square border so it shows over the piece.
 */
const SQ_CAPTURE_HINT = {
    background:
        'radial-gradient(circle, transparent 57%, rgba(0,0,0,0.22) 57%)',
};

/** Last move — from square */
const SQ_LAST_FROM = { background: 'rgba(155, 199, 0, 0.41)' };

/** Last move — to square */
const SQ_LAST_TO = { background: 'rgba(155, 199, 0, 0.41)' };

/** King in check */
const SQ_CHECK = {
    background:
        'radial-gradient(circle, rgba(239,68,68,0.9) 22%, rgba(239,68,68,0.55) 55%, transparent 80%)',
};

// ── Other constants ──────────────────────────────────────────────────

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

const REVERB_TAUNTS = [
    'Your move...', 'Interesting choice', 'Bold strategy',
    'I\'ve seen worse', 'That\'s one way', 'Hmm, okay',
    'Confident, I see', 'Let\'s see...', 'Noted.',
    'Classic move', 'Trying something?', 'I\'m watching',
    'Predictable', 'Unexpected', 'Risky play',
];

const CHECK_MESSAGES = [
    'Check! Watch out', 'Check! Your king',
    'Check! Careful', 'You\'re in check!', 'Check! Move fast',
];

const CHECKMATE_MESSAGES = {
    player: ['Checkmate! You win!', 'Victory is yours!', 'Well played!'],
    reverb: ['Checkmate! I win', 'Game over', 'Better luck next time'],
};

/** Stable empty-object reference — avoids allocating {} on every clear */
const EMPTY_SQUARES: Record<string, React.CSSProperties> = Object.freeze({});

const getRandomMessage = (array: string[]): string =>
    array[Math.floor(Math.random() * array.length)];

// ── Board helpers ────────────────────────────────────────────────────

const getCapturedPieces = (game: ChessEngine): CapturedPieces => {
    const startingPieces: Record<PieceSymbol, number> = {
        p: 8, n: 2, b: 2, r: 2, q: 1, k: 1,
    };
    const current: Record<'w' | 'b', Record<PieceSymbol, number>> = {
        w: { ...startingPieces },
        b: { ...startingPieces },
    };

    for (const row of game.board()) {
        for (const square of row) {
            if (square) current[square.color][square.type]--;
        }
    }

    const captured: CapturedPieces = { white: [], black: [] };
    for (const type of ['q', 'r', 'b', 'n', 'p', 'k'] as PieceSymbol[]) {
        for (let i = 0; i < current.w[type]; i++) captured.white.push({ type, color: 'w' });
        for (let i = 0; i < current.b[type]; i++) captured.black.push({ type, color: 'b' });
    }
    return captured;
};

const getKingSquare = (game: ChessEngine, color: 'w' | 'b'): Square | null => {
    const board = game.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p?.type === 'k' && p.color === color) {
                return `${String.fromCharCode(97 + c)}${8 - r}` as Square;
            }
        }
    }
    return null;
};

/**
 * Build square-style map for a selected piece and its legal moves.
 * Distinguishes empty targets (dot) from capture targets (ring).
 */
const buildMoveSquares = (
    square: Square,
    moves: Array<{ to: Square }>,
    game: ChessEngine,
): Record<string, React.CSSProperties> => {
    const styles: Record<string, React.CSSProperties> = {
        [square]: SQ_SELECTED,
    };
    for (const move of moves) {
        const occupant = game.get(move.to);
        // Enemy piece on target → ring overlay; empty square → dot
        styles[move.to] = occupant && occupant.color !== game.turn()
            ? SQ_CAPTURE_HINT
            : SQ_MOVE_HINT;
    }
    return styles;
};

// ── Reducer ──────────────────────────────────────────────────────────

interface ChessState {
    game: ChessEngine;
    isThinking: boolean;
    reverbMessage: string;
    kingInCheckSquare: Square | null;
    moveSquares: Record<string, React.CSSProperties>;
    selectedSquare: Square | null;
    lastMove: { from: Square; to: Square } | null;
    pendingPromotion: { from: Square; to: Square } | null;
    difficulty: number;
}

type ChessAction =
    | {
        type: 'MOVE_MADE';
        game: ChessEngine;
        message: string;
        kingSquare: Square | null;
        lastMove: { from: Square; to: Square };
    }
    | { type: 'SET_THINKING'; isThinking: boolean; message?: string }
    | { type: 'SET_MESSAGE'; message: string }
    | { type: 'SET_SELECTION'; square: Square | null; moveSquares: Record<string, React.CSSProperties> }
    | { type: 'SET_PROMOTION'; promotion: { from: Square; to: Square } | null }
    | { type: 'SET_DIFFICULTY'; difficulty: number }
    | { type: 'RESET' };

function chessReducer(state: ChessState, action: ChessAction): ChessState {
    switch (action.type) {
        case 'MOVE_MADE':
            return {
                ...state,
                game: action.game,
                moveSquares: EMPTY_SQUARES,
                selectedSquare: null,
                reverbMessage: action.message,
                kingInCheckSquare: action.kingSquare,
                lastMove: action.lastMove,
                pendingPromotion: null,
            };
        case 'SET_THINKING':
            return {
                ...state,
                isThinking: action.isThinking,
                ...(action.message ? { reverbMessage: action.message } : {}),
            };
        case 'SET_MESSAGE':
            return { ...state, reverbMessage: action.message };
        case 'SET_SELECTION':
            return {
                ...state,
                selectedSquare: action.square,
                moveSquares: action.moveSquares,
            };
        case 'SET_PROMOTION':
            return { ...state, pendingPromotion: action.promotion };
        case 'SET_DIFFICULTY':
            return { ...state, difficulty: action.difficulty };
        case 'RESET':
            return {
                game: new ChessEngine(),
                isThinking: false,
                reverbMessage: 'Your move...',
                kingInCheckSquare: null,
                moveSquares: EMPTY_SQUARES,
                selectedSquare: null,
                lastMove: null,
                pendingPromotion: null,
                difficulty: state.difficulty,
            };
        default:
            return state;
    }
}

function createInitialState(initialDifficulty: number): ChessState {
    return {
        game: new ChessEngine(),
        isThinking: false,
        reverbMessage: 'Your move...',
        kingInCheckSquare: null,
        moveSquares: EMPTY_SQUARES,
        selectedSquare: null,
        lastMove: null,
        pendingPromotion: null,
        difficulty: initialDifficulty,
    };
}

// ── Post-move state helpers ──────────────────────────────────────────

function getPostMoveInfo(
    newGame: ChessEngine,
    side: 'player' | 'reverb',
    evaluation?: number | string,
): { message: string; kingSquare: Square | null } {
    if (newGame.isCheckmate()) {
        return {
            message: getRandomMessage(CHECKMATE_MESSAGES[side]),
            kingSquare: getKingSquare(newGame, newGame.turn()),
        };
    }
    if (newGame.inCheck()) {
        return {
            message: side === 'reverb'
                ? getRandomMessage(CHECK_MESSAGES)
                : 'Slow down buddy!',
            kingSquare: getKingSquare(newGame, newGame.turn()),
        };
    }

    let message = getRandomMessage(REVERB_TAUNTS);
    if (side === 'reverb' && evaluation !== undefined) {
        if (typeof evaluation === 'number') {
            const sign = evaluation > 0 ? '+' : '';
            message += ` (${sign}${evaluation.toFixed(1)})`;
        } else if (typeof evaluation === 'string' && evaluation.startsWith('M')) {
            message += ` (${evaluation})`;
        }
    }
    return { message, kingSquare: null };
}

// ── Hook ─────────────────────────────────────────────────────────────

export const useChessGame = (initialDifficulty: number = 10) => {
    const [state, dispatch] = useReducer(chessReducer, initialDifficulty, createInitialState);
    const {
        game, isThinking, reverbMessage, kingInCheckSquare,
        moveSquares, selectedSquare, lastMove, pendingPromotion, difficulty,
    } = state;

    const isThinkingRef = useRef(false);

    // All game-status checks in one memo — avoids calling game methods multiple times
    const { capturedPieces, gameState, isGameOver, turn } = useMemo(() => {
        const checkmate = game.isCheckmate();
        const stalemate = game.isStalemate();
        const draw = game.isDraw();
        const check = game.inCheck();
        const t = game.turn();

        let gs: GameState;
        if (checkmate) gs = t === 'w' ? 'reverb_won' : 'player_won';
        else if (stalemate) gs = 'stalemate';
        else if (draw) gs = 'draw';
        else if (check) gs = 'check';
        else gs = 'playing';

        return {
            capturedPieces: getCapturedPieces(game),
            gameState: gs,
            isGameOver: checkmate || stalemate || draw,
            turn: t,
        };
    }, [game]);

    const cloneGame = useCallback((): ChessEngine => {
        const copy = new ChessEngine();
        copy.load(game.fen());
        return copy;
    }, [game]);

    const requestReverbMove = useCallback(async () => {
        if (isThinkingRef.current) return;
        isThinkingRef.current = true;
        dispatch({ type: 'SET_THINKING', isThinking: true, message: 'Thinking...' });

        try {
            const lines = await game.evaluatePosition({
                depth: 4,
                skillLevel: 15,
                multiPV: 1,
            });

            if (!lines.length || !lines[0].line.length) throw new Error('No move');

            const bestMove = lines[0].line[0];
            const evaluation = lines[0].evaluation;

            const newGame = cloneGame();
            const move = newGame.move(bestMove);
            if (!move) throw new Error('Invalid move');

            const { message, kingSquare } = getPostMoveInfo(newGame, 'reverb', evaluation);
            dispatch({
                type: 'MOVE_MADE',
                game: newGame,
                message,
                kingSquare,
                lastMove: { from: move.from as Square, to: move.to as Square },
            });
        } catch (err) {
            console.error('Reverb move error:', err);
            const moves = game.moves({ verbose: true });
            if (moves.length > 0) {
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                const newGame = cloneGame();
                const move = newGame.move(randomMove.san);
                dispatch({
                    type: 'MOVE_MADE',
                    game: newGame,
                    message: 'Had to improvise...',
                    kingSquare: null,
                    lastMove: move
                        ? { from: move.from as Square, to: move.to as Square }
                        : { from: randomMove.from as Square, to: randomMove.to as Square },
                });
            } else {
                dispatch({ type: 'SET_MESSAGE', message: 'Stalemate?' });
            }
        } finally {
            isThinkingRef.current = false;
            dispatch({ type: 'SET_THINKING', isThinking: false });
        }
    }, [game, cloneGame]);

    const handlePromotion = useCallback((piece: PieceSymbol) => {
        if (!pendingPromotion) return;

        const newGame = cloneGame();
        const move = newGame.move({
            from: pendingPromotion.from,
            to: pendingPromotion.to,
            promotion: piece,
        });

        if (move) {
            const { message, kingSquare } = getPostMoveInfo(newGame, 'player');
            dispatch({
                type: 'MOVE_MADE',
                game: newGame,
                message,
                kingSquare,
                lastMove: { from: move.from as Square, to: move.to as Square },
            });
        } else {
            dispatch({ type: 'SET_PROMOTION', promotion: null });
        }
    }, [cloneGame, pendingPromotion]);

    const attemptMove = useCallback((from: Square, to: Square): boolean => {
        // Promotion check
        const piece = game.get(from);
        if (piece?.type === 'p') {
            const rank = to[1];
            if ((piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1')) {
                dispatch({ type: 'SET_PROMOTION', promotion: { from, to } });
                return true;
            }
        }

        const newGame = cloneGame();
        const move = newGame.move({ from, to });
        if (!move) return false;

        const { message, kingSquare } = getPostMoveInfo(newGame, 'player');
        dispatch({
            type: 'MOVE_MADE',
            game: newGame,
            message,
            kingSquare,
            lastMove: { from: move.from as Square, to: move.to as Square },
        });
        return true;
    }, [game, cloneGame]);

    const handleSquareClick = useCallback((square: Square) => {
        if (isThinking || turn !== 'w' || isGameOver) return;

        const piece = game.get(square);

        if (selectedSquare) {
            if (selectedSquare === square) {
                // Deselect
                dispatch({ type: 'SET_SELECTION', square: null, moveSquares: EMPTY_SQUARES });
                return;
            }

            if (piece?.color === 'w') {
                // Re-select another own piece
                const moves = game.moves({ square, verbose: true });
                if (moves.length > 0) {
                    dispatch({
                        type: 'SET_SELECTION',
                        square,
                        moveSquares: buildMoveSquares(square, moves, game),
                    });
                }
                return;
            }

            // Attempt the move; deselect on failure
            const moved = attemptMove(selectedSquare, square);
            if (!moved) {
                dispatch({ type: 'SET_SELECTION', square: null, moveSquares: EMPTY_SQUARES });
            }
        } else {
            if (piece?.color === 'w') {
                const moves = game.moves({ square, verbose: true });
                if (moves.length > 0) {
                    dispatch({
                        type: 'SET_SELECTION',
                        square,
                        moveSquares: buildMoveSquares(square, moves, game),
                    });
                }
            }
        }
    }, [game, isThinking, turn, selectedSquare, isGameOver, attemptMove]);

    const handlePieceDrop = useCallback((from: Square, to: Square): boolean => {
        if (isThinking || turn !== 'w' || isGameOver) return false;
        return attemptMove(from, to);
    }, [isThinking, turn, isGameOver, attemptMove]);

    const resetGame = useCallback(() => {
        isThinkingRef.current = false;
        dispatch({ type: 'RESET' });
    }, []);

    const setDifficulty = useCallback((d: number) => {
        dispatch({ type: 'SET_DIFFICULTY', difficulty: d });
    }, []);

    // Compose all square styles in priority order:
    // lastMove (lowest) → moveSquares (selection+hints) → check (highest)
    const customSquareStyles = useMemo((): Record<string, React.CSSProperties> => {
        const hasLastMove = lastMove !== null;
        const hasMoveSquares = moveSquares !== EMPTY_SQUARES;
        const hasCheck = kingInCheckSquare !== null;

        if (!hasLastMove && !hasMoveSquares && !hasCheck) return EMPTY_SQUARES;

        const styles: Record<string, React.CSSProperties> = {};

        // 1. Last move (lowest priority — always visible as background context)
        if (hasLastMove) {
            styles[lastMove!.from] = SQ_LAST_FROM;
            styles[lastMove!.to] = SQ_LAST_TO;
        }

        // 2. Move hints + selected square (override last-move on those squares)
        if (hasMoveSquares) {
            Object.assign(styles, moveSquares);
        }

        // 3. King in check (highest priority — always visible)
        if (hasCheck) {
            styles[kingInCheckSquare!] = SQ_CHECK;
        }

        return styles;
    }, [moveSquares, kingInCheckSquare, lastMove]);

    // Trigger AI move
    useEffect(() => {
        if (turn === 'b' && !isThinking && !isGameOver) {
            const timer = setTimeout(requestReverbMove, 800);
            return () => clearTimeout(timer);
        }
    }, [turn, isThinking, isGameOver, requestReverbMove]);

    return {
        game,
        gameState,
        isThinking,
        isGameOver,
        reverbMessage,
        capturedPieces,
        difficulty,
        pendingPromotion,
        customSquareStyles,
        setDifficulty,
        handleSquareClick,
        handlePieceDrop,
        handlePromotion,
        resetGame,
    };
};