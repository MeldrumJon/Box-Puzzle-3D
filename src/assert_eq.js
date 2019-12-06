export default function assert_eq(value, expected, print=true) {
    function cassert(exp, value, expected) {
        if (print) {
            console.assert(exp, 
                    'Expected ' + expected + ', but received ' + value);
        }
    }

    // Do the types match?
    let sameType = (typeof value === typeof expected);
    cassert(sameType, typeof value, typeof expected);
    if (!sameType) { return false; }

    // Do the array types match?
    //sameType = (Array.isArray(value) === Array.isArray(expected));
    //let arrayType = (a) => Array.isArray(a) ? 'array' : 'non-array';
    //cassert(sameType, arrayType(value), arrayType(expected));
    //if (!sameType) { return false; }

    // Compare value and expected
    if (Array.isArray(expected)) { // Each value and length of an array
        let sameLength = (value.length === expected.length);
        cassert(sameLength, 
                'array of length ' + value.length,
                'array of length ' + expected.length);
        if (!sameLength) { return false; }

        let result = true;
        for (let i = 0; i < expected.length; ++i) {
            if (value[i] !== expected[i]) {
                result = false;
                break;
            }
        }
        cassert(result, value, expected);
        if (!result) { return false; }
    }
    else { // For regular numbers
        let exp = (value === expected);
        cassert(exp, value, expected);
        if (!exp) { return false; }
    }
    return true;
}

export function tests() {
    console.assert(assert_eq({}, 5, false) === false);
    console.assert(assert_eq({}, {}, false) === false);
    console.assert(assert_eq([1, 2, 3], 1, false) === false);

    console.assert(assert_eq([1, 2], [1, 2, 3], false) === false);
    console.assert(assert_eq([1, 2, 3], [4, 5, 6], false) === false);
    console.assert(assert_eq([1, 2, 3], [1, 2, 3], false) === true);

    console.assert(assert_eq(1, 3, false) === false);
    console.assert(assert_eq(1, 1, false) === true);
}
