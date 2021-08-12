import assert from 'assert';
import crypto from 'crypto'

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export interface JSONArray extends Array<JSONValue> {}
export const isJSONObject = (x: any): x is JSONObject => {
    if (!isObject(x)) return false
    return isJSONSerializable(x)
}
export const isJSONValue = (x: any): x is JSONValue => {
    return isJSONSerializable(x)
}
export const tryParseJsonObject = (x: string): JSONObject | null => {
    let a: any
    try {
        a = JSON.parse(x)
    }
    catch {
        return null
    }
    if (!isJSONObject(a)) return null
    return a;
}
export const isJSONSerializable = (obj: any): boolean => {
    if (typeof(obj) === 'string') return true
    if (typeof(obj) === 'number') return true
    if (!isObject(obj)) return false
    const isPlainObject = (a: Object) => {
        return Object.prototype.toString.call(a) === '[object Object]';
    };
    const isPlain = (a: any) => {
      return (a === null) || (typeof a === 'undefined' || typeof a === 'string' || typeof a === 'boolean' || typeof a === 'number' || Array.isArray(a) || isPlainObject(a));
    }
    if (!isPlain(obj)) {
      return false;
    }
    for (let property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (!isPlain(obj[property])) {
          return false;
        }
        if (obj[property] !== null) {
            if (typeof obj[property] === "object") {
                if (!isJSONSerializable(obj[property])) {
                    return false;
                }
            }
        }
      }
    }
    return true;
}

// object
export const isObject = (x: any): x is Object => {
    return ((x !== null) && (typeof x === 'object'));
}

// string
export const isString = (x: any): x is string => {
    return ((x !== null) && (typeof x === 'string'));
}

// function
export const isFunction = (x: any): x is Function => {
    return ((x !== null) && (typeof x === 'function'));
}

// number
export const isNumber = (x: any): x is number => {
    return ((x !== null) && (typeof x === 'number'));
}

// null
export const isNull = (x: any): x is null => {
    return x === null;
}

// boolean
export const isBoolean = (x: any): x is boolean => {
    return ((x !== null) && (typeof x === 'boolean'));
}

// isOneOf
export const isOneOf = (testFunctions: Function[]): ((x: any) => boolean) => {
    return (x) => {
        for (let tf of testFunctions) {
            if (tf(x)) return true;
        }
        return false;
    }
}

export const optional = (testFunctionOrSpec: Function | ValidateObjectSpec): ((x: any) => boolean) => {
    if (isFunction(testFunctionOrSpec)) {
        const testFunction: Function = testFunctionOrSpec
        return (x) => {
            return ((x === undefined) || (testFunction(x)));
        }
    }
    else {
        return (x) => {
            const obj: ValidateObjectSpec = testFunctionOrSpec
            return ((x === undefined) || (_validateObject(x, obj)))
        }
    }   
}

// isEqualTo
export const isEqualTo = (value: any): ((x: any) => boolean) => {
    return (x) => {
        return x === value;
    }
}

// isArrayOf
export const isArrayOf = (testFunction: (x: any) => boolean): ((x: any) => boolean) => {
    return (x) => {
        if ((x !== null) && (Array.isArray(x))) {
            for (let a of x) {
                if (!testFunction(a)) return false;
            }
            return true;
        }
        else return false;
    }
}

// isObjectOf
export const isObjectOf = (keyTestFunction: (x: any) => boolean, valueTestFunction: (x: any) => boolean): ((x: any) => boolean) => {
    return (x) => {
        if (isObject(x)) {
            for (let k in x) {
                if (!keyTestFunction(k)) return false;
                if (!valueTestFunction(x[k])) return false;
            }
            return true;
        }
        else return false;
    }
}

export type ValidateObjectSpec = {[key: string]: ValidateObjectSpec | (Function & ((a: any) => any))}

export const _validateObject = (x: any, spec: ValidateObjectSpec, opts?: {callback?: (x: string) => any, allowAdditionalFields?: boolean}): boolean => {
    const o = opts || {}
    if (!x) {
        o.callback && o.callback('x is undefined/null.')
        return false;
    }
    if (typeof(x) !== 'object') {
        o.callback && o.callback('x is not an Object.')
        return false;
    }
    for (let k in x) {
        if (!(k in spec)) {
            if (!o.allowAdditionalFields) {
                o.callback && o.callback(`Key not in spec: ${k}`)
                return false;
            }
        }
    }
    for (let k in spec) {
        const specK = spec[k];
        if (isFunction(specK)) {
            if (!specK(x[k])) {
                o.callback && o.callback(`Problem validating: ${k}`)
                return false;
            }
        }
        else {
            if (!(k in x)) {
                o.callback && o.callback(`Key not in x: ${k}`)
                return false;
            }
            if (!_validateObject(x[k], specK as ValidateObjectSpec, {callback: o.callback})) {
                o.callback && o.callback(`Value of key > ${k} < itself failed validation.`)
                return false;
            }
        }
    }
    return true;
}

// objectToMap and mapToObject
export const objectToMap = <KeyType extends String, ValueType>(obj: {[key: string]: any}) => {
    return new Map<KeyType, ValueType>(Object.keys(obj).map(k => {
        return [k as any as KeyType, obj[k] as any as ValueType];
    }));
}
export const mapToObject = <KeyType extends String, ValueType>(m: Map<KeyType, ValueType>) => {
    const ret: {[key: string]: any} = {};
    m.forEach((v, k) => {
        ret[k.toString()] = v;
    });
    return ret;
}


// Versioning
export interface ProtocolVersion extends String {
    __protocolVersion__: never // phantom type
}
// instead use isEqualTo(protocolVersion())
// export const isProtocolVersion = (x: any): x is ProtocolVersion => {
//     if (!isString(x)) return false;
//     return (/^[0-9a-zA-z.\ \-]{4,30}$/.test(x));
// }

export interface DaemonVersion extends String {
    __daemonVersion__: never // phantom
}
export const isDaemonVersion = (x: any): x is DaemonVersion => {
    if (!isString(x)) return false;
    return (/^[0-9a-zA-z. -]{4,40}?$/.test(x));
}


// Port
export interface Port extends Number {
    __port__: never
}
export const isPort = (x: any) : x is Port => {
    if (!isNumber(x)) return false;
    return x > 0 && x < 65536; // port numbers must be in 16-bit positive range
}
export const portToNumber = (x: Port): number => {
    return x as any as number;
}
export const toPort = (x: number): Port => {
    if (!isPort(x)) throw Error(`Not a valid port: ${x}`)
    return x
}

// HostName
export interface HostName extends String {
    __hostName__: never
}
export const isHostName = (x: any): x is HostName => {
    // can we be even more precise here? e.g. restrict number of elements?
    if (!isString(x)) return false;
    let result = true;
    x.split(".").forEach((element) => {
        if (element.length === 0) result = false;
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(element)) result = false;
    });
    // we cannot short-circuit by returning false from the anonymous function in the forEach loop.
    // Doing so returns false *from that function*, then ignores the result (since nothing is checking
    // the result of the anonymous function) and moves on to check the next chunk.
    return result;
}
export const hostName = (x: string): HostName => {
    if (!isHostName(x)) throw Error(`Not a valid host name: ${x}`)
    return x
}

// UrlString
export interface UrlString extends String {
    __urlString__: never
}
export const isUrlString = (x: any): x is UrlString => {
    if (!isString(x)) return false;
    if ((x.startsWith('http://') || (x.startsWith('https://')))) {
        if (x.length > 10000) return false
        return true
    }
    else {
        return false
    }
}
export const urlString = (x: string): UrlString => {
    if (!isUrlString(x)) throw Error(`Not a valid url string: ${x}`)
    return x
}

export interface NodeLabel extends String {
    __nodeLabel__: never
}
export const isNodeLabel = (x: any): x is NodeLabel => {
    if (!isString(x)) return false
    if (x.length > 20) return false
    let result = true
    x.split(".").forEach((element) => {
        if (element.length === 0) result = false
        if (!/^[a-zA-Z0-9@]([a-zA-Z0-9@-]*[a-zA-Z0-9@])?$/.test(element)) result = false
    });
    return result;
}
export const nodeLabel= (x: string): NodeLabel => {
    if (!isNodeLabel(x)) throw Error(`Not a valid node label: ${x}`)
    return x
}

// Address
export interface Address {
    hostName?: HostName,
    port?: Port,
    url?: UrlString
}
export const isAddress = (x: any): x is Address => {
    if (!_validateObject(x, {
        hostName: optional(isHostName),
        port: optional(isPort),
        url: optional(isUrlString)
    })) {
        return false
    }
    if ((x.hostName) && (x.port)) {
        return x.url ? false : true
    }
    else if (x.url) {
        return ((x.hostName) || (x.port)) ? false : true
    }
    else {
        return false
    }
}

// TimeStamp
export interface Timestamp extends Number {
    __timestamp__: never
}
export const isTimestamp = (x: any) : x is Timestamp => {
    if (!isNumber(x)) return false;
    if (x < 0) return false;  // For our purposes, timestamps should never be negative
    if (!Number.isInteger(x)) return false; // our timestamps should be whole numbers
    return true;
}
export const nowTimestamp = () => {
    const ret = Number(new Date()) - 0
    return ret as any as Timestamp
}
export const zeroTimestamp = () => {
    return 0 as any as Timestamp;
}
export const elapsedSince = (timestamp: Timestamp) => {
    return (nowTimestamp() as any as number) - (timestamp as any as number);
}

// PublicKey
export interface PublicKey extends String {
    __publicKey__: never // phantom type so that we cannot assign directly to a string
}
export const isPublicKey = (x: any) : x is PublicKey => {
    if (!isString(x)) return false;
    return checkKeyblockHeader(x, 'PUBLIC');
}

// PrivateKey
export interface PrivateKey extends String {
    __privateKey__: never // phantom type
}
export const isPrivateKey = (x: any) : x is PrivateKey => {
    if (!isString(x)) return false;
    return checkKeyblockHeader(x, 'PRIVATE');
}

const checkKeyblockHeader = (key: string, type: 'PUBLIC' | 'PRIVATE') => {
    // note we need to double-escape the backslashes here.
    const pattern = new RegExp(`-----BEGIN ${type} KEY-----[\\s\\S]*-----END ${type} KEY-----\n*$`);
    return (pattern.test(key));
}

// KeyPair
export interface KeyPair {
    publicKey: PublicKey,
    privateKey: PrivateKey
}
export const isKeyPair = (x: any) : x is KeyPair => {
    return _validateObject(x, {
        publicKey: isPublicKey,
        privateKey: isPrivateKey
    });
}

export const isHexadecimal = (x: string, length?: number) : boolean => {
    const basePattern: string = '[0-9a-fA-F]';
    let pattern: string = `^${basePattern}*$`;
    if (length !== undefined) {
        assert(Number.isInteger(length));
        assert(length > 0);
        pattern = `^${basePattern}{${length}}$`;
    }
    const regex = new RegExp(pattern);

    return (regex.test(x));
}

// PublicKeyHex
export interface PublicKeyHex extends String {
    __publicKeyHex__: never // phantom type so that we cannot assign directly to a string
}
export const isPublicKeyHex = (x: any) : x is PublicKeyHex => {
    if (!isString(x)) return false;
    return isHexadecimal(x, 64);
}

// PrivateKeyHex
export interface PrivateKeyHex extends String {
    __privateKeyHex__: never // phantom type
}
export const isPrivateKeyHex = (x: any) : x is PrivateKeyHex => {
    if (!isString(x)) return false;
    return isHexadecimal(x, 64);
}

// Sha1Hash
export interface Sha1Hash extends String {
    __sha1Hash__: never // phantom type
}
export const isSha1Hash = (x: any) : x is Sha1Hash => {
    if (!isString(x)) return false;
    return isHexadecimal(x, 40); // Sha1 should be 40 hex characters
}

// TaskId
export interface TaskId extends String {
    __taskId__: never // phantom type
}
export const isTaskId = (x: any) : x is TaskId => {
    if (!isString(x)) return false;
    if (x.length > 40) return false
    return true
}
export const toTaskId = (x: String) => {
    if (!isTaskId(x)) {
        throw Error(`Not a valid task ID: ${x}`)
    }
    return x as TaskId
}

//TaskStatus
export type TaskStatus = 'waiting' | 'pending' | 'queued' | 'running' | 'finished' | 'error'

export const isTaskStatus = (x: any): x is TaskStatus => {
    if (!isString(x)) return false
    return ['waiting', 'pending', 'queued', 'running', 'finished', 'error'].includes(x)
}

// TaskFunctionType
export type TaskFunctionType = 'pure-calculation' | 'query' | 'action'
export const isTaskFunctionType = (x: any) => {
    if (!isString(x)) return false
    return ['pure-calculation', 'query', 'action'].includes(x)
}

// Signature
export interface Signature extends String {
    __signature__: never
}
export const isSignature = (x: any): x is Signature => {
    if (!isString(x)) return false;
    return isHexadecimal(x, 128);
}


// NodeId
export interface NodeId extends String {
    __nodeId__: never // phantom type
}
export const isNodeId = (x: any): x is NodeId => {
    if (!isString(x)) return false;
    return isHexadecimal(x, 64);
}


// FeedId
export interface FeedId extends String {
    __feedId__: never // phantom type
}
export const isFeedId = (x: any): x is FeedId => {
    if (!isString(x)) return false;
    return isHexadecimal(x, 64);
}

// SubfeedHash
export interface SubfeedHash extends String {
    __subfeedHash__: never
}
export const isSubfeedHash = (x: any): x is SubfeedHash => {
    if (!isString(x)) return false;
    return (/^[0-9a-fA-F]{40}?$/.test(x));
}
export const subfeedHash = (x: Sha1Hash): SubfeedHash => {
    if (isSubfeedHash(x)) return x
    else throw Error(`Invalid subfeed hash: ${x}`)
}

// ChannelName
export interface ChannelName extends String {
    __channelName__: never // phantom type
}
export const isChannelName = (x: any): x is ChannelName => {
    if (!isString(x)) return false;
    if (x.length > 40) return false
    if (x.length < 3) return false
    let result = true
    x.split(".").forEach((element) => {
        if (element.length === 0) result = false
        if (!/^[a-zA-Z0-9@_-]([a-zA-Z0-9@_-]*[a-zA-Z0-9@_-])?$/.test(element)) result = false
    })
    return result
}
export const channelName = (x: string) => {
    if (!isChannelName(x)) throw Error(`Invalid channel name: ${x}`)
    return x as ChannelName
}

// TaskFunctionId
export interface TaskFunctionId extends String {
    __taskFunctionId__: never // phantom type
}
export const isTaskFunctionId = (x: any): x is TaskFunctionId => {
    if (!isString(x)) return false;
    if (x.length > 400) return false
    let result = true
    x.split(".").forEach((element) => {
        if (element.length === 0) result = false
        if (!/^[a-zA-Z0-9@_-]([a-zA-Z0-9@_-]*[a-zA-Z0-9@_-])?$/.test(element)) result = false
    })
    return result
}

// PubsubChannelName
export interface PubsubChannelName extends String {
    __pubsubChannelName__: never // phantom type
}
export const isPubsubChannelName = (x: any): x is PubsubChannelName => {
    if (!isString(x)) return false;
    if (x.length > 40) return false
    return true
}
export const pubsubChannelName = (x: string) => {
    if (!isPubsubChannelName(x)) throw Error(`Invalid pubsub channel name: ${x}`)
    return x as PubsubChannelName
}

// UserId
export interface UserId extends String {
    __userId__: never // phantom type
}
export const isUserId = (x: any): x is UserId => {
    if (!isString(x)) return false;
    if (x.length > 80) return false
    return true
}
export const userId = (x: string) => {
    if (!isUserId(x)) throw Error(`Invalid user ID: ${x}`)
    return x as UserId
}

export interface TaskKwargs  {
    __taskFunctionKwargs__: never // phantom type
}
export const isTaskKwargs = (x: any): x is TaskKwargs => {
    if (!isJSONObject(x)) return false
    return true
}
export const taskKwargs = (x: any) => {
    if (!isTaskKwargs(x)) throw Error('Invalid task kwargs')
    return x as TaskKwargs
}

// ErrorMessage
export interface ErrorMessage extends String {
    __errorMessage__: never; // phantom
}
export const isErrorMessage = (x: any): x is ErrorMessage => {
    return (isString(x)) && (x.length < 1000) ;
}
export const errorMessage = (x: string): ErrorMessage => {
    if (isErrorMessage(x)) return x;
    else {
        throw Error('Invalid error message: messages cannot exceed 1000 characters.');
    }
}

// FileKey
export interface FileKey {
    sha1: Sha1Hash,
    manifestSha1?: Sha1Hash,
    chunkOf?: {
        fileKey: FileKey,
        startByte: ByteCount,
        endByte: ByteCount
    }
}

export const isFileKey = (x: any): x is FileKey => {
    return _validateObject(x, {
        sha1: isSha1Hash,
        manifestSha1: optional(isSha1Hash),
        chunkOf: optional({
            fileKey: isFileKey,
            startByte: isByteCount,
            endByte: isByteCount
        })
    });
}

export interface FileKeyHash extends String {
    __fileKeyHash__: never // phantom
}
export const isFileKeyHash = (x: any): x is FileKeyHash => {
    return isSha1Hash(x) ? true : false
}
export const fileKeyHash = (fileKey: FileKey) => {
    return sha1OfObject(fileKey as any as JSONObject) as any as FileKeyHash
}


// FindLiveFeedResult
export interface FindLiveFeedResult {
    nodeId: NodeId
}
export const isFindLiveFeedResult = (x: any): x is FindLiveFeedResult => {
    return _validateObject(x, {
        nodeId: isNodeId
    });
}

// FindFileResults
export interface FindFileResult {
    nodeId: NodeId,
    fileKey: FileKey,
    fileSize: ByteCount
}
export const isFindFileResult = (x: any): x is FindFileResult => {
    if (!_validateObject(x, {
        nodeId: isNodeId,
        fileKey: isFileKey,
        fileSize: isByteCount
    })) return false;
    return (x.fileSize >= 0);
}


// RequestId
export interface RequestId extends String {
    __requestId__: never // phantom type
}
export const isRequestId = (x: any): x is RequestId => {
    if (!isString(x)) return false;
    return (/^[A-Za-z]{10}$/.test(x));
}

// ChannelLabel
export interface ChannelLabel extends String {
    __channelLabel__: never // phantom type
}
export const isChannelLabel = (x: any): x is ChannelLabel => {
    if (!isString(x)) return false;
    return (/^[0-9a-zA-Z_\-.]{4,160}?$/.test(x));
}
export const channelLabel = (x: string) => {
    if (!isChannelLabel(x)) {
        throw Error(`Invalid channel label: ${x}`)
    }
    return x
}

// FeedName
export interface FeedName extends String {
    __feedName__: never; // phantom
}
export const isFeedName = (x: any): x is FeedName => {
    if (!isString(x)) return false;
    return ((x.length > 0) && (x.length <= 100));
}
export const feedName = (x: string): FeedName => {
    if (isFeedName(x)) return x
    else throw Error(`Invalid feed name: ${x}`)
}

// FeedSubfeedId
export interface FeedSubfeedId extends String {
    __feedSubfeedId__: never; // phantom
}
export const feedSubfeedId = (feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName | undefined): FeedSubfeedId => {
    return (feedId.toString() + ':' + subfeedHash.toString() + ':' + (channelName?.toString() || '')) as any as FeedSubfeedId; 
}
export const isFeedSubfeedId = (x: any): x is FeedSubfeedId => {
    if (!isString(x)) return false;
    const parts = x.split(':');
    return (parts.length === 2) &&
           (isFeedId(parts[0])) &&
           (isSubfeedHash(parts[1]));
}


// SubfeedMessage
export interface SubfeedMessage extends JSONObject {
    __subfeedMessage__: never;
};
export const isSubfeedMessage = (x: any): x is SubfeedMessage => {
    return isObject(x);
}


// SubfeedMessageMetaData
export type SubfeedMessageMetaData = Object;
export const isSubfeedMessageMetaData = (x: any): x is SubfeedMessageMetaData => {
    return isObject(x);
}

// SignedSubfeedMessage
export interface SignedSubfeedMessage {
    body: {
        previousSignature?: Signature,
        messageNumber: number,
        message: SubfeedMessage,
        timestamp: Timestamp,
        metaData?: SubfeedMessageMetaData
    },
    signature: Signature
}
export const isSignedSubfeedMessage = (x: any): x is SignedSubfeedMessage => {
    if (! _validateObject(x, {
        body: {
            previousSignature: optional(isSignature),
            messageNumber: isNumber,
            message: isObject,
            timestamp: isTimestamp,
            metaData: optional(isSubfeedMessageMetaData)
        },
        signature: isSignature
    })) return false;

    return true;
}


// SubmittedSubfeedMessage
export interface SubmittedSubfeedMessage extends JSONObject {
    __submittedSubfeedMessage__: never;
};
export const isSubmittedSubfeedMessage = (x: any): x is SubmittedSubfeedMessage => {
    return ((isJSONObject(x)) && (JSON.stringify(x).length < 10000));
}
export const submittedSubfeedMessageToSubfeedMessage = (x: SubmittedSubfeedMessage) => {
    return x as any as SubfeedMessage;
}

// SubfeedWatchName
export interface SubfeedWatchName extends String {
    __subfeedWatchName__: never; // phantom
}
export const isSubfeedWatchName = (x: any) => {
    if (!isString(x)) return false;
    return x.length > 0;
}

export interface SubfeedPosition extends Number {
    __subfeedPosition__: never; // phantom
}
export const isSubfeedPosition = (x: any) => {
    if (!isNumber(x)) return false;
    return (x >= 0)
}
export const subfeedPositionToNumber = (x: SubfeedPosition) => {
    return x as any as number
}
export const subfeedPosition = (x: number): SubfeedPosition => {
    return x as any as SubfeedPosition
}

export interface MessageCount extends Number {
    __messageCount__: never; // phantom
}
export const isMessageCount = (x: any) => {
    if (!isNumber(x)) return false;
    return (x >= 0)
}
export const messageCountToNumber = (x: MessageCount) => {
    return x as any as number
}
export const messageCount = (x: number): MessageCount => {
    return x as any as MessageCount
}

// SubfeedWatch
export interface SubfeedWatch {
    feedId: FeedId,
    subfeedHash: SubfeedHash,
    position: SubfeedPosition
}
export const isSubfeedWatch = (x: any): x is SubfeedWatch => {
    return _validateObject(x, {
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        position: isSubfeedPosition
    });
}

export type SubfeedWatches = {[key: string]: SubfeedWatch};
export const isSubfeedWatches = (x: any): x is SubfeedWatches => {
    return isObjectOf(isSubfeedWatchName, isSubfeedWatch)(x);
}
export type SubfeedWatchesRAM = Map<SubfeedWatchName, SubfeedWatch>;
export const toSubfeedWatchesRAM = (x: SubfeedWatches) => {
    return objectToMap<SubfeedWatchName, SubfeedWatch>(x);
}
export const toSubfeedWatches = (x: SubfeedWatchesRAM) => {
    return mapToObject<SubfeedWatchName, SubfeedWatch>(x);
}

export interface UrlPath extends String {
    __urlPath__: never
}
export const urlPath = (x: string) => {
    return x as any as UrlPath
}

export const isBuffer = (x: any): x is Buffer => {
    return ((x !== null) && (x instanceof Buffer));
}

export interface DurationMsec extends Number {
    __durationMsec__: never
}
export const isDurationMsec = (x: any) : x is DurationMsec => {
    if (!isNumber(x)) return false;
    if (x < 0) return false;
    return true;
}
export const durationMsecToNumber = (x: DurationMsec): number => {
    return x as any as number;
}
export const scaledDurationMsec = (n: number) => {
    if (process.env.KACHERY_TEST_SPEEDUP_FACTOR) {
        n /= Number(process.env.KACHERY_TEST_SPEEDUP_FACTOR)
    }
    return n as any as DurationMsec
}
export const unscaledDurationMsec = (n: number) => {
    return n as any as DurationMsec
}
export const addDurations = (a: DurationMsec, b: DurationMsec) => {
    return ((a as any as number) + (b as any as number)) as any as DurationMsec
}
export const minDuration = (a: DurationMsec, b: DurationMsec) => {
    return Math.min(a as any as number, b as any as number) as any as DurationMsec
}
export const maxDuration = (a: DurationMsec, b: DurationMsec) => {
    return Math.max(a as any as number, b as any as number) as any as DurationMsec
}
export const scaleDurationBy = (a: DurationMsec, factor: number) => {
    return (a as any as number) * factor as any as DurationMsec
}
export const durationGreaterThan = (a: DurationMsec, b: DurationMsec): boolean => {
    return (a as any as number) > (b as any as number)
}
export const exampleDurationMsec = scaledDurationMsec(3000)

export interface ByteCount extends Number {
    __byteCount__: never
}
export const isByteCount = (x: any) : x is ByteCount => {
    if (!isNumber(x)) return false;
    if (x < 0) return false;
    return true;
}
export const byteCountToNumber = (x: ByteCount): number => {
    return x as any as number;
}
export const byteCount = (n: number) => {
    return n as any as ByteCount
}
export const addByteCount = (n1: ByteCount, n2: ByteCount) => {
    return byteCount(byteCountToNumber(n1) + byteCountToNumber(n2))
}
export const exampleByteCount = byteCount(4000)

export interface LocalFilePath extends String {
    __localFilePath__: never // phantom
}
export const localFilePath = (p: string) => {
    return p as any as LocalFilePath
}

export interface FileManifestChunk {
    start: ByteCount,
    end: ByteCount,
    sha1: Sha1Hash
}
export const isFileManifestChunk = (x: any): x is FileManifestChunk => {
    return _validateObject(x, {
        start: isByteCount,
        end: isByteCount,
        sha1: isSha1Hash
    })
}

export interface FileManifest {
    size: ByteCount,
    sha1: Sha1Hash,
    chunks: FileManifestChunk[]
}
export const isFileManifest = (x: any): x is FileManifest => {
    return _validateObject(x, {
        size: isByteCount,
        sha1: isSha1Hash,
        chunks: isArrayOf(isFileManifestChunk)
    })
}

// ChannelConfigUrl
export interface ChannelConfigUrl extends String {
    __channelConfigUrl__: never
}
export const isChannelConfigUrl = (x: any): x is ChannelConfigUrl => {
    if (!isString(x)) return false;
    if ((x.startsWith('http://') || (x.startsWith('https://')))) {
        if (x.length > 500) return false
        return true
    }
    else {
        return false
    }
}
export const channelConfigUrl = (x: string): ChannelConfigUrl => {
    if (!isChannelConfigUrl(x)) throw Error(`Not a valid channel config url string: ${x}`)
    return x
}

export const pathifyHash = (x: Sha1Hash | FeedId | SubfeedHash) => {
    return `${x[0]}${x[1]}/${x[2]}${x[3]}/${x[4]}${x[5]}/${x}`
}

export const sha1OfObject = (x: JSONObject): Sha1Hash => {
    return sha1OfString(JSONStringifyDeterministic(x))
}
export const sha1OfString = (x: string): Sha1Hash => {
    const sha1sum = crypto.createHash('sha1')
    sha1sum.update(x)
    return sha1sum.digest('hex') as any as Sha1Hash
}
// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: any, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

export const publicKeyHexToFeedId = (publicKeyHex: PublicKeyHex): FeedId => {
    return publicKeyHex as any as FeedId
}

export const nodeIdToPublicKeyHex = (nodeId: NodeId): PublicKeyHex => {
    return nodeId.toString() as any as PublicKeyHex;
}

export const feedIdToPublicKeyHex = (feedId: FeedId): PublicKeyHex => {
    return feedId as any as PublicKeyHex;
}

export const publicKeyHexToNodeId = (x: PublicKeyHex) : NodeId => {
    return x as any as NodeId;
}

export type MutableRecord = {
    key: JSONValue
    value: JSONValue
}