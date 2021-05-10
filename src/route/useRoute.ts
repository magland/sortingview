import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import QueryString from 'querystring'
import useBackendRoute from './useBackendRoute'


export type RoutePath = '/home' | '/about' | '/selectWorkspace' | '/workspace' | '/workspace/recording/<rid>' | '/workspace/sorting/<rid>/<sid>' | '/mountainview'
const isRoutePath = (x: string): x is RoutePath => {
    if (['/home', '/about', '/selectWorkspace', '/workspace', '/mountainview'].includes(x)) return true
    if (x.startsWith('/workspace/recording/')) return true
    if (x.startsWith('/workspace/sorting/')) return true
    return false
}

const useRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const workspaceUri = (query.workspace as string) || undefined
    const {backendUri, setBackendUri} = useBackendRoute()
    const p = location.pathname
    const routePath: RoutePath = isRoutePath(p) ? p : '/home'

    const setRoute = useCallback((o: {routePath?: RoutePath, workspaceUri?: string, backendUri?: string}) => {
        const query2 = {...query}
        let pathname2 = location.pathname
        if (o.routePath) pathname2 = o.routePath
        if (o.workspaceUri !== undefined) query2.workspace = o.workspaceUri
        if (o.backendUri !== undefined) query2.backend = o.backendUri
        const search2 = queryString(query2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [location, history, query])
    
    return {routePath, workspaceUri, backendUri, setRoute}
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