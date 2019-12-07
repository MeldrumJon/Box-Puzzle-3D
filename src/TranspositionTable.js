import * as C from './const.js';

const BITS = 16;
const MASK = BITS-1;
const SIZE = 2**16;

export class TranspositionTable {
    constructor() {
        this.tableH = new Array(SIZE);
        this.tableL = new Array(SIZE);
        this.collisions = 0; // address collisions
    }
    
    /*
     * Returns false if the hash was added to the hash table, true if the hash
     * has been encountered before.
     */
    entry(h, l) {
        const idx = l & MASK;
        const tH = this.tableH[idx];
        const tL = this.tableL[idx];
        if (tL === undefined) { // empty
            this.tableH[idx] = h;
            this.tableL[idx] = l;
            return false;
        }
        else if (tH === h 
                && tL === l) { // matches
            return true;
        }
        else if (Array.isArray(tL)) { // multiple entries
            for (let i = 0, len = tL.length; i < len; ++i) {
                if (tH[i] === h && tL[i] === l) {
                    return true; // matches
                }
            }
            tH.push(h);
            tL.push(l);
            ++this.collisions; // address collision
            return false;
        }
        else { // Hashes not equal, but have the same address
            this.tableH[idx] = [tH, h];
            this.tableL[idx] = [tL, l];
            ++this.collisions; // address collision
            return false;
        }
    }
}

export class TypedTranspositionTable {
    constructor() {
        this.tableH = new Int32Array(SIZE); // Bitwise XOR done signed
        this.tableL = new Int32Array(SIZE);
        this.arraysH = new Array(1); // length 1
        this.arraysL = new Array(1);
        this.collisions = 0; // address collisions
    }
    
    /*
     * Returns false if the hash was added to the hash table, true if the hash
     * has been encountered before.
     */
    entry(h, l) {
        const idx = l & MASK;
        const tH = this.tableH[idx];
        const tL = this.tableL[idx];
        if (tL === 0) { // empty
            this.tableH[idx] = h;
            this.tableL[idx] = l;
            return false;
        }
        else if (tH === h 
                && tL === l) { // match
            return true;
        }
        else if (tH === 0) { // tableL references array
            const aH = this.arraysH[tL];
            const aL = this.arraysL[tL];
            for (let i = 0, len = aL.length; i < len; ++i) {
                if (aH[i] === h && aL[i] === l) {
                    return true; // match
                }
            }
            aH.push(h);
            aL.push(l);
            ++this.collisions; // address collision
            return false;
        }
        else { // Hashes not equal, but have the same address
            const j = this.arraysL.length;
            this.arraysH[j] = [tH, h];
            this.arraysL[j] = [tL, l];
            this.tableH[idx] = 0;
            this.tableL[idx] = j;
            ++this.collisions; // address collision
            return false;
        }
    }
}

import assert_eq from './assert_eq.js';
export function tests() {
    let tt = new TranspositionTable();

    assert_eq(tt.entry(2, 2), false); // first entry
    assert_eq(tt.entry(2, 2), true); // match

    assert_eq(tt.entry(3, 2), false); // create array at idx 2
    assert_eq(tt.entry(2, 2), true); // match
    assert_eq(tt.entry(3, 2), true); // match

    assert_eq(tt.entry(4, 2), false); // add to array at idx 2
    assert_eq(tt.entry(2, 2), true); // match
    assert_eq(tt.entry(3, 2), true); // match
    assert_eq(tt.entry(4, 2), true); // match

    assert_eq(tt.collisions, 2); // two address collisions

    let ttt = new TypedTranspositionTable();

    assert_eq(ttt.entry(2, 2), false); // first entry
    assert_eq(ttt.entry(2, 2), true); // match

    assert_eq(ttt.entry(3, 2), false); // create array at idx 2
    assert_eq(ttt.entry(2, 2), true); // match
    assert_eq(ttt.entry(3, 2), true); // match

    assert_eq(ttt.entry(4, 2), false); // add to array at idx 2
    assert_eq(ttt.entry(2, 2), true); // match
    assert_eq(ttt.entry(3, 2), true); // match
    assert_eq(ttt.entry(4, 2), true); // match

    assert_eq(ttt.collisions, 2); // two address collisions
}

