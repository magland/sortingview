import { isRegisteredTaskFunction, RegisteredTaskFunction } from "./kacheryHubTypes";
import { ErrorMessage, FeedId, FileKey, isArrayOf, isEqualTo, isErrorMessage, isFeedId, isFileKey, isMessageCount, isNodeId, isOneOf, isSignature, isSubfeedHash, isSubfeedPosition, isTaskFunctionId, isTaskFunctionType, isTaskId, isTaskKwargs, isTaskStatus, MessageCount, NodeId, optional, Signature, SubfeedHash, SubfeedPosition, TaskFunctionId, TaskFunctionType, TaskId, TaskKwargs, TaskStatus, _validateObject } from "./kacheryTypes";

export type RequestFileMessageBody = {
    type: 'requestFile',
    fileKey: FileKey
}

export const isRequestFileMessageBody = (x: any): x is RequestFileMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('requestFile'),
        fileKey: isFileKey
    })
}

export type UploadFileStatusMessageBody = {
    type: 'uploadFileStatus',
    fileKey: FileKey,
    status: 'started' | 'finished'
}

export const isUploadFileStatusMessageBody = (x: any): x is UploadFileStatusMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('uploadFileStatus'),
        fileKey: isFileKey,
        status: isOneOf(['started', 'finished'].map(s => isEqualTo(s)))
    })
}

export type UpdateSubfeedMessageCountMessageBody = {
    type: 'updateSubfeedMessageCount',
    feedId: FeedId,
    subfeedHash: SubfeedHash,
    messageCount: MessageCount
}

export const isUpdateSubfeedMessageCountMessageBody = (x: any): x is UpdateSubfeedMessageCountMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('updateSubfeedMessageCount'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        messageCount: isMessageCount
    })
}

export type RequestSubfeedMessageBody = {
    type: 'requestSubfeed',
    feedId: FeedId,
    subfeedHash: SubfeedHash,
    position: SubfeedPosition
}

export const isRequestSubfeedMessageBody = (x: any): x is RequestSubfeedMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('requestSubfeed'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        position: isSubfeedPosition
    })
}

export type UpdateTaskStatusMessageBody = {
    type: 'updateTaskStatus',
    taskId: TaskId,
    status: TaskStatus,
    errorMessage?: ErrorMessage
}

export const isUpdateTaskStatusMessageBody = (x: any): x is UpdateTaskStatusMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('updateTaskStatus'),
        taskId: isTaskId,
        status: isTaskStatus,
        errorMessage: optional(isErrorMessage)
    })
}

export type RequestTaskMessageBody = {
    type: 'requestTask',
    taskId: TaskId,
    taskFunctionId: TaskFunctionId,
    taskFunctionType: TaskFunctionType,
    taskKwargs: TaskKwargs
}

export const isRequestTaskMessageBody = (x: any): x is RequestTaskMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('requestTask'),
        taskId: isTaskId,
        taskFunctionId: isTaskFunctionId,
        taskFunctionType: isTaskFunctionType,
        taskKwargs: isTaskKwargs
    })
}

export type ProbeTaskFunctionsBody = {
    type: 'probeTaskFunctions',
    taskFunctionIds: TaskFunctionId[]
}

export const isProbeTaskFunctionsBody = (x: any): x is ProbeTaskFunctionsBody => {
    return _validateObject(x, {
        type: isEqualTo('probeTaskFunctions'),
        taskFunctionIds: isArrayOf(isTaskFunctionId)
    })
}

export type ReportRegisteredTaskFunctionsBody = {
    type: 'reportRegisteredTaskFunctions',
    registeredTaskFunctions: RegisteredTaskFunction[]
}

export const isReportRegisteredTaskFunctionsBody = (x: any): x is ReportRegisteredTaskFunctionsBody => {
    return _validateObject(x, {
        type: isEqualTo('reportRegisteredTaskFunctions'),
        registeredTaskFunctions: isArrayOf(isRegisteredTaskFunction)
    })
}

export type KacheryHubPubsubMessageBody = RequestFileMessageBody | UploadFileStatusMessageBody | UpdateSubfeedMessageCountMessageBody | RequestSubfeedMessageBody | UpdateTaskStatusMessageBody | RequestTaskMessageBody | ProbeTaskFunctionsBody | ReportRegisteredTaskFunctionsBody

export const isKacheryHubPubsubMessageBody = (x: any): x is KacheryHubPubsubMessageBody => {
    return isOneOf([
        isRequestFileMessageBody,
        isUploadFileStatusMessageBody,
        isUpdateSubfeedMessageCountMessageBody,
        isRequestSubfeedMessageBody,
        isUpdateTaskStatusMessageBody,
        isRequestTaskMessageBody,
        isProbeTaskFunctionsBody,
        isReportRegisteredTaskFunctionsBody
    ])(x)
}

export type KacheryHubPubsubMessageData = {
    body: KacheryHubPubsubMessageBody,
    fromNodeId: NodeId,
    signature: Signature
}

export const isKacheryHubPubsubMessageData = (x: any): x is KacheryHubPubsubMessageData => {
    return _validateObject(x, {
        body: isKacheryHubPubsubMessageBody,
        fromNodeId: isNodeId,
        signature: isSignature
    })
}
