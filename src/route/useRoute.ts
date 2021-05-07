import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import QueryString from 'querystring'
import useBackendRoute from './useBackendRoute'


export type RoutePath = '/home' | '/about' | '/selectData' | '/mountainview'
const isRoutePath = (x: string): x is RoutePath => {
    return ['/home', '/about', '/selectData', '/mountainview'].includes(x)
}

const useRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const recordingUri = (query.recording as string) || undefined
    const sortingUri = (query.sorting as string) || undefined
    const {backendUri, setBackendUri} = useBackendRoute()
    const p = location.pathname
    const routePath: RoutePath = isRoutePath(p) ? p : '/home'

    const setRoute = useCallback((o: {routePath?: RoutePath, recordingUri?: string, sortingUri?: string, backendUri?: string}) => {
        console.log('-------- location.search', location.search)
        const query2 = {...query}
        let pathname2 = location.pathname
        if (o.routePath) pathname2 = o.routePath
        if (o.recordingUri !== undefined) query2.recording = o.recordingUri
        if (o.sortingUri !== undefined) query2.sorting = o.sortingUri
        if (o.backendUri !== undefined) query2.backend = o.backendUri
        const search2 = queryString(query2)
        console.log('----xxxx', o, query2, search2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [location, history, query])
    
    return {routePath, recordingUri, sortingUri, backendUri, setRoute}
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

export default useRoute