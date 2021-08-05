import { ChannelName, TaskFunctionId, TaskKwargs } from "kachery-js/types/kacheryTypes";
import useTask from "./useTask";

const usePureCalculationTask = <ReturnType>(functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, opts: {channelName?: ChannelName}) => {
    return useTask<ReturnType>(functionId, kwargs, 'pure-calculation', {channelName: opts.channelName})
}

export default usePureCalculationTask