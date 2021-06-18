import crypto from 'crypto'
import nacl from 'tweetnacl'
import { isPrivateKeyHex, isPublicKeyHex, isSignature, JSONValue, KeyPair, PrivateKey, PrivateKeyHex, PublicKey, PublicKeyHex, Sha1Hash, Signature } from "../types/kacheryTypes"

const ed25519PubKeyPrefix = "302a300506032b6570032100"
const ed25519PrivateKeyPrefix = "302e020100300506032b657004220420"

export const createKeyPair = async (): Promise<KeyPair> => {
    const kp = nacl.sign.keyPair()
    const publicKeyHex = Buffer.from(kp.publicKey).toString('hex')
    const privateKeyHex = Buffer.from(kp.secretKey).toString('hex').slice(0, 64)
    if (!isPublicKeyHex(publicKeyHex)) throw Error('Problem with public key in createKeyPair')
    if (!isPrivateKeyHex(privateKeyHex)) throw Error('Problem with private key in createKeyPair')
    return {
        publicKey: hexToPublicKey(publicKeyHex),
        privateKey: hexToPrivateKey(privateKeyHex)
    }
}

export const signMessage = async (msg: JSONValue, keyPair: KeyPair): Promise<Signature> => {
    // by default we use a SHA-1 prehash of stringified message stored as hex string followed by ed25519 signing
    const messageHash = stringSha1(stringifyDeterministicWithSortedKeys(msg))
    const messageHashBuffer = Buffer.from(messageHash.toString(), 'hex')
    const privateKeyHex = privateKeyToHex(keyPair.privateKey)
    const publicKeyHex = publicKeyToHex(keyPair.publicKey)
    const privateKeyBuffer = Buffer.from(privateKeyHex.toString() + publicKeyHex.toString(), 'hex')
    const signature = nacl.sign.detached(messageHashBuffer, privateKeyBuffer)
    const signatureHex = Buffer.from(signature).toString('hex')
    if (!isSignature(signatureHex)) throw Error('Problem signing message')
    const okay = await verifySignature(msg, keyPair.publicKey, signatureHex)
    if (!okay) throw Error('Problem verifying message signature in signMessageNew')
    return signatureHex
}

export const verifySignature = async (msg: JSONValue, publicKey: PublicKey, signature: Signature): Promise<boolean> => {
    // by default we use a SHA-1 prehash of stringified message stored as hex string followed by ed25519 signing
    const messageHash = stringSha1(stringifyDeterministicWithSortedKeys(msg))
    const messageHashBuffer = Buffer.from(messageHash.toString(), 'hex')
    const publicKeyHex = publicKeyToHex(publicKey)
    const publicKeyBuffer = Buffer.from(publicKeyHex.toString(), 'hex')
    const signatureBuffer = Buffer.from(signature.toString(), 'hex')
    const okay = nacl.sign.detached.verify(messageHashBuffer, signatureBuffer, publicKeyBuffer)
    if (!okay) {
        // if not verified we try the method we used to use for signing (in the future we'll want to migrate away from this - resigning old feed messages)
        // the old method requires a crypto function that is difficult to get to work in the browser
        return legacyVerifyMessage(msg, publicKey, signature)
    }
    return okay
}

const legacyVerifyMessage = async (msg: JSONValue, publicKey: PublicKey, signature: Signature): Promise<boolean> => {
    // crypto.verify is not available in the browser, and I can't get the other crypto functions to work properly
    if (!crypto.verify) {
        console.warn('Problem verifying signature, and unable to use crypto.verify (in verifySignature)')
        return false
    }
    const verified = crypto.verify(null, Buffer.from(stringifyDeterministicWithSortedKeys(msg)), publicKey.toString(), Buffer.from(signature.toString(), 'hex'))
    // why does typescript think that verified is a buffer? it should be boolean!
    return verified as any as boolean
}

export const stringSha1 = (x: string): Sha1Hash => {
    const sha1sum = crypto.createHash('sha1')
    sha1sum.update(x)
    return sha1sum.digest('hex') as any as Sha1Hash
}

// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const stringifyDeterministicWithSortedKeys = ( obj: JSONValue ) => {
    var allKeys: string[] = []
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort()
    const space = undefined
    return JSON.stringify(obj, allKeys, space)
}
// Example: stringifyDeterministicWithSortedKeys({b: 1, a: 0, d: [3, 5, {y: 1, x: 0}], c: '55'}) => `{"a":0,"b":1,"c":"55","d":[3,5,{"x":0,"y":1}]}`

export const testSignatures = async () => {
    const keyPair = await createKeyPair()
    const msg = {test: 'message'}
    const signature = await signMessage(msg, keyPair)
    const verified = await verifySignature(msg, keyPair.publicKey, signature)
    if (!verified) throw Error('Problem verifying signature in testSignatures')
    console.info(`Passed signature test`)
}

export const testKeyPair = async (keyPair: KeyPair) => {
    const msg = {test: 'message2'}
    const signature = await signMessage(msg, keyPair)
    const verified = await verifySignature(msg, keyPair.publicKey, signature)
    if (!verified) throw Error('Problem verifying signature in testKeyPair')
    console.info(`Passed testKeyPair`)
}

export const privateKeyToHex = (privateKey: PrivateKey): PrivateKeyHex => {
    const x = privateKey.split('\n')
    /* istanbul ignore next */
    if (x[0] !== '-----BEGIN PRIVATE KEY-----') {
        throw Error('Problem in private key format.')
    }
    /* istanbul ignore next */
    if (x[2] !== '-----END PRIVATE KEY-----') {
        /* istanbul ignore next */
        throw Error('Problem in private key format.')
    }
    const ret = Buffer.from(x[1], 'base64').toString('hex')
    /* istanbul ignore next */
    if (!ret.startsWith(ed25519PrivateKeyPrefix)) {
        throw Error('Problem in private key format.')
    }
    return ret.slice(ed25519PrivateKeyPrefix.length) as any as PrivateKeyHex
}

export const publicKeyToHex = (publicKey: PublicKey): PublicKeyHex => {
    const x = publicKey.split('\n')
    /* istanbul ignore next */
    if (x[0] !== '-----BEGIN PUBLIC KEY-----') {
        throw Error('Problem in public key format.')
    }
    /* istanbul ignore next */
    if (x[2] !== '-----END PUBLIC KEY-----') {
        throw Error('Problem in public key format.')
    }
    const ret = Buffer.from(x[1], 'base64').toString('hex')
    /* istanbul ignore next */
    if (!ret.startsWith(ed25519PubKeyPrefix)) {
        throw Error('Problem in public key format.')
    }
    return ret.slice(ed25519PubKeyPrefix.length) as any as PublicKeyHex
}

export const hexToPrivateKey = (x: PrivateKeyHex): PrivateKey => {
    /* istanbul ignore next */
    if (!x) {
        throw Error('Error in hexToPrivateKey. Input is empty.')
    }
    return `-----BEGIN PRIVATE KEY-----\n${Buffer.from(ed25519PrivateKeyPrefix + x, 'hex').toString('base64')}\n-----END PRIVATE KEY-----\n` as any as PrivateKey
}

export const hexToPublicKey = (x: PublicKeyHex): PublicKey => {
    /* istanbul ignore next */
    if (!x) {
        throw Error('Error in hexToPublicKey. Input is empty.')
    }
    return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(ed25519PubKeyPrefix + x, 'hex').toString('base64')}\n-----END PUBLIC KEY-----\n` as any as PublicKey
}