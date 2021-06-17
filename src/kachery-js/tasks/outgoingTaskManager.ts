import { ChannelName, ErrorMessage, TaskId, TaskStatus } from "../types/kacheryTypes";
import GarbageMap from "../util/GarbageMap";
import randomAlphaString from "../util/randomAlphaString";

// type ListenerCallback = (status: TaskStatus, errMsg: ErrorMessage | undefined) => void

interface TaskCode extends String {
    __taskCode__: never // phantom type
}
const createTaskCode = (channelName: ChannelName, taskId: TaskId) => {
    return `${channelName}:${taskId}` as any as TaskCode
}

type OutgoingTask = {
    channelName: ChannelName
    taskId: TaskId
    status: TaskStatus
    errorMessage?: ErrorMessage
    listenForStatusUpdates: (callback: () => void) => {cancelListener: () => void}
    _callbacks: {[key: string]: () => void}
}

export default class OutgoingTaskManager {
    #outgoingTasksByCode = new GarbageMap<TaskCode, OutgoingTask>(null)
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
}
