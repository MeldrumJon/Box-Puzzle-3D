import NDimArray from './game/lib/NDimArray.js';
import Board from './game/model/Board.js';
import MovableCube from './game/model/objects/MovableCube.js';
import Selector from './game/model/objects/Selector.js';

/**
 * Test the functions of the NDimArray class.
 */
export function testNDimArray() {
    let dims = [2, 3, 5, 3];
    let arr = new NDimArray(dims);
    // Do the set and get functions work?
    arr.set([1, 1, 1, 1], true);
    console.assert(arr.get([1, 1, 1, 1]) === true);
    // Was the array fill with "undefined"?
    console.assert(arr.get([1, 1, 1, 2]) === undefined);
    // Test the fill function
    arr.fill(false);
    console.assert(arr.get([1, 1, 1, 1]) === false);
    console.assert(arr.get([1, 1, 1, 2]) === false);
    console.assert(arr.get([0, 2, 4, 0]) === false);
    console.assert(arr.get([0, 0, 1, 2]) === false);
    // Does valid coordinate checking work?
    // These are not value coordinates.
    console.assert(arr.validCoords([1, 1, 3, 1, 1]) === false); // Too long
    console.assert(arr.validCoords([1, 2, 1]) === false); // Too short
    console.assert(arr.validCoords([1, -2, 1]) === false); // Negative number
    console.assert(arr.validCoords([2, 3, 5, 3]) === false); // Outside of range
    console.assert(arr.validCoords([1, 1, 1.1, 1]) === false); // Non-integer
    console.assert(arr.validCoords([1, 1, '1', 1]) === false); // Non-integer
    console.assert(arr.validCoords([1, 1, [], 1]) === false); // Non-integer
    // These are valid coordinates.
    console.assert(arr.validCoords([0, 0, 0, 0]) === true); // Extreme range.
    console.assert(arr.validCoords([1, 2, 4, 2]) === true); // Extreme range.
    console.assert(arr.validCoords([1, 1, 1, 1]) === true);
}

/**
 * Tests the methods of the Board class.
 */
export function testBoard() {
    let board = new Board([2, 3, 5, 3]);
    // Do the set and get functions work?
    board.set([1, 1, 1, 1], true);
    console.assert(board.get([1, 1, 1, 1]) === true);
    // Was the board fill with "null"?
    console.assert(board.get([1, 1, 1, 2]) === null);
    // Does the occupied function work?
    console.assert(board.occupied([1, 1, 1, 1]) === true);
    console.assert(board.occupied([1, 1, 1, 2]) === false);
}

/**
 * Tests methods in the MovableCube class.
 */
export function testMovableCube() {
    let board = new Board([5, 3, 4]);

    let coords1 = [1, 2, 3];
    let cube1 = new MovableCube(board, coords1, 0xff0000);
    board.set(coords1, cube1);
    cube1.move([1, 0, 0]);
    console.assert(board.get([4, 2, 3]) === cube1);

    cube1.move([0, 0, -1]);
    console.assert(board.get([4, 2, 0]) === cube1);

    let coords2 = [4, 2, 3];
    let cube2 = new MovableCube(board, coords2, 0x0ff000);
    board.set(coords2, cube2);
    cube2.move([0, 0, -1]);
    console.assert(board.get([4, 2, 1]) === cube2);

    let coords3 = [0, 2, 1];
    let cube3 = new MovableCube(board, coords3, 0x0000ff);
    board.set(coords3, cube3);
    cube3.move([1, 0, 0]);
    console.assert(board.get([3, 2, 1]) === cube3);
}

/* export function testGreyMovableCube() {
    let board = new Board([5, 3, 4]);

    let coords1 = [1, 2, 3];
    let cube1 = new GreyMovableCube(board, coords1, 0xff0000);
    board.set(coords1, cube1);
    cube1.move([1, 0, 0]);
    console.assert(board.get(coords1) === cube1);

    cube1.move([0, 0, -1]);
    console.assert(board.get(coords1) === cube1);

    let coords2 = [4, 2, 3];
    let cube2 = new GreyMovableCube(board, coords2, 0x0ff000);
    board.set(coords2, cube2);
    cube2.move([0, 0, -1]);
    console.assert(board.get(coords2) === cube2);
} */

export function testSelector() {
    let board = new Board([3, 3, 3]);

    let coords = [0, 0, 0];
    let selector = new Selector(board, coords, 0xff0000);
    board.setSelector(selector);

    selector.move([1, 0, 0]);
    console.assert(
        board.getSelector().coords.join(',') === [1, 0, 0].join(',')
    );

    selector.move([0, 2, 0]);
    console.assert(
        board.getSelector().coords.join(',') === [1, 2, 0].join(',')
    );

    selector.move([0, 1, 0]);
    console.assert(
        board.getSelector().coords.join(',') === [1, 2, 0].join(',')
    );
}
