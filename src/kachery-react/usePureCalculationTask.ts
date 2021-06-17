import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes";
import useTask from "./useTask";

const useQueryTask = <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | {[key: string]: any}, opts: {channelName?: ChannelName}) => {
    return useTask<ReturnType>(functionId, kwargs, 'pure-calculation', {channelName: opts.channelName})
}

export default useQueryTask