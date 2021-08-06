import { ChannelName, JSONStringifyDeterministic } from "kachery-js/types/kacheryTypes"

export type RecentFigure = {
    type: string
    data: any
    channel: ChannelName
    location: {
        pathname: string
        search: string
    }
}

export type RecentFigures = {
    figures: RecentFigure[]
}

export type RecentFiguresAction = {
    type: 'add',
    recentFigure: RecentFigure
}

const sameRecentFigure = (x: RecentFigure, y: RecentFigure) => {
    return JSONStringifyDeterministic(x) === JSONStringifyDeterministic(y)
}

export const recentFiguresReducer = (s: RecentFigures, a: RecentFiguresAction) => {
    if (a.type === 'add') {
        let newF = [...s.figures.filter(x => (!sameRecentFigure(x, a.recentFigure))), a.recentFigure]
        if (newF.length > 15) newF = newF.slice(3)
        const newS = {...s, figures: newF}
        localStorage.setItem('recent-figures-2', JSON.stringify(newS))
        return newS
    }
    else return s
}

const getInitialRecentFigures = (): RecentFigures => {
    try {
        const a = localStorage.getItem('recent-figures-2') || JSON.stringify({figures: []})
        return JSON.parse(a)
    }
    catch {
        return {figures: []}
    }
}

export const initialRecentFigures = getInitialRecentFigures()
