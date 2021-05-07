import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import QueryString from 'querystring'

const useBackendRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const backendUri = (query.backend as string) || undefined

    const setBackendUri = useCallback((backendUri: string) => {
        const query2 = {...query, backend: backendUri}
        const search2 = queryString(query2)
        history.push({...location, search: search2})
    }, [location, history, query])
    
    return {backendUri, setBackendUri}
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

export default useBackendRoute