import { isString, validateObject } from "../core-utils"
import { isArrayOf, isBoolean, isEqualTo, isNumber, isOneOf, optional } from "../core-utils"

export type LayoutItem = {
    type: 'Box'
    direction: 'horizontal' | 'vertical'
    scrollbar?: boolean
    items: LayoutItem[]
    itemProperties?: {
        minSize?: number
        maxSize?: number
        stretch?: number    
    }[]
} | {
    type: 'Splitter'
    direction: 'horizontal' | 'vertical'
    items: LayoutItem[] // must have length 2
    itemProperties?: {
        minSize?: number
        maxSize?: number
        stretch?: number    
    }[]
} | {
    type: 'Mountain'
    items: LayoutItem[]
    itemProperties: {
        label: string
        isControl?: boolean
    }[]
} | {
    type: 'TabLayout'
    items: LayoutItem[]
    itemProperties: {
        label: string
    }[]
} | {
    type: 'View'
    viewId: string
}

export const isLayoutItem = (x: any): x is LayoutItem => {
    return isOneOf([
        (y: any) => (validateObject(y, {
            type: isEqualTo('Box'),
            direction: isOneOf(['horizontal', 'vertical'].map(s => (isEqualTo(s)))),
            scrollbar: optional(isBoolean),
            items: isArrayOf(isLayoutItem),
            itemProperties: optional(isArrayOf(z => (validateObject(z, {
                minSize: optional(isNumber),
                maxSize: optional(isNumber),
                stretch: optional(isNumber)
            }))))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('Splitter'),
            direction: isOneOf(['horizontal', 'vertical'].map(s => (isEqualTo(s)))),
            items: isArrayOf(isLayoutItem),
            itemProperties: optional(isArrayOf(z => (validateObject(z, {
                minSize: optional(isNumber),
                maxSize: optional(isNumber),
                stretch: optional(isNumber)
            }))))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('Mountain'),
            items: isArrayOf(isLayoutItem),
            itemProperties: isArrayOf(z => (validateObject(z, {
                label: isString,
                isControl: optional(isBoolean),
                controlHeight: optional(isNumber)
            })))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('TabLayout'),
            items: isArrayOf(isLayoutItem),
            itemProperties: isArrayOf(z => (validateObject(z, {
                label: isString
            })))
        })),
        (y: any) => (validateObject(y, {
            type: isEqualTo('View'),
            viewId: isString
        }))
    ])(x)
}

export type SLView = {
    viewId: string
    type: string
    dataUri: string
}

export type SortingLayoutViewData = {
    type: 'SortingLayout'
    views: SLView[]
    layout: LayoutItem
    sortingCurationUri?: string
}

export const isSortingLayoutViewData = (x: any): x is SortingLayoutViewData => {
    return validateObject(x, {
        type: isEqualTo('SortingLayout'),
        views: isArrayOf(y =>(validateObject(y, {
            viewId: isString,
            type: isString,
            dataUri: isString
        }))),
        layout: isLayoutItem,
        sortingCurationUri: optional(isString)
    }, {})
}