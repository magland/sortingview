import { FunctionComponent, useMemo } from "react"
import { MountainLayoutView, MLViewData, MountainLayoutViewData } from "libraries/view-mountain-layout"
import { LayoutItem, SLView } from "./SortingLayoutViewData"
import { ViewComponentProps } from "libraries/core-view-component-props"

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: SLView[]
    width: number
    height: number
}

const MountainLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'Mountain') {
        throw Error('Unexpected')
    }
    const {items, itemProperties} = layoutItem

    const data: MountainLayoutViewData = useMemo(() => {
        const views0: MLViewData[] = []
        const controls0: MLViewData[] = []
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const properties = itemProperties[i]
            if (item.type === 'View') {
                const V = views.filter(v => (v.viewId === item.viewId))[0]
                if (!properties.isControl) {
                    views0.push({
                        label: properties.label,
                        type: V.type,
                        figureDataUri: V.dataUri 
                    })
                }
                else {
                    controls0.push({
                        label: properties.label,
                        type: V.type,
                        figureDataUri: V.dataUri
                    })
                }
            }
            else {
                throw Error(`Unsupported layout item type for mountain layout: ${item.type}`)
            }
        }
        return {
            type: 'MountainLayout',
            views: views0,
            controls: controls0
        }
    }, [items, itemProperties, views])

    return (
        <MountainLayoutView
            data={data}
            ViewComponent={ViewComponent}
            hideCurationControl={true}
            width={width}
            height={height}
        />
    )
}

export default MountainLayoutItemView