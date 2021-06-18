import { KacheryNode } from "kachery-js"
import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes"
import initiateTask from "./initiateTask"

export const runPureCalculationTaskAsync = async <ReturnType>(kacheryNode: KacheryNode, functionId: TaskFunctionId | string, kwargs: TaskKwargs | {[key: string]: any}, opts: {channelName: ChannelName}): Promise<ReturnType> => {
    return new Promise((resolve, reject) => {
      const task = initiateTask<ReturnType>({
        kacheryNode,
        channelName: opts.channelName,
        functionId,
        kwargs,
        functionType: 'pure-calculation',
        onStatusChanged: () => {
          check()
        }
      })
      if (!task) {
        reject('Unable to create get_timeseries_segment task')
        return
      }
      const check = () => {
        if (task.status === 'finished') {
          const result = task.result
          if (result) resolve(result)
          else reject(new Error('No result even though status is finished'))
        }
        else if (task.status === 'error') {
          reject(task.errorMessage)
        }
      }
      check()
    })
  }
  