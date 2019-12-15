import * as C from './const.js';
import * as AMath from './arrayMath.js';
import { TypedArrayND } from './ArrayND.js';
import { TypedTranspositionTable as TranspositionTable } from './TranspositionTable.js'
import PCG32 from './PCG32.js';
import zobrist from './zobrist.js';

export default class Board extends TypedArrayND {
    constructor(d) {
        super(d, 'Int8', -1);
        if (this.a.length > C.MAX_BOARD_LEN) { throw new Error("Board too large"); }
        this.hashH = 0;
        this.hashL = 0;
    }

    static copy(b) {
        // Copies hash and array
        // dimensions and offsets are referenced
        let nb = Object.assign(Object.create(Board.prototype), b);
        nb.a = new Int8Array(b.a);
        return nb;
    }

    equals(b) {
        let eq = super.equals(b);
        if (this.hashH !== b.hashH || this.hashL !== b.hashL) {
            return false;
        }
        return eq;
    }

    _rehash() {
        this.hashH = 0;
        this.hashL = 0;
        for (let i = 0, len = this.a.length; i < len; ++i) {
            const cube = this.a[i];
            if (cube >= 0) {
                const z = zobrist(i, cube);
                this.hashH ^= z.zobH;
                this.hashL ^= z.zobL;
            }
        }
    }

    _sethash(i, cube) {
        // Clear current value in hash
        const current = this.a[i];
        if (current >= 0) {
            const z = zobrist(i, current);
            this.hashH ^= z.zobH;
            this.hashL ^= z.zobL;
        }

        this.a[i] = cube;

        // Set new value in hash
        if (cube >= 0) {
            const z = zobrist(i, cube);
            this.hashH ^= z.zobH;
            this.hashL ^= z.zobL;
        }
    }

    set(c, cube) {
        this._check(c);
        const i = this._idx(c);
        this._sethash(i, cube);
    }

    slide(c, dir, check=true, ret_idx=false) {
        if (check) { this._check(c); }

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

        const i = this._idx(c);
        this._sethash(ni, this.a[i]);
        this._sethash(i, -1);
        return ret_idx ? ni : nc;
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
        const sum = AMath.sum(probs);
        const rng = new PCG32(seed);

        for (let i = 0, len = this.a.length; i < len; ++i) {
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

    /*
     * A solution can be generated for this board.
     */
    solutionable() {
        let hasEmpty = false;
        let hasMovable = false;
        for (let i = 0, len = this.a.length; i < len; ++i) {
            if (this.a[i] < 0) { hasEmpty = true; }
            if (this.a[i] > 0) { hasMovable = true; }
            if (hasEmpty && hasMovable) { return true; }
        }
        return false;
    }

    /*
     * Returns board containing the solution
     */
    solutionize(seed, depth, tries) {
        /* Returns index of nearest movable cube in flattened array */
        function nearestMovable(b, i) {
            if (b.a[i] > 0) { return i; }
            const len = b.a.length;
            let ia = i+1;
            let is = i-1;
            while (ia < len || is >= 0) {
                if (ia < len) {
                    if (b.a[ia] > 0) { return ia; }
                    ++ia;
                }
                if (is >= 0) {
                    if (b.a[is] > 0) { return is; }
                    --is;
                }
            }
            return -1;
        }

        const dirs = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        const len = this.a.length;
        const rng = new PCG32(seed);
        const tt = new TranspositionTable();
        tt.entry(this.hashH, this.hashL);

        const sb = Board.copy(this); // Solution Board

        for (let d = 0; d < depth; ++d) {
            let t;
            for (t = 0; t < tries; ++t) {
                let ran = rng.rand() % len;
                const idx = nearestMovable(sb, ran); // random cube
                const dir = dirs[rng.rand() % 3]; // random direction

                const cube = sb.a[idx];

                const ni = sb.slide(sb._coord(idx), dir, true, true); // return idx
                if (ni === null) { // could not slide
                    continue;
                }
                else if (!tt.entry(sb.hashH, sb.hashL)) { // new position
                    break;
                }
                else { // already encountered
                    sb._sethash(idx, cube);
                    sb._sethash(ni, -1); // undo slide
                }
            }
            if (t === tries) { return sb; } // Likely impossible to go deeper
        }
        return sb;
    }
}

import assert_eq from './assert_eq.js';
export function tests() {
    let b;
    let b1;
    let b2;
    // Checks
    try {
        b = new Board([64, 64, 64]);
        console.assert(false, "Too large board did not throw error");
    }
    catch {}

    // Hashes
    b1 = new Board([2, 3, 4]);
    b2 = new Board([2, 3, 4]);

    assert_eq(b1.hashH, 0);
    assert_eq(b1.hashL, 0);
    assert_eq(b2.hashH, 0);
    assert_eq(b2.hashL, 0);
    
    b1.set([1, 2, 3], 1);
    b2.set([1, 2, 3], 1);

    assert_eq(b1.hashH, b2.hashH);
    assert_eq(b1.hashL, b2.hashL);

    b1.set([1, 2, 3], -1);

    assert_eq(b1.hashH, 0);
    assert_eq(b1.hashL, 0);

    b1.set([1, 2, 3], 3);

    console.assert(b1.hashH !== b2.hashH || b1.hashL !== b2.hashL);
    
    b1.set([1, 2, 3], -1);
    
    assert_eq(b1.hashH, 0);
    assert_eq(b1.hashL, 0);

    b1.set([1, 2, 2], 1);

    console.assert(b1.hashH !== b2.hashH || b1.hashL !== b2.hashL);
    
    // Sliding
    b = new Board([3, 3, 4]);
    b.set([0, 0, 0], 1);

    let cstart = [0, 0, 0];
    let cend = [2, 0, 0];
    b.slide(cstart, [1, 0, 0]);
    assert_eq(b.get(cstart), -1);
    assert_eq(b.get(cend), 1);

    cstart = cend;
    cend = [2, 2, 0];
    b.slide(cstart, [0, 1, 0]);
    assert_eq(b.get(cstart), -1);
    assert_eq(b.get(cend), 1);

    cstart = cend;
    cend = [2, 0, 0];
    b.slide(cstart, [0, -1, 0]);
    assert_eq(b.get(cstart), -1);
    assert_eq(b.get(cend), 1);

    let c = [2, 2, 0];
    b.set(c, 3);

    b.slide(c, [0, -1, 0]);
    assert_eq(b.get(c), -1);
    assert_eq(b.get([2, 1, 0]), 3);

    // Generating boards
    b = new Board([3, 3, 4]);
    assert_eq(b.a, Array(b.a.length).fill(-1));

    b.randomize(0, [1, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert_eq(b.a, Array(b.a.length).fill(0));
    console.assert(b.hashH !== 0 && b.hashL !== 0);

    b.randomize(0, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert_eq(b.a, Array(b.a.length).fill(-1));
    assert_eq(b.hashH, 0); // Makes sure hashes were regenerated
    assert_eq(b.hashL, 0);

    b.randomize(0, [0, 0, 0, 1, 0, 0, 0, 0, 0]);
    assert_eq(b.a, Array(b.a.length).fill(3));
    console.assert(b.hashH !== 0 && b.hashL !== 0);

    // Internal: copying board deep copies the array and hashes
    b1 = new Board([1, 2, 3]);
    b2 = Board.copy(b1);

    c = [0, 0, 0];
    b1.set(c, 3);

    assert_eq(b1.get(c), 3);
    assert_eq(b2.get(c), -1);
    console.assert(b1.hashH !== b2.hashH && b1.hashL !== b2.hashL);
    
    // Generating Solutions
    
    b1 = new Board([1, 1, 2]);
    b1.set([0, 0, 0], 1);

    b2 = b1.solutionize(0, 5, 100);
    assert_eq(b2.get([0, 0, 1]), 1);
    console.assert(b1.hashH !== b2.hashH && b1.hashL !== b2.hashL);

    b1 = new Board([2, 2, 1]);
    b1.set([0, 0, 0], 1);

    b2 = b1.solutionize(0, 2, 100);
    assert_eq(b2.get([1, 1, 0]), 1);
    console.assert(b1.hashH !== b2.hashH && b1.hashL !== b2.hashL);
}

