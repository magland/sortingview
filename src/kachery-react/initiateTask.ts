import axios from "axios"
import { KacheryNode } from "kachery-js"
import { ChannelName, errorMessage, ErrorMessage, isTaskFunctionId, isTaskKwargs, nowTimestamp, scaledDurationMsec, TaskFunctionId, TaskId, TaskKwargs, TaskStatus, Timestamp, UrlString } from "kachery-js/types/kacheryTypes"
import { TaskFunctionType } from "kachery-js/types/kacheryTypes"
import { cacheBust } from "kachery-js/util"
import deserializeReturnValue from "./deserializeReturnValue"
import TaskManager from "./TaskManager"

export const taskManager = new TaskManager()

export class Task<ReturnType> {
    #taskId: TaskId
    #status: TaskStatus = 'waiting'
    #taskResultUrl: UrlString | undefined = undefined
    #errorMessage: ErrorMessage | undefined = undefined
    #result: ReturnType | undefined = undefined
    #timestampInitiated: Timestamp = nowTimestamp()
    #timestampCompleted: Timestamp | undefined = undefined
    #statusUpdateCallbacks: (() => void)[] = []
    #isCacheHit: boolean | undefined = undefined
    constructor(private args: {kacheryNode: KacheryNode, channelName: ChannelName, taskId: TaskId, functionId: TaskFunctionId, kwargs: TaskKwargs, functionType: TaskFunctionType, onStatusChanged: () => void, queryUseCache?: boolean}) {
        this.#taskId = args.taskId
        this._start()
    }
    public get functionId() {
        return this.args.functionId
    }
    public get functionType() {
        return this.args.functionType
    }
    public get timestampInitiated() {
        return this.#timestampInitiated
    }
    public get timestampCompleted() {
        return this.#timestampCompleted
    }
    public get status() {
        return this.#status
    }
    public get taskResultUrl() {
        return this.#taskResultUrl
    }
    public get errorMessage() {
        return this.#errorMessage
    }
    public get kwargs() {
        return this.args.kwargs
    }
    public get result() {
        return this.#result
    }
    public get taskId() {
        return this.#taskId
    }
    public get isCacheHit() {
        return this.#isCacheHit
    }
    onStatusUpdate(cb: () => void) {
        this.#statusUpdateCallbacks.push(cb)
    }
    _reportStatusChanged() {
        this.args.onStatusChanged()
        this.#statusUpdateCallbacks.forEach(cb => cb())
    }
    async _fetchResult() {
        const functionType = this.args.functionType
        if ((functionType === 'pure-calculation') || (functionType === 'query')) {
            let url = this.#taskResultUrl
            if (!url) return undefined
            if (functionType === 'query') {
                url = cacheBust(url)
            }
            const x = await axios.get(url.toString(), {responseType: 'json'})
            const result = x.data
            return result as any as ReturnType
        }
        else {
            return undefined
        }
    }
    async _start() {
        const { kacheryNode, channelName, functionId, kwargs, functionType, queryUseCache } = this.args
        const x = await kacheryNode.kacheryHubInterface().requestTaskFromChannel({
            channelName,
            taskId: this.#taskId,
            taskFunctionId: functionId,
            taskKwargs: kwargs,
            taskFunctionType: functionType,
            timeoutMsec: scaledDurationMsec(1000),
            queryUseCache
        })
        const {taskId, status, taskResultUrl, errorMessage, cacheHit} = x
        if (cacheHit !== undefined) {
            this.#isCacheHit = cacheHit
        }
        this.#taskId = taskId

        await this._updateStatus(status, taskResultUrl, errorMessage)
        while (!['error', 'finished'].includes(this.#status)) {
            const y = await kacheryNode.kacheryHubInterface().waitForTaskResult({
                channelName,
                taskId,
                taskResultUrl,
                timeoutMsec: scaledDurationMsec(1000 * 10),
                taskFunctionType: functionType
            })
            await this._updateStatus(y.status, taskResultUrl, y.errorMessage)
        }
    }
    async _updateStatus(status: TaskStatus, taskResultUrl: UrlString | undefined, errMsg: ErrorMessage | undefined) {
        if (status === this.#status) return
        this.#taskResultUrl = taskResultUrl
        this.#errorMessage = errMsg
        if (status === 'finished') {
            if ((this.args.functionType === 'pure-calculation') || (this.args.functionType === 'query')) {
                let result
                try {
                    result = await this._fetchResult()
                }
                catch(err) {
                    this.#errorMessage = errorMessage('Problem fetching result even though status is finished')
                    this.#status = 'error'
                    this.#timestampCompleted = nowTimestamp()
                    this._reportStatusChanged()
                    return
                }
                if (!result) {
                    this.#errorMessage = errorMessage('Result is undefined even though status is finished')
                    this.#status = 'error'
                    this.#timestampCompleted = nowTimestamp()
                    this._reportStatusChanged()
                    return
                }
                this.#result = deserializeReturnValue(result)
                this.#status = 'finished'
                this.#timestampCompleted = nowTimestamp()
                this._reportStatusChanged()
            }
            else {
                this.#status = status
                this._reportStatusChanged()
            }
        }
        else {
            this.#status = status
            this._reportStatusChanged()
        }
    }
}

const initiateTask = <ReturnType>(args: {kacheryNode: KacheryNode, channelName: ChannelName, functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, functionType: TaskFunctionType, onStatusChanged: () => void, queryUseCache?: boolean}) => {
    const { kacheryNode, channelName, functionId, kwargs, functionType, onStatusChanged, queryUseCache } = args
    if (!functionId) return undefined
    if (!isTaskFunctionId(functionId)) {
        throw Error(`Invalid task function ID: ${functionId}`)
    }
    if (!isTaskKwargs(kwargs)) {
        console.warn(kwargs)
        throw Error(`Invalid task kwargs in ${functionId}`)
    }

    const taskId = kacheryNode.kacheryHubInterface().createTaskIdForTask({taskFunctionId: functionId, taskKwargs: kwargs, taskFunctionType: functionType})
    const existingTask = taskManager.getTask(taskId)
    if (existingTask) {
        existingTask.onStatusUpdate(onStatusChanged)
        return existingTask
    }

    const task = new Task<ReturnType>({kacheryNode, taskId, channelName, functionId, kwargs, functionType, onStatusChanged, queryUseCache})
    taskManager.addTask(task)
    return task
}

export default initiateTask