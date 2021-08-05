import usePureCalculationTask from 'figurl/kachery-react/usePureCalculationTask';
import useChannel from 'figurl/kachery-react/useChannel'
import React, { Fragment, FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Recording, Sorting } from "../../../pluginInterface";

interface ChildProps {
    preloadStatus?: 'waiting' | 'running' | 'finished'
}

type Props = {
    sorting?: Sorting
    recording: Recording
    children: React.ReactElement<ChildProps>
    width: number
    height: number
    snippetLen?: [number, number]
}

const PreloadCheck: FunctionComponent<Props> = ({ recording, sorting, children, width, height, snippetLen }) => {
    const sortingObject = sorting ? sorting.sortingObject : undefined
    const recordingObject = recording.recordingObject
    const runningState = useRef<{sortingObject: any, recordingObject: any}>({sortingObject, recordingObject})

    const matchesRunningState = useMemo(() => ((x: {recordingObject: any, sortingObject: any}) => (
        (runningState.current.sortingObject === x.sortingObject) && (runningState.current.recordingObject === x.recordingObject)
    )), [])

    const {channelName} = useChannel()
    const {task: preloadExtractSnippetsTask} = usePureCalculationTask<string>((recordingObject && sortingObject) ? 'preload_extract_snippets.2' : undefined, {recording_object: recordingObject, sorting_object: sortingObject, snipets_len: snippetLen}, {channelName})
    const status = preloadExtractSnippetsTask?.status || 'waiting'
    const message = useMemo(() => {
        if (status === 'running') return 'Precomputing snippets'
        else if (status === 'finished') return 'Finished precomputing snippets'
        else return `Precompute snippets: ${status}`
    }, [status])

    const child = useMemo(() => {
        return React.cloneElement(
            children,
            {
                preloadStatus: status
            }
        )
    }, [children, status])

    // This is important for when the bandpass filter changes so that we don't start calculating things prior to doing the preloading (e.g. snippets extraction)
    const [lastValidChild, setLastValidChild] = useState<React.ReactElement | null>(null)    
    useEffect(() => {
        if ((status === 'finished') && (matchesRunningState({recordingObject, sortingObject}))) setLastValidChild(child)
    }, [child, status, recordingObject, sortingObject, matchesRunningState])

    if (!sortingObject) {
        return child
    }

    return (
        <Fragment>
            <BlockInteraction block={status !== 'finished'} {...{width, height}} message={status === 'error' ? `Error: ${preloadExtractSnippetsTask?.errorMessage}` : message} />
            {lastValidChild || child}
        </Fragment>
    )
}

const BlockInteraction: FunctionComponent<{width: number, height: number, block: boolean, message: string}> = ({width, height, block, message}) => {
    if (block) {
        return (
            <div className="BlockInteraction" style={{position: 'absolute', width, height, backgroundColor: 'gray', opacity: 0.5, zIndex: 99999}}>
                <div style={{backgroundColor: 'blue', color: 'white', fontSize: 20}}>{message}</div>
            </div>
        )
    }
    else {
        return <div className="BlockInteraction" />
    }
}

export default PreloadCheck
