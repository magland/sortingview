const deserializeReturnValue = (x: any): any => {
    if (typeof (x) === 'object') {
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

const applyShape = (x: Float32Array | Int32Array | Int16Array, shape: number[]): number[] | number[][] => {
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