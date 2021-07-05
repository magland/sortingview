import { KacheryNode } from "kachery-js"
import { ChannelName, TaskFunctionId, TaskFunctionType, TaskKwargs } from "kachery-js/types/kacheryTypes"
import initiateTask from "./initiateTask"

const runTaskAsync = async <ReturnType>(kacheryNode: KacheryNode, functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, functionType: TaskFunctionType, opts: { channelName: ChannelName, queryUseCache?: boolean }): Promise<ReturnType> => {
  return new Promise((resolve, reject) => {
    const task = initiateTask<ReturnType>({
      kacheryNode,
      channelName: opts.channelName,
      functionId,
      kwargs,
      functionType,
      onStatusChanged: () => {
        check()
      },
      queryUseCache: opts.queryUseCache
    })
    if (!task) {
      reject('Unable to create get_timeseries_segment task')
      return
    }
    const check = () => {
      if (task.status === 'finished') {
        const result = task.result
        if (functionType === 'action') {
          resolve(undefined as any as ReturnType) // sort of a type hack
        }
        else {
          if (result) resolve(result)
          else {
            if (functionType)
            reject(new Error('No result even though status is finished'))
          }
        }
      }
      else if (task.status === 'error') {
        reject(task.errorMessage)
      }
    }
    check()
  })
}

export default runTaskAsync