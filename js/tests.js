import { tests as ArrayMath } from './arrayMath.js';
import { tests as ArrayND } from './ArrayND.js';
import { tests as assert_eq } from './assert_eq.js';
import { tests as Board } from './Board.js';
import { tests as PCG32 } from './PCG32.js';
import { tests as TranspositionTable } from './TranspositionTable.js';
import { tests as zobrist } from './zobrist.js';

function tests() {
    ArrayMath();
    ArrayND();
    assert_eq();
    Board();
    PCG32();
    TranspositionTable();
    zobrist();
}

tests();

