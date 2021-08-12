import { useChannel, usePureCalculationTask } from 'figurl/kachery-react';
import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView';
import { RecentFiguresAction } from 'figurl/RecentFigures';
import { FigureObject, isFigureObject } from 'figurl/types';
import useFigurlPlugins from 'figurl/useFigurlPlugins';
import useSyncHive from 'figurl/useSyncHive';
import { JSONObject, Sha1Hash } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

type Props = {
    width: number
    height: number
    packageName: string
    figureObjectOrHash?: JSONObject | Sha1Hash
    recentFiguresDispatch?: (a: RecentFiguresAction) => void
}

const useFigureObjectHelper = (packageName: string, figureObjectOrHash?: JSONObject | Sha1Hash) => {
    const {channelName} = useChannel()
    let {returnValue: object, task} = usePureCalculationTask<FigureObject>(
        figureObjectOrHash && (typeof(figureObjectOrHash) === 'string') ? `${packageName}.get_figure_object.1` : undefined,
        {figure_object_hash: figureObjectOrHash},
        {channelName}
    )
    if (!figureObjectOrHash) {
        return {task, object: undefined, error: 'No figure object'}
    }
    if (typeof(figureObjectOrHash) === 'object') {
        if (isFigureObject(figureObjectOrHash)) {
            object = figureObjectOrHash
        }
        else {
            return {task, object: undefined, error: `Invalid figure object: ${JSON.stringify(figureObjectOrHash)}`}
        }
    }
    return {task, object, error: undefined}
}

const useFigureObject = (packageName: string, figureObjectOrHash?: JSONObject | Sha1Hash) => {
    const {task, object, error} = useFigureObjectHelper(packageName, figureObjectOrHash)
    const syncHive = useSyncHive()
    const figureData = useMemo(() => {
        if (!object) return undefined
        return syncHive(object.data)
    }, [object, syncHive])
    const plugins = useFigurlPlugins()

    if (error) return {error}
    if (object !== undefined) {
        const o = object
        const p = plugins.filter(x => (x.type === o.type))[0]
        if (!p) {
            return {error: `Figure plugin not found: ${o.type}`}
        }
        if (!p.validateData(figureData)) {
            console.warn(figureData)
            return {error: `Problem validating figure data for figure of type: ${o.type}`}
        }
        return {
            plugin: p,
            figureData,
            task
        }
    }
    return {task}
}

const Figure: FunctionComponent<Props> = ({width, height, figureObjectOrHash, packageName, recentFiguresDispatch}) => {
    const {plugin, figureData, task, error} = useFigureObject(packageName, figureObjectOrHash)
    const {channelName} = useChannel()
    const location = useLocation()

    useEffect(() => {
        if (!plugin) return
        if (!figureData) return
        recentFiguresDispatch && recentFiguresDispatch({type: 'add', recentFigure: {
            channel: channelName,
            type: plugin.type,
            data: figureData,
            location: {
                pathname: location.pathname,
                search: location.search
            }
        }})
    }, [channelName, plugin, figureData, recentFiguresDispatch, location])

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