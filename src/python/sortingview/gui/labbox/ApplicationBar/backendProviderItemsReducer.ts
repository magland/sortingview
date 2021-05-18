const hardCodedBackendProviderItems: BackendItem[] = [
]

const MAIN_BACKEND_PROVIDER_URI = process.env.REACT_APP_MAIN_BACKEND_PROVIDER_URI || ''
if (MAIN_BACKEND_PROVIDER_URI) {
    hardCodedBackendProviderItems.push({
        label: 'default',
        uri: MAIN_BACKEND_PROVIDER_URI,
        lastUsed: 0
    })
}

export type BackendItem = {
    label: string
    uri: string
    lastUsed: number
}

export type BackendProviderItemsAction = {
    type: 'addItem',
    item: BackendItem
} | {
    type: 'removeItem',
    uri: string
}

const backendProviderItemsReducer = (state: BackendItem[], action: BackendProviderItemsAction) => {
    let newState: BackendItem[]
    if (action.type === 'addItem') {
         newState = [...state.filter(x => (x.uri !== action.item.uri)), action.item].sort((a, b) => (b.lastUsed - a.lastUsed))
    }
    else if (action.type === 'removeItem') {
        newState = state.filter(x => (x.uri !== action.uri))
    }
    else {
        return state
    }
    _save(newState)
    return newState
}

export const initialBackendProviderItems = () => {
    const s = loadBackendItems()
    const uris: {[key: string]: boolean} = {}
    s.forEach(x => {uris[x.uri] = true})
    return [...s, ...hardCodedBackendProviderItems.filter(x => (!uris[x.uri]))]
}

const storageKey = 'sortingview-backend-provider-list'

export const loadBackendItems = (): BackendItem[] => {
    try {
        const x = localStorage.getItem(storageKey) || '[]'
        return (JSON.parse(x) as any[]).map(a => ({label: a.label + '', uri: a.uri + '', lastUsed: a.lastUsed} as BackendItem)).filter(x => (x.lastUsed > 0))
    }
    catch {
        return [] as BackendItem[]
    }
}

const _save = (data: BackendItem[]) => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(data))
    }
    catch(err) {

    }
}

export default backendProviderItemsReducer