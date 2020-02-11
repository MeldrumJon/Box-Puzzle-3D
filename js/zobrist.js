import * as C from './const.js';
import PCG32 from './PCG32.js';

const BOARD_BITS = Math.ceil(Math.log2(C.MAX_BOARD_LEN));
const ZOBRIST_LEN = C.MAX_BOARD_LEN*C.TOTAL_CUBES;
const ZOBRISTH = new Int32Array(ZOBRIST_LEN); // Bitwise XOR done signed
const ZOBRISTL = new Int32Array(ZOBRIST_LEN);

function zobrist_gen() {
    const SEED = 1575579901796n;
    const rng = new PCG32(SEED);
    for (let i = 0; i < ZOBRIST_LEN; ++i) {
        ZOBRISTH[i] = rng.rand();
        ZOBRISTL[i] = rng.rand();
    }
}
zobrist_gen();

export default function zobrist(board_idx, cube_type) {
    let i = board_idx | (cube_type << BOARD_BITS);
    return {
        zobH: ZOBRISTH[i],
        zobL: ZOBRISTL[i]
    };
}

import assert_eq from './assert_eq.js';
export function tests() {
    let a = zobrist(1, 5);
    let b = zobrist(44, 6);

    console.assert(a.zobH !== b.zobH);
    console.assert(a.zobL !== b.zobL);
}
