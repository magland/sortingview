const deserializeReturnValue = (x: any): any => {
    if (!x) return x
    else if (typeof (x) === 'object') {
        if (Array.isArray(x)) {
            return x.map(a => deserializeReturnValue(a))
        }
        else if (x._type === 'ndarray') {
            const shape = x.shape as number[]
            const dtype = x.dtype as string
            const data_b64 = x.data_b64 as string
            const dataBuffer = _base64ToArrayBuffer(data_b64)
            if (dtype === 'float32') {
                return applyShape(new Float32Array(dataBuffer), shape)
            }
            else if (dtype === 'int32') {
                return applyShape(new Int32Array(dataBuffer), shape)
            }
            else if (dtype === 'int16') {
                return applyShape(new Int16Array(dataBuffer), shape)
            }
            else {
                throw Error(`Datatype not yet implemented for ndarray: ${dtype}`)
            }
        }
        else {
            const ret: { [key: string]: any } = {}
            for (let k in x) {
                ret[k] = deserializeReturnValue(x[k])
            }
            return ret
        }
    }
    else return x
}

const applyShape = (x: Float32Array | Int32Array | Int16Array, shape: number[]): number[] | number[][] | number[][][] | number[][][][] | number[][][][][] => {
    if (shape.length === 1) {
        if (shape[0] !== x.length) throw Error('Unexpected length of array')
        return Array.from(x)
    }
    else if (shape.length === 2) {
        const n1 = shape[0]
        const n2 = shape[1]
        if (n1 * n2 !== x.length) throw Error('Unexpected length of array')
        const ret: number[][] = []
        for (let i1 = 0; i1 < n1; i1++) {
            ret.push(Array.from(x.slice(i1 * n2, (i1 + 1) * n2)))
        }
        return ret
    }
    else if (shape.length === 3) {
        const n1 = shape[0]
        const n2 = shape[1]
        const n3 = shape[2]
        if (n1 * n2 * n3 !== x.length) throw Error('Unexpected length of array')
        const ret: number[][][] = []
        for (let i1 = 0; i1 < n1; i1++) {
            const A: number[][] = []
            for (let i2 = 0; i2 < n2; i2++) {
                A.push(Array.from(x.slice(i1 * n2 * n3 + i2 * n3, i1 * n2 * n3 + ( i2 + 1 ) * n3)))
            }
            ret.push(A)
        }
        return ret
    }
    else if (shape.length === 4) {
        const n1 = shape[0]
        const n2 = shape[1]
        const n3 = shape[2]
        const n4 = shape[3]
        if (n1 * n2 * n3 * n4 !== x.length) throw Error('Unexpected length of array')
        const ret: number[][][][] = []
        for (let i1 = 0; i1 < n1; i1++) {
            const A: number[][][] = []
            for (let i2 = 0; i2 < n2; i2++) {
                const B: number[][] = []
                for (let i3 = 0; i3 < n3; i3++) {
                    B.push(Array.from(x.slice(i1 * n2 * n3 * n4 + i2 * n3 * n4 + i3 * n4, i1 * n2 * n3 * n4 + i2 * n3 * n4 + ( i3 + 1 ) * n4)))
                }
                A.push(B)
            }
            ret.push(A)
        }
        return ret
    }
    else if (shape.length === 5) {
        const n1 = shape[0]
        const n2 = shape[1]
        const n3 = shape[2]
        const n4 = shape[3]
        const n5 = shape[4]
        if (n1 * n2 * n3 * n4 * n5 !== x.length) throw Error('Unexpected length of array')
        const ret: number[][][][][] = []
        for (let i1 = 0; i1 < n1; i1++) {
            const A: number[][][][] = []
            for (let i2 = 0; i2 < n2; i2++) {
                const B: number[][][] = []
                for (let i3 = 0; i3 < n3; i3++) {
                    const C: number[][] = []
                    for (let i4 = 0; i4 < n4; i4++) {
                        C.push(Array.from(x.slice(i1 * n2 * n3 * n4 * n5 + i2 * n3 * n4 * n5 + i3 * n4 * n5 + i4 * n5, i1 * n2 * n3 * n4 * n5 + i2 * n3 * n4 * n5 + i3 * n4 * n5 + (i4 + 1) * n5)))
                    }
                    B.push(C)
                }
                A.push(B)
            }
            ret.push(A)
        }
        return ret
    }
    else {
        throw Error('Not yet implemented')
    }
}

const _base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    var binary_string = window.atob(base64)
    var len = binary_string.length
    var bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
}

export default deserializeReturnValue