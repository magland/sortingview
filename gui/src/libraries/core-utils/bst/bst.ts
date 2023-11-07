import { useMemo } from "react"

export type BstNode<T> = {
    value: T | undefined
    baseListIndex: number | undefined
    left: BstNode<T> | undefined
    right: BstNode<T> | undefined
}

export interface ValueWithPosition<T> {
    value: T,
    baseListIndex: number
}

export interface BstSearchResult<T> extends ValueWithPosition<T> {
    offBy: number
}

export type BstSearchFn<T> = (value: T, requireExact?: boolean) => BstSearchResult<T> | undefined
export type MetricFn<T> = (a: T, b: T) => number

export const makeBinaryTree = <T,>(items: ValueWithPosition<T>[]): BstNode<T> => {
    switch (items.length) {
        case 0:
            console.log(`Encountered empty array in building binary search tree: this probably shoudn't happen`)
            return { value: undefined, left: undefined, right: undefined, baseListIndex: undefined } as BstNode<T>
        case 1:
            return { value: items[0].value, left: undefined, right: undefined, baseListIndex: items[0].baseListIndex } as BstNode<T>
        case 2: // the node will have only 1 child! Let's arbitrarily make it the left one
            return { value: items[1].value, left: makeBinaryTree([items[0]]), right: undefined, baseListIndex: items[1].baseListIndex } as BstNode<T>
        default:
            const split = Math.floor(items.length / 2)
            const leftChild = makeBinaryTree(items.slice(0, split))
            const thisNode = items[split]
            const rightChild = makeBinaryTree(items.slice(split + 1))
            return { value: thisNode.value, baseListIndex: thisNode.baseListIndex, left: leftChild, right: rightChild } as BstNode<T>
    }
}


const nodeToValue = <T,>(node: BstNode<T>, difference: number): BstSearchResult<T> | undefined => {
    if (!node || node.value === undefined || node.baseListIndex === undefined) return undefined
    return {
        value: node.value, baseListIndex: node.baseListIndex, offBy: difference
    }
}


export const getSearchFn = <T,>(metricFn: MetricFn<T>, root: BstNode<T>): BstSearchFn<T> => {
    return (value: T, requireExact: boolean = false) => _searchBinaryTree(value, metricFn, root, requireExact)
}


const _searchBinaryTree = <T,>(value: T, metricFn: MetricFn<T>, node?: BstNode<T>, requireExact: boolean = false): BstSearchResult<T> | undefined => {
    if (!node || node.value === undefined) return undefined
    const diff = metricFn(value, node.value)
    if (diff === 0) return nodeToValue(node, diff)

    // Negative means a sorts before b, i.e. the value is less than the node value.
    const candidateSubtree = diff < 0 ? node.left : node.right
    const candidateNode = _searchBinaryTree(value, metricFn, candidateSubtree, requireExact)

    // candidateNode is now either a node with a match, or undefined (if we required exact and the value isn't in the BST.)
    // If we must return exact, return the candidate.
    // For inexact search, return the closest value, or the parent value if the child was undefined or the values tied.
    // TODO: consider if we would rather deterministically return the lower value.
    return requireExact
        ? candidateNode
        : candidateNode === undefined
            ? nodeToValue(node, diff)
            : Math.abs(candidateNode.offBy) < Math.abs(diff)
                ? candidateNode
                : nodeToValue(node, diff)
}

// TODO: This is all potentially unnecessary--if we don't support inserts, we don't need an actual tree; we could
// just use a binary search pattern on a sorted array.
// Do note though that we probably don't have O(1) random access to elements of a javascript array, so
// that might be a reason to still do this.

/**
 * Hook to create a reusable binary search tree for a fixed data set.
 * Note that no methods to extend or rebalance the tree are included, since we don't anticipate needing that
 * use case at this time.
 * (TODO: Could add a parameter to avoid checking sort on a pre-sorted list of data.)
 * 
 * @param items (Typed) list of values to place in a binary search tree.
 * @param metricFn Appropriate comparator function for the value type.
 * @returns Search function for fast searches of the input list.
 */
// export const useBinarySearchTree = <T,>(items: T[], metricFn: (a: T, b: T) => number): BstNode<T> => {
const useBinarySearchTree = <T,>(items: T[], metricFn: MetricFn<T>): BstSearchFn<T> => {
    return useMemo(() => {
        const labeledItems = items.map((item, index) => { return { value: item, baseListIndex: index } })
        const sorted = labeledItems.every((item, index, array) => {
            return index === 0 || metricFn(item.value, array[index - 1].value) >= 0
        })
        if (!sorted) {
            labeledItems.sort((a, b) => metricFn(a.value, b.value))
        }

        const root = makeBinaryTree(labeledItems)
        return getSearchFn(metricFn, root)
    }, [items, metricFn])
}

export default useBinarySearchTree
