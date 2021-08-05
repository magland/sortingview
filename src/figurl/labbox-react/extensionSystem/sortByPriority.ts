const isArray = <T>(x: any): x is T[] => {
    return (Array.isArray(x))
}

const sortByPriority = <T extends {label: string, priority?: number}>(x: T[] | {[key: string]: T}): T[] => {
    if (isArray<T>(x)) {
        return x.sort((a, b) => (
            a.priority === b.priority ? (
                ((a.label || '') < (b.label || '')) ? -1 : ((a.label || '') > (b.label || '')) ? 1 : 0
            ) : (
                (b.priority || 0) - (a.priority || 0))
            )
        )
    }
    else {
        return sortByPriority(Object.values(x))
    }
}

export default sortByPriority