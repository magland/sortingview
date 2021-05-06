import { isBoolean, isEqualTo, isOneOf, isString, optional, _validateObject } from "./kacheryTypes/kacheryTypes"

export type RegisterRequest = {
    type: 'registerBackendProvider' | 'unregisterBackendProvider' | 'registerClient'
    appName: 'sortingview',
    backendProviderUri: string
    secret?: string
    reportOnly?: string
}
export const isRegisterRequest = (x: any): x is RegisterRequest => {
    return _validateObject(x, {
        type: isOneOf([isEqualTo('unregisterBackendProvider'), isEqualTo('registerBackendProvider'), isEqualTo('registerClient')]),
        appName: isEqualTo('sortingview'),
        backendProviderUri: isString,
        secret: optional(isString),
        reportOnly: optional(isBoolean)    })
}

export type RegisteredBackendProvider = {
    backendProviderUri: string
    appName: 'sortingview',
    label: string
    objectStorageUrl: string
}
export const isRegisteredBackendProvider = (x: any): x is RegisteredBackendProvider => {
    return _validateObject(x, {
        backendProviderUri: isString,
        appName: isEqualTo('sortingview'),
        label: isString,
        objectStorageUrl: isString
    })
}

export type RegisterMessage = {
    type: 'unregisterBackendProvider' | 'registerBackendProvider',
    backendProviderUri: string,
    appName: 'sortingview',
    label: string,
    objectStorageUrl: string
}
export const isRegisterMessage = (x: any): x is RegisterMessage => {
    return _validateObject(x, {
        type: isOneOf([isEqualTo('unregisterBackendProvider'), isEqualTo('registerBackendProvider')]),
        backendProviderUri: isString,
        appName: isEqualTo('sortingview'),
        label: isString,
        objectStorageUrl: isString
    })
}

export interface TokenDetails {
    token: string
}

export type RegistrationResult = {
    backendProviderConfig: {label: string, objectStorageUrl: string, secretSha1: string},
    clientChannelName: string,
    serverChannelName: string,
    tokenDetails: TokenDetails
}
const isX = (x: any): x is {label: string, objectStorageUrl: string, secretSha1: string} => {
    return _validateObject(x, {
        label: isString,
        objectStorageUrl: isString,
        secretSha1: isString
    })
}
export const isRegistrationResult = (x: any): x is RegistrationResult => {
    return _validateObject(x, {
        backendProviderConfig: isX,
        backendProviderUri: isString,
        label: isString,
        objectStorageUrl: isString
    })
}