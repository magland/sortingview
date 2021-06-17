import { ChannelName } from 'kachery-js/types/kacheryTypes'
import QueryString from 'querystring'

type Page = 'recordings' | 'recording' | 'sorting'
export const isWorkspacePage = (x: string): x is Page => {
    return ['recordings', 'recording', 'sorting'].includes(x)
}

type WorkspaceRecordingsRoute = {
    page: 'recordings',
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
type GotoRecordingsPageAction = {
    type: 'gotoRecordingsPage'
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
export type WorkspaceRouteAction = GotoRecordingsPageAction | GotoRecordingPageAction | GotoSortingPageAction
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
    const workspace = (query.workspace as string) || 'default'
    const workspaceUri = workspace.startsWith('workspace://') ? workspace : undefined
    const channelName = ((query.channel as string) || undefined) as ChannelName | undefined

    const page = pathList[2] || 'recordings'
    if (!isWorkspacePage(page)) throw Error(`Invalid page: ${page}`)
    switch (page) {
        case 'recordings': return {
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
            page: 'recordings'
        }
    }
}

export const locationFromRoute = (route: WorkspaceRoute) => {
    const queryParams: { [key: string]: string } = {}
    if (route.workspaceUri) {
        queryParams['workspace'] = route.workspaceUri
    }
    if (route.channelName) {
        queryParams['channel'] = route.channelName.toString()
    }
    switch (route.page) {
        case 'recordings': return {
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
        case 'gotoRecordingsPage': newRoute = {
            page: 'recordings',
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