import { ChannelName, isArrayOf, isBoolean, isChannelName, isEqualTo, isNodeId, isNodeLabel, isNumber, isOneOf, isSha1Hash, isSignature, isString, isTaskFunctionId, isTaskId, isTaskKwargs, isTimestamp, isUserId, NodeId, NodeLabel, optional, Sha1Hash, Signature, TaskFunctionId, TaskId, TaskKwargs, Timestamp, UserId, _validateObject } from "./kacheryTypes"
import { isTaskFunctionType, TaskFunctionType } from "./pubsubMessages"

export type GoogleServiceAccountCredentials = {
    type: 'service_account',
    project_id: string,
    private_key_id: string,
    private_key: string,
    client_email: string,
    client_id: string
}

export const isGoogleServiceAccountCredentials = (x: any): x is GoogleServiceAccountCredentials => {
    return _validateObject(x, {
        type: isEqualTo('service_account'),
        project_id: isString,
        private_key_id: isString,
        private_key: isString,
        client_email: isString,
        client_id: isString,
    }, {allowAdditionalFields: true})
}

export interface AblyTokenRequest {
    capability: string
    clientId?: string
    keyName: string
    mac: string
    nonce: string
    timestamp: number
    ttl?: number
}
export const isAblyTokenRequest = (x: any): x is AblyTokenRequest => {
    return _validateObject(x, {
        capability: isString,
        keyName: isString,
        mac: isString,
        nonce: isString,
        timestamp: isNumber
    }, {allowAdditionalFields: true})
}

export type PubsubAuth = {
    ablyTokenRequest: AblyTokenRequest
}
export const isPubsubAuth = (x: any): x is PubsubAuth => {
    return _validateObject(x, {
        ablyTokenRequest: isAblyTokenRequest
    })
}

export type NodeChannelAuthorization = {
    channelName: ChannelName
    nodeId: NodeId
    permissions: {
        requestFiles?: boolean
        requestFeeds?: boolean
        requestTasks?: boolean
        provideFiles?: boolean
        provideFeeds?: boolean
        provideTasks?: boolean
    }
    roles?: { // obtained by cross-referencing with the node
        downloadFiles?: boolean
        downloadFeeds?: boolean
        downloadTaskResults?: boolean
        requestFiles?: boolean
        requestFeeds?: boolean
        requestTasks?: boolean
        provideFiles?: boolean
        provideFeeds?: boolean
        provideTasks?: boolean
    }
}

export const isNodeChannelAuthorization = (x: any): x is NodeChannelAuthorization => {
    return _validateObject(x, {
        channelName: isChannelName,
        nodeId: isNodeId,
        permissions: (a: any) => (_validateObject(a, {
            requestFiles: optional(isBoolean),
            requestFeeds: optional(isBoolean),
            requestTasks: optional(isBoolean),
            provideFiles: optional(isBoolean),
            provideFeeds: optional(isBoolean),
            provideTasks: optional(isBoolean)
        }, {allowAdditionalFields: true})),
        roles: optional((a: any) => _validateObject(a, {
            downloadFiles: optional(isBoolean),
            downloadFeeds: optional(isBoolean),
            downloadTaskResults: optional(isBoolean),
            requestFiles: optional(isBoolean),
            requestFeeds: optional(isBoolean),
            requestTasks: optional(isBoolean),
            provideFiles: optional(isBoolean),
            provideFeeds: optional(isBoolean),
            provideTasks: optional(isBoolean)
        }, {allowAdditionalFields: true}))
    }, {allowAdditionalFields: true})
}

export type ChannelConfig = {
    channelName: ChannelName
    ownerId: UserId
    bucketUri?: string
    googleServiceAccountCredentials?: string | '*private*'
    ablyApiKey?: string | '*private*'
    deleted?: boolean
    authorizedNodes?: NodeChannelAuthorization[]
}

export const isChannelConfig = (x: any): x is ChannelConfig => {
    return _validateObject(x, {
        channelName: isChannelName,
        ownerId: isUserId,
        bucketUri: optional(isString),
        googleServiceAccountCredentials: optional(isOneOf([isString, isEqualTo('*private*')])),
        ablyApiKey: optional(isOneOf([isString, isEqualTo('*private*')])),
        deleted: optional(isBoolean),
        authorizedNodes: optional(isArrayOf(isNodeChannelAuthorization))
    })
}

export type NodeReport = {
    nodeId: NodeId,
    ownerId: UserId,
    nodeLabel: NodeLabel
}

export const isNodeReport = (x: any): x is NodeReport => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isUserId,
        nodeLabel: isNodeLabel
    }, {allowAdditionalFields: true})
}

export type NodeChannelMembership = {
    nodeId: NodeId
    channelName: ChannelName
    roles: {
        downloadFiles?: boolean
        downloadFeeds?: boolean
        downloadTaskResults?: boolean
        requestFiles?: boolean
        requestFeeds?: boolean
        requestTasks?: boolean
        provideFiles?: boolean
        provideFeeds?: boolean
        provideTasks?: boolean
    }
    channelBucketUri?: string // obtained by cross-referencing the channels collection
    authorization?: NodeChannelAuthorization // obtained by cross-referencing the channels collection
}

const isNodeChannelMembership = (x: any): x is NodeChannelMembership => {
    return _validateObject(x, {
        nodeId: isNodeId,
        channelName: isChannelName,
        roles: (a: any) => (_validateObject(a, {
            downloadFiles: optional(isBoolean),
            downloadFeeds: optional(isBoolean),
            downloadTaskResults: optional(isBoolean),
            requestFiles: optional(isBoolean),
            requestFeeds: optional(isBoolean),
            requestTasks: optional(isBoolean),
            provideFiles: optional(isBoolean),
            provideFeeds: optional(isBoolean),
            provideTasks: optional(isBoolean),
        }, {allowAdditionalFields: true})),
        channelBucketUri: optional(isString),
        authorization: optional(isNodeChannelAuthorization)
    })
}

export type NodeConfig = {
    nodeId: NodeId
    ownerId: UserId
    channelMemberships?: NodeChannelMembership[]
    lastNodeReport?: NodeReport
    lastNodeReportTimestamp?: Timestamp
    deleted?: boolean
}

export const isNodeConfig = (x: any): x is NodeConfig => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isUserId,
        channelMemberships: optional(isArrayOf(isNodeChannelMembership)),
        memberships: optional(isNumber), // for historical - remove eventually
        lastNodeReport: optional(isNodeReport),
        lastNodeReportTimestamp: optional(isTimestamp),
        deleted: optional(isBoolean)
    })
}

export type Auth = {
    userId?: UserId,
    googleIdToken?: string
}

export const isAuth = (x: any): x is Auth => {
    return _validateObject(x, {
            userId: optional(isUserId),
            googleIdToken: optional(isString)
    })
}

export type GetChannelsForUserRequest = {
    type: 'getChannelsForUser'
    userId: UserId
    auth: Auth
}

export const isGetChannelsForUserRequest = (x: any): x is GetChannelsForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getChannelsForUser'),
        userId: isUserId,
        auth: isAuth
    })
}

export type AddChannelRequest = {
    type: 'addChannel'
    channel: ChannelConfig
    auth: Auth
}

export const isAddChannelRequest = (x: any): x is AddChannelRequest => {
    return _validateObject(x, {
        type: isEqualTo('addChannel'),
        channel: isChannelConfig,
        auth: isAuth
    })
}

export type DeleteChannelRequest = {
    type: 'deleteChannel'
    channelName: ChannelName
    auth: Auth
}

export const isDeleteChannelRequest = (x: any): x is DeleteChannelRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteChannel'),
        channelName: isChannelName,
        auth: isAuth
    })
}

export type GetNodesForUserRequest = {
    type: 'getNodesForUser'
    userId: UserId,
    auth: Auth
}

export const isGetNodesForUserRequest = (x: any): x is GetNodesForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getNodesForUser'),
        userId: isUserId,
        auth: isAuth
    })
}

export type GetNodeForUserRequest = {
    type: 'getNodeForUser'
    nodeId: NodeId
    userId: UserId
    auth: Auth
}

export const isGetNodeForUserRequest = (x: any): x is GetNodeForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getNodeForUser'),
        nodeId: isNodeId,
        userId: isUserId,
        auth: isAuth
    })
}

export type GetNodeForUserResponse = {
    found: boolean,
    nodeConfig?: NodeConfig
}

export const isGetNodeForUserResponse = (x: any): x is GetNodeForUserResponse => {
    return _validateObject(x, {
        found: isBoolean,
        nodeConfig: optional(isNodeConfig)
    })
}

export type GetChannelRequest = {
    type: 'getChannel'
    channelName: ChannelName
    auth: Auth
}

export const isGetChannelRequest = (x: any): x is GetChannelRequest => {
    return _validateObject(x, {
        type: isEqualTo('getChannel'),
        channelName: isChannelName,
        auth: isAuth
    })
}

export type AddNodeRequest = {
    type: 'addNode'
    node: NodeConfig
    auth: Auth
}

export const isAddNodeRequest = (x: any): x is AddNodeRequest => {
    return _validateObject(x, {
        type: isEqualTo('addNode'),
        node: isNodeConfig,
        auth: isAuth
    })
}

export type DeleteNodeRequest = {
    type: 'deleteNode'
    nodeId: NodeId
    auth: Auth
}

export const isDeleteNodeRequest = (x: any): x is DeleteNodeRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteNode'),
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type AddNodeChannelMembershipRequest = {
    type: 'addNodeChannelMembership',
    nodeId: NodeId
    channelName: ChannelName
    auth: Auth
}

export const isAddNodeChannelMembershipRequest = (x: any): x is AddNodeChannelMembershipRequest => {
    return _validateObject(x, {
        type: isEqualTo('addNodeChannelMembership'),
        nodeId: isNodeId,
        channelName: isChannelName,
        auth: isAuth
    })
}

export type AddAuthorizedNodeRequest = {
    type: 'addAuthorizedNode'
    channelName: ChannelName
    nodeId: NodeId
    auth: Auth
}

export const isAddAuthorizedNodeRequest = (x: any): x is AddAuthorizedNodeRequest => {
    return _validateObject(x, {
        type: isEqualTo('addAuthorizedNode'),
        channelName: isChannelName,
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type UpdateNodeChannelAuthorizationRequest = {
    type: 'updateNodeChannelAuthorization'
    authorization: NodeChannelAuthorization
    auth: Auth
}

export const isUpdateNodeChannelAuthorizationRequest = (x: any): x is UpdateNodeChannelAuthorizationRequest => {
    return _validateObject(x, {
        type: isEqualTo('updateNodeChannelAuthorization'),
        authorization: isNodeChannelAuthorization,
        auth: isAuth
    })
}

export type DeleteNodeChannelAuthorizationRequest = {
    type: 'deleteNodeChannelAuthorization'
    channelName: ChannelName
    nodeId: NodeId
    auth: Auth
}

export const isDeleteNodeChannelAuthorizationRequest = (x: any): x is DeleteNodeChannelAuthorizationRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteNodeChannelAuthorization'),
        channelName: isChannelName,
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type UpdateChannelPropertyRequest = {
    type: 'updateChannelProperty'
    channelName: ChannelName
    propertyName: 'bucketUri' | 'ablyApiKey' | 'googleServiceAccountCredentials'
    propertyValue: string
    auth: Auth
}

export const isUpdateChannelPropertyRequest = (x: any): x is UpdateChannelPropertyRequest => {
    return _validateObject(x, {
        type: isEqualTo('updateChannelProperty'),
        channelName: isChannelName,
        propertyName: isOneOf(['bucketUri', 'ablyApiKey', 'googleServiceAccountCredentials'].map(x => isEqualTo(x))),
        propertyValue: isString,
        auth: isAuth
    })
}

export type UpdateNodeChannelMembershipRequest = {
    type: 'updateNodeChannelMembership'
    membership: NodeChannelMembership
    auth: Auth
}

export const isUpdateNodeChannelMembershipRequest = (x: any): x is UpdateNodeChannelMembershipRequest => {
    return _validateObject(x, {
        type: isEqualTo('updateNodeChannelMembership'),
        membership: isNodeChannelMembership,
        auth: isAuth
    })
}

export type DeleteNodeChannelMembershipRequest = {
    type: 'deleteNodeChannelMembership'
    channelName: ChannelName
    nodeId: NodeId
    auth: Auth
}

export const isDeleteNodeChannelMembershipRequest = (x: any): x is DeleteNodeChannelMembershipRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteNodeChannelMembership'),
        channelName: isChannelName,
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type NodeReportRequestBody = {
    nodeId: NodeId
    ownerId: UserId
    nodeLabel: NodeLabel
}

export const isNodeReportRequestBody = (x: any): x is NodeReportRequestBody => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isUserId,
        nodeLabel: isNodeLabel
    })
}

export type NodeReportRequest = {
    type: 'nodeReport'
    body: NodeReportRequestBody
    signature: Signature
}

export const isNodeReportRequest = (x: any): x is NodeReportRequest => {
    return _validateObject(x, {
        type: isEqualTo('nodeReport'),
        body: isNodeReportRequestBody,
        signature: isSignature
    })
}

export type KacheryHubRequest =
    AddAuthorizedNodeRequest |
    AddChannelRequest |
    AddNodeRequest |
    AddNodeChannelMembershipRequest |
    DeleteChannelRequest |
    DeleteNodeRequest |
    DeleteNodeChannelMembershipRequest |
    DeleteNodeChannelAuthorizationRequest |
    GetChannelRequest |
    GetChannelsForUserRequest |
    GetNodeForUserRequest | 
    GetNodesForUserRequest |
    UpdateChannelPropertyRequest |
    UpdateNodeChannelMembershipRequest |
    UpdateNodeChannelAuthorizationRequest

export const isKacheryHubRequest = (x: any): x is KacheryHubRequest => {
    return isOneOf([
        isAddAuthorizedNodeRequest,
        isAddChannelRequest,
        isAddNodeRequest,
        isAddNodeChannelMembershipRequest,
        isDeleteChannelRequest,
        isDeleteNodeRequest,
        isDeleteNodeChannelMembershipRequest,
        isDeleteNodeChannelAuthorizationRequest,
        isGetChannelRequest,
        isGetChannelsForUserRequest,
        isGetNodeForUserRequest, 
        isGetNodesForUserRequest,
        isUpdateChannelPropertyRequest,
        isUpdateNodeChannelMembershipRequest,
        isUpdateNodeChannelAuthorizationRequest
    ])(x)
}

export type RegisteredTaskFunction = {
    channelName: string
    taskFunctionId: TaskFunctionId
    taskFunctionType: TaskFunctionType
}

export const isRegisteredTaskFunction = (x: any): x is RegisteredTaskFunction => {
    return _validateObject(x, {
        channelName: isChannelName,
        taskFunctionId: isTaskFunctionId,
        taskFunctionType: isTaskFunctionType
    })
}

export type RequestedTask = {
    channelName: ChannelName
    taskId: TaskId
    taskHash: Sha1Hash
    taskFunctionId: TaskFunctionId
    kwargs: TaskKwargs
    taskFunctionType: TaskFunctionType
}

export const isRequestedTask = (x: any): x is RequestedTask => {
    return _validateObject(x, {
        channelName: isChannelName,
        taskId: isTaskId,
        taskHash: isSha1Hash,
        taskFunctionId: isTaskFunctionId,
        kwargs: isTaskKwargs,
        taskFunctionType: isTaskFunctionType
    })
}