import { FigureObject, FigurlPlugin, isFigureObject } from 'figurl/types';
import { isJSONObject, JSONObject, Sha1Hash } from 'kachery-js/types/kacheryTypes';
import { useChannel, usePureCalculationTask } from 'kachery-react';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import React, { FunctionComponent } from 'react';

type Props = {
    plugins: FigurlPlugin[]
    width: number
    height: number
    packageName: string
    figureObjectOrHash?: JSONObject | Sha1Hash
}

const useFigureObject = (packageName: string, plugins: FigurlPlugin[], figureObjectOrHash?: JSONObject | Sha1Hash) => {
    const {channelName} = useChannel()
    let {returnValue: object, task} = usePureCalculationTask<FigureObject>(
        figureObjectOrHash && (typeof(figureObjectOrHash) === 'string') ? `${packageName}.get_figure_object.1` : undefined,
        {figure_object_hash: figureObjectOrHash},
        {channelName}
    )
    if (!figureObjectOrHash) {
        return {error: 'No figure object'}
    }
    if (isJSONObject(figureObjectOrHash)) {
        if (isFigureObject(figureObjectOrHash)) {
            object = figureObjectOrHash
        }
        else {
            return {error: `Invalid figure object: ${JSON.stringify(figureObjectOrHash)}`}
        }
    }
    if (object !== undefined) {
        const o = object
        const p = plugins.filter(x => (x.type === o.type))[0]
        if (!p) {
            return {error: `Figure plugin not found: ${o.type}`}
        }
        if (!p.validateData(o.data)) {
            return {error: `Problem validating figure data for figure of type: ${o.type}`}
        }
        return {
            plugin: p,
            figureData: o.data,
            task
        }
    }
    return {task}
}

const Figure: FunctionComponent<Props> = ({plugins, width, height, figureObjectOrHash, packageName}) => {
    const {plugin, figureData, task, error} = useFigureObject(packageName, plugins, figureObjectOrHash)

    if (error) {
        return <div><pre>{error}</pre></div>
    }
    if (!figureData) {
        return <TaskStatusView task={task} label="Loading figure object" />
    }
    if (!plugin) {
        // will never happen, but we need it for typescript to be happy
        return <TaskStatusView task={task} label="Loading figure plugin" />
    }

    return (
        <plugin.component
            data={figureData}
            width={width}
            height={height}
        />
    )
}

export default Figure