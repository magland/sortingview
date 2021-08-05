import { ChannelName } from "kachery-js/types/kacheryTypes"

const hardCodedChannelItems: ChannelItem[] = [
]

const MAIN_CHANNEL = process.env.REACT_APP_MAIN_CHANNEL || ''
if (MAIN_CHANNEL) {
    hardCodedChannelItems.push({
        channel: MAIN_CHANNEL as any as ChannelName,
        lastUsed: 0
    })
}

export type ChannelItem = {
    channel: ChannelName
    lastUsed: number
}

export type ChannelItemsAction = {
    type: 'addItem',
    item: ChannelItem
} | {
    type: 'removeItem',
    channel: ChannelName
}

const channelItemsReducer = (state: ChannelItem[], action: ChannelItemsAction) => {
    let newState: ChannelItem[]
    if (action.type === 'addItem') {
         newState = [...state.filter(x => (x.channel !== action.item.channel)), action.item].sort((a, b) => (b.lastUsed - a.lastUsed))
    }
    else if (action.type === 'removeItem') {
        newState = state.filter(x => (x.channel !== action.channel))
    }
    else {
        return state
    }
    _save(newState)
    return newState
}

export const initialChannelItems = () => {
    const s = loadChannelItems()
    const channels: {[key: string]: boolean} = {}
    s.forEach(x => {channels[x.channel.toString()] = true})
    return [...s, ...hardCodedChannelItems.filter(x => (!channels[x.channel.toString()]))]
}

const storageKey = `channel-list`

export const loadChannelItems = (): ChannelItem[] => {
    try {
        const x = localStorage.getItem(storageKey) || '[]'
        return (JSON.parse(x) as any[]).map(a => ({label: a.label + '', channel: (a.channel + '' as any as ChannelName), lastUsed: a.lastUsed} as ChannelItem)).filter(x => (x.lastUsed > 0))
    }
    catch {
        return [] as ChannelItem[]
    }
}

const _save = (data: ChannelItem[]) => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(data))
    }
    catch(err) {

    }
}

export default channelItemsReducer