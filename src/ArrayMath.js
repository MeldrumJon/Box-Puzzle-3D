export function scale(arr, s) {
    for (let i = 0; i < arr.length; ++i) {
        arr[i] *= s;
    }
    return arr;
}

export function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

export function product(arr) {
    return arr.reduce((a, b) => a * b, 1);
}

export function add(arr1, arr2) {
    let result = [...arr1];
    for (let i = 0; i < arr1.length; ++i) {
        result[i] += arr2[i];
    }
    return result;
}

export function hdm(arr1, arr2) {
    let result = [...arr1];
    for (let i = 0; i < arr1.length; ++i) {
        result[i] *= arr2[i];
    }
    return result;
}

export function dot(arr1, arr2) {
    if (arr1.length !== arr2.length) { return undefined; }
    let result = 0;
    for (let i = 0; i < arr1.length; ++i) {
        result += arr1[i]*arr2[i];
    }
    return result;
}

export function cross(arr1, arr2) {
    if (arr1.length !== 3 || arr1.length !== arr2.length) { return undefined; }
    return [
        arr1[1]*arr2[2] - arr1[2]*arr2[1],
        arr1[2]*arr2[0] - arr1[0]*arr2[2],
        arr1[0]*arr2[1] - arr1[1]*arr2[0]
    ];
}

export function prev_product(arr) {
    let result = [];
    arr.reduce(function (acc, cv) {
        result.push(acc);
        return acc*cv;
    }, 1);
    return result;
}

import assert_eq from './assert_eq.js';
export function tests() {
    // scale(arr, s)
    assert_eq(scale([1, 1, 1], 10), [10, 10, 10]);
    assert_eq(scale([1, 2, 3], 100), [100, 200, 300]);

    // sum(arr)
    assert_eq(sum([1, 1, 1]), 3);
    assert_eq(sum([1, 2, 3]), 6);

    // product(arr)
    assert_eq(product([1, 2, 3]), 6);
    assert_eq(product([2, 2, 2, 2]), 16);

    // add(arr1, arr2)
    assert_eq(add([1, 1, 1], [1, 1, 1]), [2, 2, 2]);
    assert_eq(add([1, 2, 3], [4, 5, 6]), [5, 7, 9]);
    
    // had(arr1, arr2)
    assert_eq(hdm([1, 1, 1], [1, 2, 3]), [1, 2, 3]);
    assert_eq(hdm([10, 20, 30], [1, 2, 3]), [10, 40, 90]);

    // dot(arr1, arr2)
    assert_eq(dot([1, 3, -5], [4, -2, -1]), 3);
    assert_eq(dot([9, 2, 7], [4, 8, 10]), 122);

    // cross(arr1, arr2)
    assert_eq(cross([2, 3, 4], [5, 6, 7]), [-3, 6, -3]);
    assert_eq(cross([3, -3, 1], [4, 9, 2]), [-15, -2, 39]);

    // prev_product(arr)
    assert_eq(prev_product([1, 2, 2]), [1, 1, 2]);
    assert_eq(prev_product([2, 3, 4]), [1, 2, 6]);
}
