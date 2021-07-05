import { KacheryNode } from "kachery-js"
import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes"
import runTaskAsync from "./runTaskAsync"

const runPureCalculationTaskAsync = async <ReturnType>(kacheryNode: KacheryNode, functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, opts: { channelName: ChannelName }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(kacheryNode, functionId, kwargs, 'pure-calculation', opts)
}

export default runPureCalculationTaskAsync