import { ChannelName } from "kachery-js/types/kacheryTypes"
import QueryString from 'querystring'
import { useCallback, useMemo } from "react"
import { useHistory, useLocation } from "react-router-dom"

const useChannel = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const channel = (query.channel as any as ChannelName) || undefined
    const selectChannel = useCallback((channelName: ChannelName | undefined) => {
        const query2 = {...query}
        let pathname2 = location.pathname
        query2.channel = channelName ? channelName.toString() : ''
        const search2 = queryString(query2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [history, location, query])
    return {
        channelName: channel,
        selectChannel
    }
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

export default useChannel