import React, { useCallback, useMemo } from 'react'
import { FunctionComponent } from "react"
import { useSubfeed, useTask } from '../python/sortingview/gui/labbox'
import { FeedId, isArrayOf, isFeedId, isString, sha1OfString, SubfeedHash, _validateObject } from '../python/sortingview/gui/labbox/kacheryTypes'
import ExampleWorkspacesTable from './ExampleWorkspacesTable'

type Props = {
    onWorkspaceSelected: (workspaceUri: string) => void
}

export type ExampleWorkspaceType = {
    workspaceUri: string
    workspaceLabel: string
}
const isExampleWorkspaceType = (x: any): x is ExampleWorkspaceType => {
    return _validateObject(x, {
        workspaceUri: isString,
        workspaceLabel: isString
    }, {allowAdditionalFields: true})
}

const isExampleWorkspaceTypeArray = (x: any): x is ExampleWorkspaceType[] => {
    return isArrayOf(isExampleWorkspaceType)(x)
}

const parseSubfeedUri = (subfeedUri: string | undefined): {feedId: FeedId | undefined, subfeedHash: SubfeedHash | undefined} => {
    const undefinedResult = {feedId: undefined, subfeedHash: undefined}
    if (!subfeedUri) return undefinedResult
    if (!subfeedUri.startsWith('feed://')) {
        return undefinedResult
    }
    const a = subfeedUri.split('/')
    const feedId = a[2] || undefined
    const subfeedPart = a[3] || undefined
    if ((!feedId) || (!subfeedPart)) return undefinedResult
    if (!isFeedId(feedId)) return undefinedResult
    const subfeedHash = (subfeedPart.startsWith('~') ? subfeedPart.slice(1) : sha1OfString(subfeedPart)) as any as SubfeedHash
    return {
        feedId,
        subfeedHash
    }
}

const WorkspaceList: FunctionComponent<Props> = ({onWorkspaceSelected}) => {
    const {returnValue: workspaceListSubfeedUri, task} = useTask<string>('workspace_list_subfeed.1', {cachebust: '1'})
    const {feedId, subfeedHash} = parseSubfeedUri(workspaceListSubfeedUri)
    const {messages} = useSubfeed({feedId, subfeedHash})
    const examples = useMemo(() => {
        if ((messages) && (messages.length > 0)) {
            const e = messages[messages.length - 1]
            if (isExampleWorkspaceTypeArray(e)) return e
            else return undefined
        }
        else return undefined
    }, [messages])
    
    const handleExampleSelected = useCallback((ex: ExampleWorkspaceType) => {
        onWorkspaceSelected(ex.workspaceUri)
    }, [onWorkspaceSelected])
    return (
        <div>
            {
                examples ? (
                    <ExampleWorkspacesTable
                        examples={examples}
                        onExampleSelected={handleExampleSelected}
                    />
                ) : task?.status === 'error' ? (
                    <span>Error: {task.errorMessage}</span>
                ) :
                (
                    <span>Loading examples</span>
                )
            }
        </div>
    )
}

export default WorkspaceList