import objectHash from 'object-hash'
import { useEffect, useMemo, useReducer, useRef, useState } from "react"

type FetchCache<QueryType> = {
    get: (query: QueryType) => any | undefined
}

type FetchCacheState = {
    data: {[key: string]: any}
    activeFetches: {[key: string]: boolean}
}

const initialFetchCacheState = {
    data: {},
    activeFetches: {}
}

type ClearAction = {
    type: 'clear'
}

type StartFetchAction = {
    type: 'startFetch',
    queryHash: string
}

type SetDataAction = {
    type: 'setData',
    queryHash: string,
    data: any
}

type FetchCacheAction = ClearAction | StartFetchAction | SetDataAction

const fetchCacheReducer = (state: FetchCacheState, action: FetchCacheAction): FetchCacheState => {
    switch(action.type) {
        case 'clear': {
            return initialFetchCacheState
        }
        case 'startFetch': {
            return {
                ...state,
                activeFetches: {
                    ...state.activeFetches,
                    [action.queryHash]: true
                }
            }
        }
        case 'setData': {
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.queryHash]: action.data
                },
                activeFetches: {
                    ...state.activeFetches,
                    [action.queryHash]: false
                }
            }
        }
        default: {
            throw Error('Unexpected action in fetchCacheReducer')
        }
    }
}

const queryHash = <QueryType>(query: QueryType) => {
    return objectHash(query)
}

const useFetchCache = <QueryType>(fetchFunction: (query: QueryType) => Promise<any>): FetchCache<QueryType> => {
    const [count, setCount] = useState(0)
    if (count < 0) console.info(count) // just suppress the unused warning (will never print)
    const prevFetchFunction = useRef<(query: QueryType) => Promise<any>>(fetchFunction)
    const [state, dispatch] = useReducer(fetchCacheReducer, initialFetchCacheState)
    const queriesToFetch = useRef<{[key: string]: QueryType}>({})
    useEffect(() => {
        // clear whenever fetchFunction has Changed
        if (fetchFunction !== prevFetchFunction.current) {
            prevFetchFunction.current = fetchFunction
            dispatch({type: 'clear'})
        }
    }, [fetchFunction])
    const get = useMemo(() => ((query: QueryType) => {
        const h = queryHash(query)
        const v = state.data[h]
        if (v === undefined) {
            queriesToFetch.current[h] = query
            setCount((c) => (c + 1)) // make sure we trigger a state change so we go to the useEffect below
        }
        return v
    }), [state.data])
    const fetch = useMemo(() => ((query: QueryType) => {
        const h = queryHash(query)
        const val = state.data[h]
        if (val !== undefined) return
        if (state.activeFetches[h]) return
        dispatch({type: 'startFetch', queryHash: h})
        fetchFunction(query).then((data: any) => {
            dispatch({type: 'setData', queryHash: h, data})
        }).catch((err) => {
            console.warn(err)
            console.warn('Problem fetching data', query)
            // note: we intentionally do not unset the active fetch here
        })
    }), [state.data, state.activeFetches, fetchFunction])
    useEffect(() => { // run this every time
        const keys = Object.keys(queriesToFetch.current)
        if (keys.length === 0) return
        for (let k of keys) {
            fetch(queriesToFetch.current[k])
        }
        queriesToFetch.current = {}
    })
    return useMemo(() => ({
        get
    }), [get])
}

export default useFetchCache
