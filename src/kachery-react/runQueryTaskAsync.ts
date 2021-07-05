import { KacheryNode } from "kachery-js"
import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes"
import runTaskAsync from "./runTaskAsync"

const runQueryTaskAsync = async <ReturnType>(kacheryNode: KacheryNode, functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, opts: { channelName: ChannelName, useCache: boolean }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(kacheryNode, functionId, kwargs, 'query', {channelName: opts.channelName, queryUseCache: opts.useCache})
}

export default runQueryTaskAsync