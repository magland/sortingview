import { FigurlPlugin } from "figurl/types";
import { isString, _validateObject } from "kachery-js/types/kacheryTypes";
import WorkspaceView from 'python/sortingview/gui/extensions/workspaceview/WorkspaceView';
import { WorkspaceRoute } from 'python/sortingview/gui/pluginInterface';
import { WorkspaceRouteAction, workspaceRouteReducer } from "python/sortingview/gui/pluginInterface/WorkspaceRoute";
import { useSortingViewWorkspace } from 'python/sortingview/gui/WorkspacePage/WorkspacePage';
import QueryString from 'querystring';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from "react-router-dom";


type WorkspaceData = {
    workspaceUri: string,
}
const isWorkspaceData = (x: any): x is WorkspaceData => {
    return _validateObject(x, {
        workspaceUri: isString
    })
}

type Props = {
    data: WorkspaceData
    width: number
    height: number
}

const workspaceNavigationHeight = 10
const horizontalPadding = 20
const paddingTop = 5
const divStyle: React.CSSProperties = {
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    paddingTop: paddingTop
}

const useWorkspaceRoute2 = (workspaceUri: string) => {
    const location = useLocation()
    const history = useHistory()
    const [workspaceRoute, setWorkspaceRoute] = useState<WorkspaceRoute>({page: 'workspace'})
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location])
    const workspaceRouteString = (query['workspaceRoute'] || '') as string
    useEffect(() => {
        let r: WorkspaceRoute
        if (workspaceRouteString) {
            try {
                r = JSON.parse(decodeURIComponent(workspaceRouteString))
            }
            catch(err) {
                console.warn('Error parsing workspace route', workspaceRouteString)
                r = {page: 'workspace'}
            }
        }
        else {
            r = {page: 'workspace'}
        }
        setWorkspaceRoute(r)
    }, [workspaceRouteString])
    const workspaceRouteDispatch = useCallback((action: WorkspaceRouteAction) => {
        const newState = workspaceRouteReducer(workspaceRoute, action)
        const a = encodeURIComponent(JSON.stringify(newState))
        const query2 = {...query}
        query2['workspaceRoute'] = a
        const search2 = queryString(query2)
        history.push({...location, search: search2})
    }, [workspaceRoute, history, location, query])
    
    return useMemo(() => ({workspaceRoute, workspaceRouteDispatch}), [workspaceRoute, workspaceRouteDispatch])
}

const WorkspaceComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {workspaceUri} = data

    const {workspace, workspaceDispatch} = useSortingViewWorkspace(workspaceUri)
    const {workspaceRoute, workspaceRouteDispatch} = useWorkspaceRoute2(workspaceUri)

    return (
        <div className="WorkspacePage" style={divStyle}>
            <WorkspaceView
                workspace={workspace}
                workspaceDispatch={workspaceDispatch}
                workspaceRoute={workspaceRoute}
                workspaceRouteDispatch={workspaceRouteDispatch}
                width={width - horizontalPadding * 2}
                height={height - workspaceNavigationHeight - paddingTop}
            />
        </div>
    )
}

const queryString = (params: { [key: string]: string | string[] }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            const v = params[key]
            if (typeof(v) === 'string') {
                return encodeURIComponent(key) + '=' + v
            }
            else {
                return v.map(a => (encodeURIComponent(key) + '=' + a)).join('&')
            }
        }).join('&')
    )
}

const getLabel = (x: WorkspaceData) => {
    return `Workspace ${x.workspaceUri.slice(0, 20)}...`
}

const WorkspacePlugin: FigurlPlugin = {
    type: 'sortingview.workspace.1',
    validateData: isWorkspaceData,
    component: WorkspaceComponent,
    getLabel
}

export default WorkspacePlugin