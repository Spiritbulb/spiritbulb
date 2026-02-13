import { useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { ChessEngine } from '@chessle/chess.js-extended';
import type { Square, PieceSymbol } from 'chess.js';

export interface CapturedPieces {
    white: Array<{ type: PieceSymbol; color: 'w' }>;
    black: Array<{ type: PieceSymbol; color: 'b' }>;
}

export type GameState = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'player_won' | 'reverb_won';

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
};

const REVERB_TAUNTS = [
    "Your move...", "Interesting choice", "Bold strategy",
    "I've seen worse", "That's one way", "Hmm, okay",
    "Confident, I see", "Let's see...", "Noted.",
    "Classic move", "Trying something?", "I'm watching",
    "Predictable", "Unexpected", "Risky play"
];

const CHECK_MESSAGES = [
    "Check! Watch out", "Check! Your king",
    "Check! Careful", "You're in check!", "Check! Move fast"
];

const CHECKMATE_MESSAGES = {
    player: ["Checkmate! You win!", "Victory is yours!", "Well played!"],
    reverb: ["Checkmate! I win", "Game over", "Better luck next time"]
};

// Stable reference — avoids creating a new {} on every clear
const EMPTY_SQUARES: Record<string, any> = Object.freeze({});

const getRandomMessage = (array: string[]): string =>
    array[Math.floor(Math.random() * array.length)];

const getCapturedPieces = (game: ChessEngine): CapturedPieces => {
    const startingPieces: Record<PieceSymbol, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const currentPieces: Record<'w' | 'b', Record<PieceSymbol, number>> = {
        w: { ...startingPieces },
        b: { ...startingPieces }
    };
    const board = game.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = board[i][j];
            if (square) {
                currentPieces[square.color][square.type]--;
            }
        }
    }

    const captured: CapturedPieces = { white: [], black: [] };

    const pieceTypes: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p', 'k'];
    for (const type of pieceTypes) {
        for (let i = 0; i < currentPieces.w[type]; i++) {
            captured.white.push({ type, color: 'w' });
        }
        for (let i = 0; i < currentPieces.b[type]; i++) {
            captured.black.push({ type, color: 'b' });
        }
    }

    // Already sorted by iterating in value order (q > r > b > n > p > k)

    return captured;
};

const getKingSquare = (game: ChessEngine, color: 'w' | 'b'): Square | null => {
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece && piece.type === 'k' && piece.color === color) {
                return `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            }
        }
    }
    return null;
};

// Build move highlight squares for a selected piece
const buildMoveSquares = (
    square: Square,
    moves: Array<{ to: Square }>,
    dotColor: string = 'rgba(34, 197, 94, 0.4)',
    dotSize: string = '25%'
): Record<string, any> => {
    const squares: Record<string, any> = {
        [square]: { background: 'rgba(59, 130, 246, 0.5)' }
    };
    const dotStyle = {
        background: `radial-gradient(circle, ${dotColor} ${dotSize}, transparent ${dotSize})`,
        borderRadius: '50%'
    };
    for (const move of moves) {
        squares[move.to] = dotStyle;
    }
    return squares;
};

// ── Reducer for batched state updates ────────────────────────────────

interface ChessState {
    game: ChessEngine;
    isThinking: boolean;
    reverbMessage: string;
    kingInCheckSquare: Square | null;
    moveSquares: Record<string, any>;
    selectedSquare: Square | null;
    pendingPromotion: { from: Square; to: Square } | null;
    difficulty: number;
}

type ChessAction =
    | { type: 'MOVE_MADE'; game: ChessEngine; message: string; kingSquare: Square | null }
    | { type: 'SET_THINKING'; isThinking: boolean; message?: string }
    | { type: 'SET_MESSAGE'; message: string }
    | { type: 'SET_SELECTION'; square: Square | null; moveSquares: Record<string, any> }
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
                reverbMessage: "Your move...",
                kingInCheckSquare: null,
                moveSquares: EMPTY_SQUARES,
                selectedSquare: null,
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
        reverbMessage: "Your move...",
        kingInCheckSquare: null,
        moveSquares: EMPTY_SQUARES,
        selectedSquare: null,
        pendingPromotion: null,
        difficulty: initialDifficulty,
    };
}

// ── Helpers to determine post-move message & king square ─────────────

function getPostMoveInfo(
    newGame: ChessEngine,
    side: 'player' | 'reverb',
    evaluation?: number | string
): { message: string; kingSquare: Square | null } {
    if (newGame.isCheckmate()) {
        return {
            message: getRandomMessage(CHECKMATE_MESSAGES[side]),
            kingSquare: getKingSquare(newGame, newGame.turn()),
        };
    }
    if (newGame.inCheck()) {
        const msg = side === 'reverb'
            ? getRandomMessage(CHECK_MESSAGES)
            : "Slow down buddy!";
        return {
            message: msg,
            kingSquare: getKingSquare(newGame, newGame.turn()),
        };
    }

    let message = getRandomMessage(REVERB_TAUNTS);
    if (side === 'reverb' && evaluation !== undefined) {
        if (typeof evaluation === 'number') {
            const evalStr = evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
            message += ` (${evalStr})`;
        } else if (typeof evaluation === 'string' && evaluation.startsWith('M')) {
            message += ` (${evaluation})`;
        }
    }
    return { message, kingSquare: null };
}

// ── Main Hook ────────────────────────────────────────────────────────

export const useChessGame = (initialDifficulty: number = 10) => {
    const [state, dispatch] = useReducer(chessReducer, initialDifficulty, createInitialState);
    const {
        game, isThinking, reverbMessage, kingInCheckSquare,
        moveSquares, selectedSquare, pendingPromotion, difficulty
    } = state;

    // Ref to guard against concurrent AI calls without adding to deps
    const isThinkingRef = useRef(false);

    // Single useMemo for ALL game status — avoids 4 separate expensive checks
    const { capturedPieces, gameState, isGameOver, turn } = useMemo(() => {
        const checkmate = game.isCheckmate();
        const stalemate = game.isStalemate();
        const draw = game.isDraw();
        const check = game.inCheck();
        const turn = game.turn();

        let gameState: GameState;
        if (checkmate) gameState = turn === 'w' ? 'reverb_won' : 'player_won';
        else if (stalemate) gameState = 'stalemate';
        else if (draw) gameState = 'draw';
        else if (check) gameState = 'check';
        else gameState = 'playing';

        return {
            capturedPieces: getCapturedPieces(game),
            gameState,
            isGameOver: checkmate || stalemate || draw,
            turn,
        };
    }, [game]);

    // Clone game without full constructor overhead
    const cloneGame = useCallback((): ChessEngine => {
        const copy = new ChessEngine();
        copy.load(game.fen());
        return copy;
    }, [game]);

    const requestReverbMove = useCallback(async () => {
        if (isThinkingRef.current) return;
        isThinkingRef.current = true;

        dispatch({ type: 'SET_THINKING', isThinking: true, message: "Thinking..." });

        try {
            const lines = await game.evaluatePosition({
                depth: 4,
                skillLevel: 15,
                multiPV: 1
            });

            if (lines.length === 0 || !lines[0].line.length) {
                throw new Error('No valid move found');
            }

            const bestMove = lines[0].line[0];
            const evaluation = lines[0].evaluation;

            const newGame = cloneGame();
            const move = newGame.move(bestMove);

            if (!move) throw new Error('Invalid move');

            const { message, kingSquare } = getPostMoveInfo(newGame, 'reverb', evaluation);
            dispatch({ type: 'MOVE_MADE', game: newGame, message, kingSquare });
        } catch (err) {
            console.error('Reverb move error:', err);
            const moves = game.moves({ verbose: true });
            if (moves.length > 0) {
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                const newGame = cloneGame();
                newGame.move(randomMove.san);
                dispatch({
                    type: 'MOVE_MADE',
                    game: newGame,
                    message: "Had to improvise...",
                    kingSquare: null,
                });
            } else {
                dispatch({ type: 'SET_MESSAGE', message: "Stalemate?" });
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
            promotion: piece
        });

        if (move) {
            const { message, kingSquare } = getPostMoveInfo(newGame, 'player');
            dispatch({ type: 'MOVE_MADE', game: newGame, message, kingSquare });
        } else {
            dispatch({ type: 'SET_PROMOTION', promotion: null });
        }
    }, [cloneGame, pendingPromotion]);

    const attemptMove = useCallback((from: Square, to: Square): boolean => {
        const piece = game.get(from);
        if (piece && piece.type === 'p') {
            const toRank = to[1];
            if ((piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')) {
                dispatch({ type: 'SET_PROMOTION', promotion: { from, to } });
                return true;
            }
        }

        const newGame = cloneGame();
        const move = newGame.move({ from, to });

        if (move) {
            const { message, kingSquare } = getPostMoveInfo(newGame, 'player');
            dispatch({ type: 'MOVE_MADE', game: newGame, message, kingSquare });
            return true;
        }

        return false;
    }, [game, cloneGame]);

    const handleSquareClick = useCallback((square: Square) => {
        if (isThinking || turn !== 'w' || isGameOver) return;

        const piece = game.get(square);

        if (selectedSquare) {
            // Clicked same square — deselect
            if (selectedSquare === square) {
                dispatch({ type: 'SET_SELECTION', square: null, moveSquares: EMPTY_SQUARES });
                return;
            }

            // Clicked another own piece — reselect
            if (piece && piece.color === 'w') {
                const moves = game.moves({ square, verbose: true });
                if (moves.length > 0) {
                    dispatch({
                        type: 'SET_SELECTION',
                        square,
                        moveSquares: buildMoveSquares(square, moves),
                    });
                }
                return;
            }

            // Attempt move to clicked square
            const moved = attemptMove(selectedSquare, square);
            if (!moved) {
                dispatch({ type: 'SET_SELECTION', square: null, moveSquares: EMPTY_SQUARES });
            }
        } else {
            // Select own piece
            if (piece && piece.color === 'w') {
                const moves = game.moves({ square, verbose: true });
                if (moves.length > 0) {
                    dispatch({
                        type: 'SET_SELECTION',
                        square,
                        moveSquares: buildMoveSquares(
                            square, moves,
                            'rgba(141, 255, 118, 0.55)', '30%'
                        ),
                    });
                }
            }
        }
    }, [game, isThinking, turn, selectedSquare, isGameOver, attemptMove]);

    const handlePieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
        if (isThinking || turn !== 'w' || isGameOver) return false;
        return attemptMove(sourceSquare, targetSquare);
    }, [isThinking, turn, isGameOver, attemptMove]);

    const resetGame = useCallback(() => {
        isThinkingRef.current = false;
        dispatch({ type: 'RESET' });
    }, []);

    const setDifficulty = useCallback((d: number) => {
        dispatch({ type: 'SET_DIFFICULTY', difficulty: d });
    }, []);

    const customSquareStyles = useMemo(() => {
        if (!kingInCheckSquare && moveSquares === EMPTY_SQUARES) return EMPTY_SQUARES;

        const styles: Record<string, any> = { ...moveSquares };
        if (kingInCheckSquare) {
            styles[kingInCheckSquare] = {
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 40%, transparent 40%)',
                boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.5)'
            };
        }
        return styles;
    }, [moveSquares, kingInCheckSquare]);

    // Trigger AI move — uses stable `turn` value instead of game.turn() method call
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
        resetGame
    };
};
