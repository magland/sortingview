import { isBoolean, isFeedId, isObjectOf, optional, _validateObject } from 'kachery-js/types/kacheryTypes'

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
export const isUserPermissions = (x: any): x is UserPermissions => {
    return _validateObject(x, {
        admin: optional(isBoolean),
        appendToAllFeeds: optional(isBoolean),
        feeds: optional(isObjectOf(isFeedId, isUserFeedPermissions))
    }, {allowAdditionalFields: true})
}

const useCurrentUserPermissions = (): UserPermissions | undefined => {
    // todo
    return {
    }
}

export default useCurrentUserPermissions