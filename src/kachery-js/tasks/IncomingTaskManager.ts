import { sleepMsec } from "../util";
import { RegisteredTaskFunction, RequestedTask } from "../types/kacheryHubTypes";
import { ChannelName, DurationMsec, durationMsecToNumber, elapsedSince, nowTimestamp, TaskFunctionId, TaskFunctionType, TaskId, TaskKwargs, Timestamp, unscaledDurationMsec } from "../types/kacheryTypes";
import computeTaskHash from "../util/computeTaskHash";
import GarbageMap from "../util/GarbageMap";
import randomAlphaString from "../util/randomAlphaString";

type RegisteredTaskFunctionGroup = {
    taskFunctions: RegisteredTaskFunction[]
    incomingRequestedTasksCallback?: (incomingRequestedTasks: RequestedTask[]) => void
    internalRequestedTaskList: RequestedTask[]
}

type PendingTaskRequest = {
    requestedTask: RequestedTask
    timestamp: Timestamp
}

export type ProbeTaskFunctionsResult = {
    registeredTaskFunctions: RegisteredTaskFunction[]
}

export default class IncomingTaskManager {
    #registeredTaskFunctionGroups = new GarbageMap<string, RegisteredTaskFunctionGroup>(null)
    #pendingTaskRequests: PendingTaskRequest[] = []
    #processScheduled = false
    async registerTaskFunctions(args: {taskFunctions: RegisteredTaskFunction[], timeoutMsec: DurationMsec}): Promise<RequestedTask[]> {
        const {taskFunctions, timeoutMsec} = args
        return new Promise<RequestedTask[]>((resolve, reject) => {
            let complete = false
            const key = randomAlphaString(10)
            const _return = (retval: RequestedTask[]) => {
                if (complete) return
                complete = true
                this.#registeredTaskFunctionGroups.delete(key)
                resolve(retval)
            }
            const tfg: RegisteredTaskFunctionGroup = {
                taskFunctions,
                incomingRequestedTasksCallback: (incomingRequestedTasks) => {
                    if (complete) throw Error('Unexpected complete')
                    _return(incomingRequestedTasks)
                },
                internalRequestedTaskList: []
            }
            this.#registeredTaskFunctionGroups.set(key, tfg)
            this._processPendingTaskRequests()
            setTimeout(() => {
                if (!complete) {
                    _return([])
                }
            }, durationMsecToNumber(timeoutMsec))
        })
    }
    requestTask(args: {channelName: ChannelName, taskId: TaskId, taskFunctionId: TaskFunctionId, taskKwargs: TaskKwargs, taskFunctionType: TaskFunctionType}) {
        const {channelName, taskId, taskFunctionId, taskKwargs, taskFunctionType} = args
        const taskHash = computeTaskHash(taskFunctionId, taskKwargs)
        this.#pendingTaskRequests.push({
            requestedTask: {
                channelName,
                taskId,
                taskHash,
                taskFunctionId,
                kwargs: taskKwargs,
                taskFunctionType
            },
            timestamp: nowTimestamp()
        })
        this._scheduleProcessPendingTaskRequests()
    }
    async probeTaskFunctions(args: {channelName: ChannelName, taskFunctionIds: TaskFunctionId[]}): Promise<ProbeTaskFunctionsResult> {
        const {channelName, taskFunctionIds} = args
        const foundIds = new Set<TaskFunctionId>()
        const ret: ProbeTaskFunctionsResult = {registeredTaskFunctions: []}
        for (let pass = 1; pass <= 2; pass++) {
            for (let id of taskFunctionIds) {
                if (!foundIds.has(id)) {
                    const g = this._findRegisteredTaskFunctionGroupForTaskFunction(id, channelName)
                    if (g) {
                        const x = g.taskFunctions.filter(a => ((a.taskFunctionId === id) && (a.channelName === channelName)))[0]
                        if (!x) throw Error('Unexpected, unable to find task function in probeTaskFunctions')
                        foundIds.add(id)
                        ret.registeredTaskFunctions.push({
                            channelName,
                            taskFunctionId: id,
                            taskFunctionType: x.taskFunctionType
                        })
                    }
                }
            }
            if (pass === 1) {
                if (ret.registeredTaskFunctions.length === taskFunctionIds.length) {
                    // already found all of them
                    break
                }
                // otherwise, wait a bit and give the task functions a chance to get registered
                await sleepMsec(unscaledDurationMsec(500))
            }
        }
        return ret
    }
    _scheduleProcessPendingTaskRequests() {
        if (this.#processScheduled) return
        this.#processScheduled = true
        setTimeout(() => {
            this.#processScheduled = false
            this._processPendingTaskRequests()
        }, 100)
    }
    _processPendingTaskRequests() {
        const newList: PendingTaskRequest[] = []
        for (let x of this.#pendingTaskRequests) {
            let remove = false
            const elapsed = elapsedSince(x.timestamp)
            if (elapsed < 1000 * 4) {
                const g = this._findRegisteredTaskFunctionGroupForTaskFunction(x.requestedTask.taskFunctionId, x.requestedTask.channelName)
                if (g) {
                    g.internalRequestedTaskList.push(x.requestedTask)
                    remove = true
                }
            }
            else remove = true
            if (!remove) newList.push(x)
        }
        this.#pendingTaskRequests = newList

        for (let k of this.#registeredTaskFunctionGroups.keys()) {
            const g = this.#registeredTaskFunctionGroups.get(k)
            if (!g) throw Error('Unexpected')
            if (g.internalRequestedTaskList.length > 0) {
                g.incomingRequestedTasksCallback && g.incomingRequestedTasksCallback(g.internalRequestedTaskList)
                g.internalRequestedTaskList = []
            }
        }
    }
    _findRegisteredTaskFunctionGroupForTaskFunction(taskFunctionId: TaskFunctionId, channelName: ChannelName) {
        for (let k of this.#registeredTaskFunctionGroups.keys()) {
            const g = this.#registeredTaskFunctionGroups.get(k)
            if (!g) throw Error('Unexpected')
            for (let f of g.taskFunctions) {
                if ((f.taskFunctionId === taskFunctionId) && (f.channelName === channelName)) {
                    return g
                }
            }
        }
        return null
    }
}
