import { ChannelName, isFeedId } from 'kachery-js/types/kacheryTypes'
import { parseWorkspaceUri } from 'labbox-react'
import QueryString from 'querystring'

type Page = 'workspace' | 'recording' | 'sorting'
export const isWorkspacePage = (x: string): x is Page => {
    return ['workspace', 'recording', 'sorting'].includes(x)
}

type WorkspaceRecordingsRoute = {
    page: 'workspace',
    workspaceUri?: string,
    channelName?: ChannelName
}
type WorspaceRecordingRoute = {
    page: 'recording',
    recordingId: string,
    workspaceUri?: string
    channelName?: ChannelName
}
type WorspaceSortingRoute = {
    page: 'sorting',
    recordingId: string,
    sortingId: string,
    workspaceUri?: string
    channelName?: ChannelName
}
export type WorkspaceRoute = WorkspaceRecordingsRoute | WorspaceRecordingRoute | WorspaceSortingRoute
type GotoWorkspacePageAction = {
    type: 'gotoWorkspacePage'
}
type GotoRecordingPageAction = {
    type: 'gotoRecordingPage',
    recordingId: string
}
type GotoSortingPageAction = {
    type: 'gotoSortingPage',
    recordingId: string,
    sortingId: string
}
export type WorkspaceRouteAction = GotoWorkspacePageAction | GotoRecordingPageAction | GotoSortingPageAction
export type WorkspaceRouteDispatch = (a: WorkspaceRouteAction) => void

export interface LocationInterface {
    pathname: string
    search: string
}

export interface HistoryInterface {
    location: LocationInterface
    push: (x: LocationInterface) => void
}

export const routeFromLocation = (location: LocationInterface): WorkspaceRoute => {
    const pathList = location.pathname.split('/')

    const query = QueryString.parse(location.search.slice(1));
    const workspace = (query.workspace as string) || ''
    let workspaceUri: string | undefined = undefined
    if (workspace.startsWith('workspace://')) {
        workspaceUri = workspace
    }
    else if (isFeedId(workspace)) {
        workspaceUri = `workspace://${workspace}`
    }
    const channelName = ((query.channel as string) || undefined) as ChannelName | undefined

    let page = pathList[2] || 'workspace'
    if (page === 'recordings') page = 'workspace'
    if (!isWorkspacePage(page)) throw Error(`Invalid page: ${page}`)
    switch (page) {
        case 'workspace': return {
            workspaceUri,
            channelName,
            page
        }
        case 'recording': return {
            workspaceUri,
            channelName,
            page,
            recordingId: pathList[3]
        }
        case 'sorting': return {
            workspaceUri,
            channelName,
            page,
            recordingId: pathList[3] || '',
            sortingId: pathList[4] || ''
        }
        default: return {
            workspaceUri,
            channelName,
            page: 'workspace'
        }
    }
}

export const locationFromRoute = (route: WorkspaceRoute) => {
    const queryParams: { [key: string]: string } = {}
    if (route.workspaceUri) {
        const {feedId: workspaceFeedId} = parseWorkspaceUri(route.workspaceUri)
        if (workspaceFeedId) {
            queryParams['workspace'] = workspaceFeedId.toString()
        }
    }
    if (route.channelName) {
        queryParams['channel'] = route.channelName.toString()
    }
    switch (route.page) {
        case 'workspace': return {
            pathname: `/workspace`,
            search: queryString(queryParams)
        }
        case 'recording': return {
            pathname: `/workspace/recording/${route.recordingId}`,
            search: queryString(queryParams)
        }
        case 'sorting': return {
            pathname: `/workspace/sorting/${route.recordingId}/${route.sortingId}`,
            search: queryString(queryParams)
        }
    }
}

var queryString = (params: { [key: string]: string }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&')
    )
}

export const workspaceRouteReducer = (s: WorkspaceRoute, a: WorkspaceRouteAction): WorkspaceRoute => {
    let newRoute: WorkspaceRoute = s
    switch (a.type) {
        case 'gotoWorkspacePage': newRoute = {
            page: 'workspace',
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
        case 'gotoRecordingPage': newRoute = {
            page: 'recording',
            recordingId: a.recordingId,
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
        case 'gotoSortingPage': newRoute = {
            page: 'sorting',
            recordingId: a.recordingId,
            sortingId: a.sortingId,
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break
    }
    return newRoute
}