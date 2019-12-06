import * as C from './const.js';
import * as AMath from './arrayMath.js';
import { TypedArrayND } from './ArrayND.js';
import PCG32 from './PCG32.js';
import zobrist from './zobrist.js';

export default class Board extends TypedArrayND {
    constructor(d) {
        super(d, 'Int8', -1);
        if (this.a.length > C.MAX_BOARD_LEN) { throw new Error("Board too large"); }
        this.hashH = 0;
        this.hashL = 0;
    }

    _rehash() {
        this.hashH = 0;
        this.hashL = 0;
        for (let i = 0; i < this.a.length; ++i) {
            let cube = this.a[i];
            if (cube >= 0) {
                let z = zobrist(i, cube);
                this.hashH ^= z.zobH;
                this.hashL ^= z.zobL;
            }
        }
    }

    _sethash(i, cube) {
        // Clear current value in hash
        let current = this.a[i];
        if (current >= 0) {
            let z = zobrist(i, current);
            this.hashH ^= z.zobH;
            this.hashL ^= z.zobL;
        }

        this.a[i] = cube;

        // Set new value in hash
        if (cube >= 0) {
            let z = zobrist(i, cube);
            this.hashH ^= z.zobH;
            this.hashL ^= z.zobL;
        }
    }

    set(c, cube) {
        this._check(c);
        let i = this._idx(c);
        this._sethash(i, cube);
    }

    slide(c, dir) {
        this._check(c);

        let ni;
        let nc;

        let tc = AMath.add(c, dir);
        while (this._valid(tc)) {
            let ti = this._idx(tc);
            if (this.a[ti] >= 0) { // spot taken
                break;
            }

            nc = tc; // spot empty
            ni = ti;

            tc = AMath.add(tc, dir);
        }
        if (nc === undefined) {
            return null;
        }

        let i = this._idx(c);
        this._sethash(ni, this.a[i]);
        this._sethash(i, -1);
        return nc;
    }

    /**
     * Generate random board.
     *
     * @param probs  Array of length C.TOTAL_CUBES+1.  Each entry represents
     *               the probability of generating that cube type when divided
     *               by AMath.sum(probs).  probs[C.TOTAL_CUBES] represents the
     *               probability of generating an empty space when divided by
     *               AMath.sum(probs).
     * @param seed   Seed used in the random number generator.
     */
    randomize(seed, probs) {
        let sum = AMath.sum(probs);
        let rng = new PCG32(seed);

        for (let i = 0; i < this.a.length; ++i) {
            let rand = rng.rand() % sum;
            let acc = 0;
            let j;
            for (j = 0; j < C.TOTAL_CUBES; ++j) {
                acc += probs[j];
                if (rand < acc) {
                    this.a[i] = j;
                    break;
                }
            }
            if (j === C.TOTAL_CUBES) { this.a[i] = -1; }
        }
        this._rehash();
    }

    /**
     * Copies the board and generates a solution.
     */
    solutionize(seed, depth) {

    }
}

import assert_eq from './assert_eq.js';
export function tests() {
    // Checks
    try {
        let board = new Board([64, 64, 64]);
        console.assert(false, "Too large board did not throw error");
    }
    catch {}

    // Hashes
    let board1 = new Board([2, 3, 4]);
    let board2 = new Board([2, 3, 4]);

    assert_eq(board1.hashH, 0);
    assert_eq(board1.hashL, 0);
    assert_eq(board2.hashH, 0);
    assert_eq(board2.hashL, 0);
    
    board1.set([1, 2, 3], 1);
    board2.set([1, 2, 3], 1);

    assert_eq(board1.hashH, board2.hashH);
    assert_eq(board1.hashL, board2.hashL);

    board1.set([1, 2, 3], -1);

    assert_eq(board1.hashH, 0);
    assert_eq(board1.hashL, 0);

    board1.set([1, 2, 3], 3);

    console.assert(board1.hashH !== board2.hashH || board1.hashL !== board2.hashL);
    
    board1.set([1, 2, 3], -1);
    
    assert_eq(board1.hashH, 0);
    assert_eq(board1.hashL, 0);

    board1.set([1, 2, 2], 1);

    console.assert(board1.hashH !== board2.hashH || board1.hashL !== board2.hashL);
    
    // Sliding
    let board = new Board([3, 3, 4]);
    board.set([0, 0, 0], 1);

    let cstart = [0, 0, 0];
    let cend = [2, 0, 0];
    board.slide(cstart, [1, 0, 0]);
    assert_eq(board.get(cstart), -1);
    assert_eq(board.get(cend), 1);

    cstart = cend;
    cend = [2, 2, 0];
    board.slide(cstart, [0, 1, 0]);
    assert_eq(board.get(cstart), -1);
    assert_eq(board.get(cend), 1);

    cstart = cend;
    cend = [2, 0, 0];
    board.slide(cstart, [0, -1, 0]);
    assert_eq(board.get(cstart), -1);
    assert_eq(board.get(cend), 1);

    let c = [2, 2, 0];
    board.set(c, 3);

    board.slide(c, [0, -1, 0]);
    assert_eq(board.get(c), -1);
    assert_eq(board.get([2, 1, 0]), 3);

    // Generating boards
    let b = new Board([3, 3, 4]);
    assert_eq(b.a, Array(b.a.length).fill(-1));

    b.randomize(0, [1, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert_eq(b.a, Array(b.a.length).fill(0));

    b.randomize(0, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert_eq(b.a, Array(b.a.length).fill(-1));

    b.randomize(0, [0, 0, 0, 1, 0, 0, 0, 0, 0]);
    assert_eq(b.a, Array(b.a.length).fill(3));
}

