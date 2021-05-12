import { PubsubChannel } from '../pubsub/createPubsubClient';
import { isEqualTo, isString, JSONObject, optional, _validateObject } from '../kacheryTypes';
import GoogleSignInClient from '../googleSignIn/GoogleSignInClient';
import { isBoolean, isFeedId, isObjectOf } from '../kacheryTypes';

type UserFeedPermissions = {
    append?: boolean
}
const isUserFeedPermissions = (x: any): x is UserFeedPermissions => {
    return _validateObject(x, {
        append: optional(isBoolean)
    }, {allowAdditionalFields: true})
}

export type UserPermissions = {
    admin?: boolean
    appendToAllFeeds?: boolean
    feeds?: {[key: string]: UserFeedPermissions}
}
const isUserPermissions = (x: any): x is UserPermissions => {
    return _validateObject(x, {
        admin: optional(isBoolean),
        appendToAllFeeds: optional(isBoolean),
        feeds: optional(isObjectOf(isFeedId, isUserFeedPermissions))
    }, {allowAdditionalFields: true})
}

type UserPermissionsMessage = {
    type: 'userPermissions'
    userId: string
    permissions: UserPermissions
}
const isUserPermissionsMessage = (x: any): x is UserPermissionsMessage => {
    return _validateObject(x, {
        type: isEqualTo('userPermissions'),
        userId: isString,
        permissions: isUserPermissions
    })
}

class PermissionsManager {
    #permissions: {[key: string]: UserPermissions} = {}
    #requestedPermissions: {[key: string]: boolean} = {}
    #onCurrentUserPermissionsChangedCallbacks: (() => void)[] = []
    constructor(private clientChannel: PubsubChannel, private googleSignInClient: GoogleSignInClient | undefined) {
        const checkRequestPermissions = () => {
            const userId = googleSignInClient?.userId
            if ((userId) && (!this.#permissions[userId]) && (!this.#requestedPermissions[userId])) {
                this.#requestedPermissions[userId] = true
                this._requestUserPermissions(userId)
            }
        }
        checkRequestPermissions()
        googleSignInClient && googleSignInClient.onSignedInChanged(() => {checkRequestPermissions()})
    }
    processServerMessage(msg: JSONObject) {
        if (isUserPermissionsMessage(msg)) {
            this.#permissions[msg.userId] = msg.permissions
            if ((this.googleSignInClient?.userId) && (msg.userId === this.googleSignInClient?.userId)) {
                this.#onCurrentUserPermissionsChangedCallbacks.forEach(cb => {cb()})
            }
        }
    }
    getPermissions(userId: string): UserPermissions | null {
        return this.#permissions[userId] || null
    }
    _requestUserPermissions(userId: string) {
        const msg = {
            type: 'getUserPermissions',
            userId
        }
        const msg2 = this.googleSignInClient ? {...msg, idToken: this.googleSignInClient.idToken} : msg
        this.clientChannel.publish({
            data: msg2
        })
    }
    onCurrentUserPermissionsChanged(callback: () => void) {
        this.#onCurrentUserPermissionsChangedCallbacks.push(callback)
    }
}

export default PermissionsManager