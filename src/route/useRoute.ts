import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router'
import QueryString from 'querystring'

const useRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const recordingUri = (query.recording as string) || undefined
    const sortingUri = (query.sorting as string) || undefined

    const setRoute = useCallback((o: {recordingUri?: string, sortingUri?: string}) => {
        const query2 = {...query}
        if (o.recordingUri !== undefined) query2.recording = o.recordingUri
        if (o.sortingUri !== undefined) query2.sorting = o.sortingUri
        const search2 = queryString(query2)
        history.push({...location, search: search2})
    }, [location, history, query])
    
    return {recordingUri, sortingUri, setRoute}
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