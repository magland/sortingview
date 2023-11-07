import { FunctionComponent, useMemo } from "react"
import { TabWidget } from ".."
import LayoutItemView from "./LayoutItemView"
import { LayoutItem, MLView } from "./MainLayoutViewData"
import { ViewComponentProps } from "../core-view-component-props"

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: MLView[]
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