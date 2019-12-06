import * as C from './const.js';
import * as AMath from './arrayMath.js';
import Board from './Board.js';

export default class Cube {
    constructor(type, c, board) {
        if (type >= C.TOTAL_CUBES || type < 0) {
            throw new Error("Invalid Cube Type");
        }
        this.coords = c;
        this.board = board;
        this.type = type;
    }
    
    slide(inc) {
        let c = null;
        let test = AMath.add(this.coords, inc);
        while (this.board.get(test) === null) {
            c = test;
            test = AMath.add(test, inc);
        }
        if (c !== null) {
            this.board.set(this.coords, null);
            this.board.set(c, this);
            this.coords = c;
        }
    }
}

import assert_eq from './assert_eq.js';
export function tests() {
    try {
        let cube = new Cube(-1, null, null);
        console.assert(false, "Invalid cube type did not throw error");
    }
    catch {}
    try {
        let cube = new Cube(C.TOTAL_CUBES, null, null);
        console.assert(false, "Invalid cube type did not throw error");
    }
    catch {}

    let board = new Board([3, 3, 4]);

    let c = [0, 0, 0];
    let cube = new Cube(1, c, board);
    board.set(c, cube);

    cube.slide([1, 0, 0]);
    assert_eq(cube.coords, [2, 0, 0]);
    assert_eq(board.get([0, 0, 0]), null);
    assert_eq(board.get([2, 0, 0]).type, 1);
    cube.slide([0, 1, 0]);
    assert_eq(cube.coords, [2, 2, 0]);
    assert_eq(board.get([2, 0, 0]), null);
    assert_eq(board.get([2, 2, 0]).type, 1);
    cube.slide([0, 0, 1]);
    assert_eq(cube.coords, [2, 2, 3]);
    assert_eq(board.get([2, 2, 0]), null);
    assert_eq(board.get([2, 2, 3]).type, 1);

    c = [2, 2, 0];
    cube = new Cube(2, c, board);
    board.set(c, cube);

    cube.slide([0, 0, 1]);
    assert_eq(cube.coords, [2, 2, 2]);
    assert_eq(board.get([2, 2, 0]), null);
    assert_eq(board.get([2, 2, 2]).type, 2);
}

