import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes";
import useTask from "./useTask";

const useQueryTask = <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | {[key: string]: any}, opts: {channelName: ChannelName, useCache?: boolean}) => {
    return useTask<ReturnType>(functionId, kwargs, 'query', {queryUseCache: opts.useCache ? true : false, channelName: opts.channelName})
}

export default useQueryTask