import { FunctionComponent, useMemo } from "react"
import { TabWidget } from "../core-views"
import LayoutItemView from "./LayoutItemView"
import { LayoutItem, SLView } from "./SortingLayoutViewData"
import { ViewComponentProps } from "libraries/core-view-component-props"

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: SLView[]
    width: number
    height: number
}

const TabLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'TabLayout') {
        throw Error('Unexpected')
    }
    const {items, itemProperties} = layoutItem

    const tabs = useMemo(() => (
        itemProperties.map(p => ({
            label: p.label
        }))
    ), [itemProperties])

    return (
        <TabWidget
            tabs={tabs}
            width={width}
            height={height}
        >
            {
                items.map((item, ii) => (
                    <LayoutItemView
                        key={ii}
                        layoutItem={item}
                        ViewComponent={ViewComponent}
                        views={views}
                        width={0} // filled in by tab widget
                        height={0} // filled in by tab widget
                    />
                ))
            }
        </TabWidget>
    )
}

export default TabLayoutItemView