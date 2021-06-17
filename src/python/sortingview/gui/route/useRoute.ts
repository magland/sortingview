import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import QueryString from 'querystring'
import RoutePath, { isRoutePath } from './RoutePath'
import { ChannelName } from 'kachery-js/types/kacheryTypes'

const useRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const workspaceUri = (query.workspace as string) || undefined
    const channel = (query.channel as any as ChannelName) || undefined
    const p = location.pathname
    const routePath: RoutePath = isRoutePath(p) ? p : '/home'

    const setRoute = useCallback((o: {routePath?: RoutePath, workspaceUri?: string, channel?: ChannelName}) => {
        const query2 = {...query}
        let pathname2 = location.pathname
        if (o.routePath) pathname2 = o.routePath
        if (o.workspaceUri !== undefined) query2.workspace = o.workspaceUri
        if (o.channel !== undefined) query2.channel = o.channel.toString()
        const search2 = queryString(query2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [location, history, query])
    
    return {routePath, workspaceUri, channel, setRoute}
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