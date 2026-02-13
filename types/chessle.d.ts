declare module '@chessle/chess.js-extended' {
    import { Chess, Square, PieceSymbol, Color, Move, Piece } from 'chess.js';

    interface EvaluationOptions {
        depth?: number;
        skillLevel?: number;
        multiPV?: number;
    }

    interface EvaluationLine {
        line: string[];
        evaluation: number | string;
    }

    export class ChessEngine extends Chess {
        evaluatePosition(options: EvaluationOptions): Promise<EvaluationLine[]>;
    }
}
