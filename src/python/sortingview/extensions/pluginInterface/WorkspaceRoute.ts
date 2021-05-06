import { ServerInfo } from 'labbox/lib/LabboxProvider'
import QueryString from 'querystring'

type Page = 'recordings' | 'recording' | 'sorting'
export const isWorkspacePage = (x: string): x is Page => {
    return ['recordings', 'recording', 'sorting'].includes(x)
}

type WorkspaceRecordingsRoute = {
    page: 'recordings',
    workspaceUri?: string
}
type WorspaceRecordingRoute = {
    page: 'recording',
    recordingId: string,
    workspaceUri?: string
}
type WorspaceSortingRoute = {
    page: 'sorting',
    recordingId: string,
    sortingId: string,
    workspaceUri?: string
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

export const routeFromLocation = (location: LocationInterface, serverInfo: ServerInfo | null): WorkspaceRoute => {
    const pathList = location.pathname.split('/')

    const query = QueryString.parse(location.search.slice(1));
    const workspace = (query.workspace as string) || 'default'
    const defaultFeedId = serverInfo?.defaultFeedId
    const workspaceUri = workspace.startsWith('workspace://') ? workspace : (defaultFeedId ? `workspace://${defaultFeedId}/${workspace}` : undefined)

    const page = pathList[1] || 'recordings'
    if (!isWorkspacePage(page)) throw Error(`Invalid page: ${page}`)
    switch (page) {
        case 'recordings': return {
            workspaceUri,
            page
        }
        case 'recording': return {
            workspaceUri,
            page,
            recordingId: pathList[2]
        }
        case 'sorting': return {
            workspaceUri,
            page,
            recordingId: pathList[2] || '',
            sortingId: pathList[3] || ''
        }
        default: return {
            workspaceUri,
            page: 'recordings'
        }
    }
}

export const locationFromRoute = (route: WorkspaceRoute) => {
    const queryParams: { [key: string]: string } = {}
    if (route.workspaceUri) {
        queryParams['workspace'] = route.workspaceUri
    }
    switch (route.page) {
        case 'recordings': return {
            pathname: `/`,
            search: queryString(queryParams)
        }
        case 'recording': return {
            pathname: `/recording/${route.recordingId}`,
            search: queryString(queryParams)
        }
        case 'sorting': return {
            pathname: `/sorting/${route.recordingId}/${route.sortingId}`,
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
            workspaceUri: s.workspaceUri
        }; break;
        case 'gotoRecordingPage': newRoute = {
            page: 'recording',
            recordingId: a.recordingId,
            workspaceUri: s.workspaceUri
        }; break;
        case 'gotoSortingPage': newRoute = {
            page: 'sorting',
            recordingId: a.recordingId,
            sortingId: a.sortingId,
            workspaceUri: s.workspaceUri
        }; break
    }
    return newRoute
}