import * as AMath from './arrayMath.js';

export class ArrayND {
    constructor(d, fill=undefined) {
        this.dims = d;
        this.offs = AMath.prev_product(d);
        const len = AMath.product(d);
        this.a = new Array(len);
        if (fill !== undefined) {
            this.a.fill(fill);
        }
    }

    _valid(c) {
        const len = c.length;
        if (len !== this.dims.length) { return false; }
        for (let i = 0; i < len; ++i) {
            if (c[i] >= this.dims[i] || c[i] < 0) {
                return false;
            }
        }
        return true;
    }

    _check(c) {
        if (!this._valid(c)) {
            throw new RangeError("Coordinates must be an array of length 3 from " 
                    + [0,0,0].toString() + ' and ' + this.dims.toString() 
                    + '.');
        }
    }

    _idx(c) { 
        let idx = 0;
        for (let i = 0, len = c.length; i < len; ++i) {
            idx += c[i]*this.offs[i];
        }
        return idx;
    }

    _coord(i) {
        const len = this.dims.length;
        let c = new Array(len);
        c[0] = i % this.dims[0];
        for (let j = 1; j < len; ++j) {
            i = i - c[j-1] * this.offs[j-1];
            c[j] = ~~(i / this.offs[j]) % this.dims[j];
        }
        return c;
    }
    
    get(c) {
        this._check(c);
        const i = this._idx(c);
        return this.a[i];
    }

    set(c, v) {
        this._check(c);
        const i = this._idx(c);
        this.a[i] = v;
    }
}

export class TypedArrayND extends ArrayND {
    constructor(d, type, fill=0) {
        super(d);
        const len = this.a.length;
        switch (type) {
            case 'Int8':
                this.a = new Int8Array(len);
                break;
            case 'Uint8':
                this.a = new Uint8Array(len);
                break;
            case 'Uint8Clamped':
                this.a = new Uint8ClampedArray(len);
                break;
            case 'Int16':
                this.a = new Int16Array(len);
                break;
            case 'Uint16':
                this.a = new Uint16Array(len);
                break;
            case 'Int32':
                this.a = new Int32Array(len);
                break;
            case 'Uint32':
                this.a = new Uint32Array(len);
                break;
            case 'Float32':
                this.a = new Float32Array(len);
                break;
            case 'Float64':
                this.a = new Float64Array(len);
                break;
            case 'BigInt64':
                this.a = new BigInt64Array(len);
                break;
            case 'BigUint64':
                this.a = new BigUint64Array(len);
                break;
        }
        if (fill) {
            this.a.fill(fill, 0, len);
        }
    }
}

import assert_eq from './assert_eq.js';
export function tests() {
    let a = new ArrayND([2, 3, 4], null);

    // Regular array
    try {
        a.get([3, 1, 1]);
        console.assert(false, "a.get should have thrown RangeError");
    } catch {}
    try {
        a.set([1, 1, 5], 0);
        console.assert(false, "a.set should have thrown RangeError");
    } catch {}
    
    assert_eq(a.get([1, 0, 1]), null);
    a.set([1, 0, 1], 3);
    assert_eq(a.get([1, 0, 1]), 3);

    // Idx <-> Coord
    a = new ArrayND([5, 7, 13]);
    for (let i = 0; i < 5; ++i) {
        for (let j = 0; j < 7; ++j) {
            for (let k = 0; k < 13; ++k) {
                let c = [i, j, k];
                let idx = a._idx(c);
                let cn = a._coord(idx);
                assert_eq(cn, c);
            }
        }
    }

    // Typed array
    let ta = new TypedArrayND([2, 3, 4], 'Int8');
    
    try {
        ta.get([3, 1, 1]);
        console.assert(false, "a.get should have thrown RangeError");
    } catch {}
    try {
        ta.set([1, 1, 5], 0);
        console.assert(false, "a.set should have thrown RangeError");
    } catch {}
    
    assert_eq(ta.get([1, 0, 1]), 0);
    assert_eq(ta.get([1, 0, 2]), 0);
    ta.set([1, 0, 1], 3);
    assert_eq(ta.get([1, 0, 1]), 3);
}
