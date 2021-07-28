import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes";
import useTask from "./useTask";

const useQueryTask = <ReturnType>(functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, opts: {channelName: ChannelName, useCache?: boolean, fallbackToCache?: boolean}) => {
    return useTask<ReturnType>(functionId, kwargs, 'query', {queryUseCache: opts.useCache ? true : false, queryFallbackToCache: opts.fallbackToCache ? true : false, channelName: opts.channelName})
}

export default useQueryTask