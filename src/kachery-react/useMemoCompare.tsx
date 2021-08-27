import { stringifyDeterministicWithSortedKeys } from 'kachery-js/crypto/signatures'
import { useEffect, useRef } from 'react'

export type ComparatorFn<T> = (a: T, b: T) => boolean
// Code largely from https://usehooks.com/useMemoCompare/
export const useMemoCompare = <T, >(label: string, next: T, fallback: T, compare: ComparatorFn<T> = compareDataObject) => {
    const previousRef = useRef<T>()
    const previous = previousRef.current
    // const compareFn = compare ?? compareDataObject

    const isEqual = previous && compare(previous, next)

    useEffect(() => {
        if (!isEqual) {
            console.log(`Caught value change for ${label}`)
            previousRef.current = next
        }
    })

    return (isEqual ? previous : next) || fallback
}

const compareDataObject = (a: any, b: any): boolean => {
    // return JSONStringifyDeterministic(a) === JSONStringifyDeterministic(b)
    return stringifyDeterministicWithSortedKeys(a) === stringifyDeterministicWithSortedKeys(b)
}