import { serialize as bsonSerialize } from 'bson'

const kacheryP2PSerialize = (x: Object) => {
    return bsonSerialize(sortKeysInObject(x));
}

const sortKeysInObject = (x: any): any => {
    if (x instanceof Buffer) {
        return x;
    }
    else if (x instanceof Object) {
        if (Array.isArray(x)) {
            return x.map(a => (sortKeysInObject(a)));
        }
        else {
            const keys = Object.keys(x).sort();
            let ret: any = {};
            for (let k of keys) {
                ret[k] = sortKeysInObject(x[k]);
            }
            return ret;
        }
    }
    else {
        return x;
    }
}

export default kacheryP2PSerialize