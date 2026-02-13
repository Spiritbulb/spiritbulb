// app/api/chess-reverb/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Chess } from 'chess.js';

// Piece values
const PV: Record<string, number> = {
    p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
};

// Compressed PSTs (only what matters)
const PST: Record<string, number[]> = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
    K: [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50]
};

// Transposition table (smaller, faster)
const TT = new Map<string, { s: number; d: number; m: string }>();
const MAX_TT = 50000;

// MVV-LVA for captures
const MVV: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

// Fast evaluation
function evaluate(g: Chess, eg: boolean): number {
    if (g.isCheckmate()) return g.turn() === 'b' ? -99999 : 99999;
    if (g.isDraw() || g.isStalemate()) return 0;

    let s = 0;
    const b = g.board();

    // Material + position
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const pc = b[i][j];
            if (!pc) continue;

            const pv = PV[pc.type];
            const pst = PST[eg && pc.type === 'k' ? 'K' : pc.type] || [];
            const idx = pc.color === 'w' ? i * 8 + j : (7 - i) * 8 + j;
            const ps = pst[idx] || 0;

            s += pc.color === 'w' ? (pv + ps) : -(pv + ps);
        }
    }

    // Mobility
    const mc = g.moves().length;
    s += g.turn() === 'w' ? mc * 10 : -mc * 10;

    // Check bonus
    if (g.inCheck()) s += g.turn() === 'b' ? 50 : -50;

    return -s; // We're black
}

// Smart move ordering
function order(g: Chess, mvs: string[]): string[] {
    return mvs.sort((a, b) => {
        let sa = 0, sb = 0;

        if (a.includes('#')) sa += 1000000;
        if (b.includes('#')) sb += 1000000;

        if (a.includes('x')) {
            const vm = g.moves({ verbose: true });
            const cap = vm.find(m => m.san === a)?.captured;
            sa += cap ? MVV[cap] * 100 : 50;
        }
        if (b.includes('x')) {
            const vm = g.moves({ verbose: true });
            const cap = vm.find(m => m.san === b)?.captured;
            sb += cap ? MVV[cap] * 100 : 50;
        }

        if (a.includes('+')) sa += 90;
        if (b.includes('+')) sb += 90;

        if (a.includes('=Q')) sa += 800;
        if (b.includes('=Q')) sb += 800;

        if (a.match(/[de][45]/)) sa += 30;
        if (b.match(/[de][45]/)) sb += 30;

        if (a === 'O-O' || a === 'O-O-O') sa += 50;
        if (b === 'O-O' || b === 'O-O-O') sb += 50;

        return sb - sa;
    });
}

// Minimax with alpha-beta
function search(g: Chess, d: number, a: number, b: number, max: boolean, eg: boolean): { s: number; m: string } {
    const fen = g.fen();

    // TT lookup
    const cached = TT.get(fen);
    if (cached && cached.d >= d) return { s: cached.s, m: cached.m };

    if (d === 0 || g.isGameOver()) {
        return { s: evaluate(g, eg), m: '' };
    }

    const mvs = order(g, g.moves());
    let best = mvs[0] || '';

    if (max) {
        let mx = -Infinity;
        for (const m of mvs) {
            g.move(m);
            const e = search(g, d - 1, a, b, false, eg);
            g.undo();

            if (e.s > mx) {
                mx = e.s;
                best = m;
            }
            a = Math.max(a, e.s);
            if (b <= a) break; // Beta cutoff
        }

        if (TT.size < MAX_TT) TT.set(fen, { s: mx, d, m: best });
        return { s: mx, m: best };
    } else {
        let mn = Infinity;
        for (const m of mvs) {
            g.move(m);
            const e = search(g, d - 1, a, b, true, eg);
            g.undo();

            if (e.s < mn) {
                mn = e.s;
                best = m;
            }
            b = Math.min(b, e.s);
            if (b <= a) break; // Alpha cutoff
        }

        if (TT.size < MAX_TT) TT.set(fen, { s: mn, d, m: best });
        return { s: mn, m: best };
    }
}

// Opening book (aggressive moves)
const BOOK: Record<string, string[]> = {
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e5', 'c5'],
    'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['Nf6', 'd5'],
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': ['Nc6', 'Nf6'],
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': ['Nf3', 'Nc3'],
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': ['d6', 'Nc6'],
    'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2': ['c4', 'Nf3'],
    'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2': ['c4', 'Nf3'],
    'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['d4', 'Nc3'],
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['d4', 'Nc3'],
    'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3': ['Nf6', 'Bc5'],
};

// Check if endgame
function isEG(g: Chess): boolean {
    const b = g.board();
    let pc = 0, qc = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const p = b[i][j];
            if (p && p.type !== 'k' && p.type !== 'p') {
                pc++;
                if (p.type === 'q') qc++;
            }
        }
    }
    return (qc === 0 && pc <= 4) || pc <= 2;
}

// Main search with iterative deepening
async function getBest(g: Chess, maxMs: number = 1800): Promise<string> {
    // Opening book
    const book = BOOK[g.fen()];
    if (book?.length) {
        const bm = book[Math.floor(Math.random() * book.length)];
        if (g.moves().includes(bm)) return bm;
    }

    const t0 = Date.now();
    const eg = isEG(g);
    let best = g.moves()[0];
    let d = 1;

    // Adaptive depth
    const mc = g.moves().length;
    const maxD = mc < 15 ? 4 : (mc < 25 ? 5 : 6);

    while (d <= maxD && (Date.now() - t0) < maxMs) {
        const res = search(g, d, -Infinity, Infinity, true, eg);
        if (res.m) best = res.m;

        d++;

        // Exit on mate or time
        if (Math.abs(res.s) > 90000 || (Date.now() - t0) > maxMs * 0.75) break;
    }

    return best;
}

export async function POST(req: NextRequest) {
    try {
        const { boardState } = await req.json();
        const g = new Chess(boardState);

        if (g.turn() === 'b') {
            const mv = await getBest(g);
            const legal = g.moves();

            if (!legal.includes(mv)) {
                return NextResponse.json({ move: legal[0], success: true });
            }

            g.move(mv);
            return NextResponse.json({ move: mv, message: mv, success: true });
        }

        return NextResponse.json({ message: "White's turn", success: true });
    } catch (err) {
        console.error('AI error:', err);
        return NextResponse.json({ error: 'Server error', success: false }, { status: 500 });
    }
}