import { RegisteredTaskFunction } from "kachery-js/types/kacheryHubTypes";
import { ChannelName, ErrorMessage, nowTimestamp, TaskFunctionId, TaskId, TaskStatus, Timestamp } from "../types/kacheryTypes";
import GarbageMap from "../util/GarbageMap";
import randomAlphaString from "../util/randomAlphaString";

// type ListenerCallback = (status: TaskStatus, errMsg: ErrorMessage | undefined) => void

interface TaskCode extends String {
    __taskCode__: never // phantom type
}
const createTaskCode = (channelName: ChannelName, taskId: TaskId) => {
    return `${channelName}:${taskId}` as any as TaskCode
}

interface TaskFunctionCode extends String {
    __taskFunctionCode__: never // phantom type
}
const createTaskFunctionCode = (channelName: ChannelName, taskFunctionId: TaskFunctionId) => {
    return `${channelName}:${taskFunctionId}` as any as TaskFunctionCode
}

type OutgoingTask = {
    channelName: ChannelName
    taskId: TaskId
    status: TaskStatus
    errorMessage?: ErrorMessage
    listenForStatusUpdates: (callback: () => void) => {cancelListener: () => void}
    _callbacks: {[key: string]: () => void}
}

type RegisteredTaskFunctionRecord = {
    registeredTaskFunction: RegisteredTaskFunction
    timestamp: Timestamp
}

export default class OutgoingTaskManager {
    #outgoingTasksByCode = new GarbageMap<TaskCode, OutgoingTask>(null)
    #registeredTaskFunctions = new GarbageMap<TaskFunctionCode, RegisteredTaskFunctionRecord>(null)
    #registeredTaskFunctionsChangedCallbacks: {[key: string]: () => void} = {}
    createOutgoingTask(channelName: ChannelName, taskId: TaskId) {
        const code = createTaskCode(channelName, taskId)
        if (!this.#outgoingTasksByCode.has(code)) {
            const _callbacks: {[key: string]: () => void} = {}
            const t: OutgoingTask = {
                channelName,
                taskId,
                status: 'waiting',
                listenForStatusUpdates: (callback: () => void) => {
                    const key = randomAlphaString(10)
                    _callbacks[key] = callback
                    return {cancelListener: () => {
                        if (_callbacks[key]) delete _callbacks[key]
                    }}
                },
                _callbacks
            }
            this.#outgoingTasksByCode.set(code, t)
        }
        const t = this.outgoingTask(channelName, taskId)
        if (!t) throw Error('Unexpected')
        return t
    }
    outgoingTask(channelName: ChannelName, taskId: TaskId) {
        const code = createTaskCode(channelName, taskId)
        return this.#outgoingTasksByCode.get(code)
    }
    updateTaskStatus(args: {channelName: ChannelName, taskId: TaskId, status: TaskStatus, errMsg: ErrorMessage | undefined}) {
        const {channelName, taskId, status, errMsg} = args
        const code = createTaskCode(channelName, taskId)
        const a = this.#outgoingTasksByCode.get(code)
        if (!a) return
        if (a.status !== status) {
            a.status = status
            a.errorMessage = errMsg
            for (let k in a._callbacks) {
                a._callbacks[k]()
            }
        }
    }
    reportRegisteredTaskFunctions(channelName: ChannelName, registeredTaskFunctions: RegisteredTaskFunction[]) {
        let somethingChanged = false
        for (let x of registeredTaskFunctions) {
            if (x.channelName === channelName) {
                const code = createTaskFunctionCode(x.channelName, x.taskFunctionId)
                if (!this.#registeredTaskFunctions.has(code)) somethingChanged = true
                this.#registeredTaskFunctions.set(code, {
                    registeredTaskFunction: x,
                    timestamp: nowTimestamp()
                })
            }
            else {
                console.warn('Mismatch in channelName in reportRegisteredTaskFunctions')
            }
        }
        if (somethingChanged) {
            for (let k in this.#registeredTaskFunctionsChangedCallbacks) {
                this.#registeredTaskFunctionsChangedCallbacks[k]()
            }
        }
    }
    getRegisteredTaskFunction(channelName: ChannelName, taskFunctionId: TaskFunctionId): RegisteredTaskFunctionRecord | undefined {
        const code = createTaskFunctionCode(channelName, taskFunctionId)
        const a = this.#registeredTaskFunctions.get(code)
        if (a) return a
        else return undefined
    }
    clearRegisteredTaskFunctions() {
        this.#registeredTaskFunctions.clear()
    }
    onRegisteredTaskFunctionsChanged(cb: () => void): {cancel: () => void} {
        const key = randomAlphaString(10)
        this.#registeredTaskFunctionsChangedCallbacks[key] = cb
        return {
            cancel: () => {
                delete this.#registeredTaskFunctionsChangedCallbacks[key]
            }
        }
    }
}
