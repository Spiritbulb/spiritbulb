// Chess game utilities using chess.js library for complete chess mechanics
// Install: npm install chess.js

import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';

/**
 * Initialize a new chess game
 */
export function createChessGame(): Chess {
    return new Chess();
}

/**
 * Get all legal moves for a specific square
 */
export function getLegalMovesForSquare(game: Chess, square: Square): Move[] {
    return game.moves({ square, verbose: true });
}

/**
 * Get all squares that can be moved to from a given square
 */
export function getValidDestinations(game: Chess, square: Square): Square[] {
    const moves = getLegalMovesForSquare(game, square);
    return moves.map(move => move.to);
}

/**
 * Check if a move is legal
 */
export function isMoveLegal(game: Chess, from: Square, to: Square): boolean {
    const moves = getLegalMovesForSquare(game, from);
    return moves.some(move => move.to === to);
}

/**
 * Make a move on the board
 */
// Update this function in your chess-utils.ts
export function makeMove(game: Chess, from: Square, to: Square, promotion?: PieceSymbol): Move | null {
    try {
        // Validate the squares
        if (!isValidSquare(from) || !isValidSquare(to)) {
            return null;
        }

        // Try to make the move with optional promotion
        const moveOptions: { from: Square; to: Square; promotion?: PieceSymbol } = {
            from,
            to
        };

        // Only add promotion if it's provided and valid
        if (promotion && ['q', 'r', 'b', 'n'].includes(promotion)) {
            moveOptions.promotion = promotion;
        }

        const result = game.move(moveOptions);
        return result;
    } catch (error) {
        console.error('Move error:', error);
        return null;
    }
}

// Helper function to validate squares
function isValidSquare(square: string): square is Square {
    const regex = /^[a-h][1-8]$/;
    return regex.test(square);
}

/**
 * Check if the current player is in check
 */
export function isInCheck(game: Chess): boolean {
    return game.isCheck();
}

/**
 * Check if the game is in checkmate
 */
export function isCheckmate(game: Chess): boolean {
    return game.isCheckmate();
}

/**
 * Check if the game is in stalemate
 */
export function isStalemate(game: Chess): boolean {
    return game.isStalemate();
}

/**
 * Check if the game is a draw
 */
export function isDraw(game: Chess): boolean {
    return game.isDraw();
}

/**
 * Get the square of the king that is in check
 */
export function getKingSquareInCheck(game: Chess): Square | null {
    if (!game.isCheck()) return null;

    const turn = game.turn();
    const board = game.board();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'k' && piece.color === turn) {
                const file = String.fromCharCode(97 + col);
                const rank = (8 - row).toString();
                return `${file}${rank}` as Square;
            }
        }
    }

    return null;
}

/**
 * Get all squares that are under attack by the opponent
 */
export function getAttackedSquares(game: Chess, byColor: Color): Square[] {
    const attacked: Square[] = [];
    const board = game.board();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === byColor) {
                const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
                const moves = game.moves({ square, verbose: true });
                moves.forEach(move => {
                    if (!attacked.includes(move.to)) {
                        attacked.push(move.to);
                    }
                });
            }
        }
    }

    return attacked;
}

/**
 * Get game status message
 */
export function getGameStatus(game: Chess): string {
    if (game.isCheckmate()) {
        return game.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
    }
    if (game.isStalemate()) {
        return 'Draw by stalemate';
    }
    if (game.isThreefoldRepetition()) {
        return 'Draw by repetition';
    }
    if (game.isInsufficientMaterial()) {
        return 'Draw - insufficient material';
    }
    if (game.isDraw()) {
        return 'Game is a draw';
    }
    if (game.isCheck()) {
        return game.turn() === 'w' ? 'White is in check!' : 'Black is in check!';
    }
    return game.turn() === 'w' ? 'White to move' : 'Black to move';
}

/**
 * Convert chess.js board to simple 2D array format
 */
export function boardToArray(game: Chess) {
    return game.board();
}

/**
 * Get piece at a specific square
 */
export function getPieceAt(game: Chess, square: Square) {
    return game.get(square);
}

/**
 * Get all captured pieces for both sides
 */
export function getCapturedPieces(game: Chess): {
    white: Array<{ type: PieceSymbol; color: Color }>;
    black: Array<{ type: PieceSymbol; color: Color }>;
} {
    const allPieces = {
        p: 8, // pawns
        n: 2, // knights
        b: 2, // bishops
        r: 2, // rooks
        q: 1, // queen
        k: 1  // king
    };

    const currentPieces = {
        white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
        black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    };

    const board = game.board();

    // Count remaining pieces
    board.forEach(row => {
        row.forEach(square => {
            if (square) {
                const color = square.color === 'w' ? 'white' : 'black';
                currentPieces[color][square.type]++;
            }
        });
    });

    // Calculate captured pieces
    const captured = {
        white: [] as Array<{ type: PieceSymbol; color: Color }>,
        black: [] as Array<{ type: PieceSymbol; color: Color }>
    };

    // White pieces captured by black
    Object.entries(allPieces).forEach(([pieceType, count]) => {
        const missing = count - currentPieces.white[pieceType as PieceSymbol];
        for (let i = 0; i < missing; i++) {
            captured.white.push({ type: pieceType as PieceSymbol, color: 'w' });
        }
    });

    // Black pieces captured by white
    Object.entries(allPieces).forEach(([pieceType, count]) => {
        const missing = count - currentPieces.black[pieceType as PieceSymbol];
        for (let i = 0; i < missing; i++) {
            captured.black.push({ type: pieceType as PieceSymbol, color: 'b' });
        }
    });

    return captured;
}

/**
 * Get material advantage score
 */
export function getMaterialAdvantage(game: Chess): {
    white: number;
    black: number;
    advantage: 'white' | 'black' | 'equal';
    difference: number;
} {
    const pieceValues = {
        p: 1,
        n: 3,
        b: 3,
        r: 5,
        q: 9,
        k: 0
    };

    let whiteScore = 0;
    let blackScore = 0;

    const board = game.board();
    board.forEach(row => {
        row.forEach(square => {
            if (square) {
                const value = pieceValues[square.type];
                if (square.color === 'w') {
                    whiteScore += value;
                } else {
                    blackScore += value;
                }
            }
        });
    });

    const difference = Math.abs(whiteScore - blackScore);
    let advantage: 'white' | 'black' | 'equal' = 'equal';

    if (whiteScore > blackScore) advantage = 'white';
    else if (blackScore > whiteScore) advantage = 'black';

    return { white: whiteScore, black: blackScore, advantage, difference };
}

/**
 * Get move history in standard algebraic notation
 */
export function getMoveHistory(game: Chess): string[] {
    return game.history();
}

/**
 * Get move history with verbose information
 */
export function getVerboseMoveHistory(game: Chess): Move[] {
    return game.history({ verbose: true });
}

/**
 * Undo the last move
 */
export function undoMove(game: Chess): Move | null {
    return game.undo();
}

/**
 * Get FEN string representation of the board
 */
export function getFEN(game: Chess): string {
    return game.fen();
}

/**
 * Load a position from FEN string
 */
export function loadFEN(game: Chess, fen: string): boolean {
    try {
        game.load(fen);
        return true;
    } catch (error) {
        console.error('Invalid FEN:', error);
        return false;
    }
}

/**
 * Get PGN (Portable Game Notation) of the game
 */
export function getPGN(game: Chess): string {
    return game.pgn();
}

/**
 * Check if a square is under attack
 */
export function isSquareAttacked(game: Chess, square: Square, byColor: Color): boolean {
    const attackedSquares = getAttackedSquares(game, byColor);
    return attackedSquares.includes(square);
}

/**
 * Get all pieces of a specific color
 */
export function getPiecesByColor(game: Chess, color: Color): Array<{ square: Square; piece: { type: PieceSymbol; color: Color } }> {
    const pieces: Array<{ square: Square; piece: { type: PieceSymbol; color: Color } }> = [];
    const board = game.board();

    board.forEach((row, rowIdx) => {
        row.forEach((square, colIdx) => {
            if (square && square.color === color) {
                const squareNotation = `${String.fromCharCode(97 + colIdx)}${8 - rowIdx}` as Square;
                pieces.push({ square: squareNotation, piece: square });
            }
        });
    });

    return pieces;
}

/**
 * Check if it's a pawn promotion move
 */
export function isPawnPromotion(game: Chess, from: Square, to: Square): boolean {
    const piece = game.get(from);
    if (!piece || piece.type !== 'p') return false;

    const toRow = parseInt(to[1]);
    return (piece.color === 'w' && toRow === 8) || (piece.color === 'b' && toRow === 1);
}

/**
 * Get best move suggestions (simple evaluation)
 */
export function getMoveSuggestions(game: Chess, count: number = 3): Move[] {
    const moves = game.moves({ verbose: true });

    // Simple scoring: prioritize captures, checks, and center control
    const scoredMoves = moves.map(move => {
        let score = 0;

        // Prioritize captures
        if (move.captured) {
            const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
            score += pieceValues[move.captured] * 10;
        }

        // Prioritize center control
        const centerSquares = ['d4', 'd5', 'e4', 'e5'];
        if (centerSquares.includes(move.to)) {
            score += 5;
        }

        // Prioritize piece development
        if (move.piece === 'n' || move.piece === 'b') {
            score += 3;
        }

        // Add randomness to avoid predictability
        score += Math.random() * 2;

        return { move, score };
    });

    // Sort by score and return top moves
    return scoredMoves
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map(item => item.move);
}