import { Splitter } from "../component-splitter"
import { ViewComponentProps } from "../core-view-component-props"
import { FunctionComponent, useMemo } from "react"
import { computeSizes } from "./BoxLayoutItemView"
import LayoutItemView from "./LayoutItemView"
import { LayoutItem, MLView } from "./MainLayoutViewData"

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: MLView[]
    width: number
    height: number
}

const SplitterLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'Splitter') {
        throw Error('Unexpected')
    }
    const {direction, items, itemProperties} = layoutItem
    if (items.length !== 2) {
        throw Error('Number of items must be 2 for a Splitter layout item')
    }
    const itemPositions: number[] = useMemo(() => {
        let itemSizes: number[]
        if (direction === 'horizontal') {
            itemSizes = computeSizes(width, items.length, itemProperties || [], [], direction)
        }
        else {
            // not used until vertical is implemented
            itemSizes = computeSizes(height, items.length, itemProperties || [], [], direction)
        }
        const ret: number[] = []
        let x = 0
        for (let s of itemSizes) {
            ret.push(x)
            x += s
        }
        return ret
    }, [direction, items, width, height, itemProperties])
    const initialSplitterPosition: number = itemPositions[1]

    // Todo, we need to enforce min/max sizes
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={initialSplitterPosition}
            direction={direction}
        >
            {
                items.map((item, ii) => {
                    return (
                        <LayoutItemView
                            key={ii}
                            layoutItem={item}
                            ViewComponent={ViewComponent}
                            views={views}
                            width={0} // filled in by splitter
                            height={0} // filled in by splitter
                        />
                    )
                })
            }
        </Splitter>
    )
}

export default SplitterLayoutItemView