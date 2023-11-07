import { ViewComponentProps } from "libraries/core-view-component-props"
import { FunctionComponent } from "react"
import BoxLayoutItemView from "./BoxLayoutItemView"
import IndividualLayoutItemView from "./IndividualLayoutItemView"
import MountainLayoutItemView from "./MountainLayoutItemView"
import { LayoutItem, SLView } from "./SortingLayoutViewData"
import SplitterLayoutItemView from "./SplitterLayoutItemView"
import TabLayoutItemView from "./TabLayoutItemView"

type Props = {
    layoutItem: LayoutItem
    views: SLView[]
    ViewComponent: FunctionComponent<ViewComponentProps>
    width: number
    height: number
}

const LayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    return (
        layoutItem.type === 'Box' ? (
            <BoxLayoutItemView
                layoutItem={layoutItem}
                ViewComponent={ViewComponent}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'Splitter' ? (
            <SplitterLayoutItemView
                layoutItem={layoutItem}
                ViewComponent={ViewComponent}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'Mountain' ? (
            <MountainLayoutItemView
                layoutItem={layoutItem}
                ViewComponent={ViewComponent}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'TabLayout' ? (
            <TabLayoutItemView
                layoutItem={layoutItem}
                ViewComponent={ViewComponent}
                views={views}
                width={width}
                height={height}
            />
        ) : layoutItem.type === 'View' ? (
            <IndividualLayoutItemView
                layoutItem={layoutItem}
                ViewComponent={ViewComponent}
                views={views}
                width={width}
                height={height}
            />
        ) : (
            <div>Unrecognized layout item type</div>
        )
    )
}

export default LayoutItemView