import { isEqualTo, isOneOf, isString, optional, _validateObject } from "../kacheryTypes"

export type RegisterRequest = {
    type: 'registerBackendProvider' | 'registerClient'
    appName: 'sortingview',
    backendProviderUri: string
    secret?: string
}
export const isRegisterRequest = (x: any): x is RegisterRequest => {
    return _validateObject(x, {
        type: isOneOf([isEqualTo('registerBackendProvider'), isEqualTo('registerClient')]),
        appName: isEqualTo('sortingview'),
        backendProviderUri: isString,
        secret: optional(isString)
    })
}

export interface TokenDetails {
    token: string
}
const isTokenDetails = (x: any): x is TokenDetails => {
    return _validateObject(x, {
        token: isString
    }, {allowAdditionalFields: true})
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
        clientChannelName: isString,
        serverChannelName: isString,
        tokenDetails: isTokenDetails
    })
}