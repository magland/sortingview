import { ViewComponentProps } from "../core-view-component-props"
import { FunctionComponent, useMemo } from "react"
import { LayoutItem, MLView } from "./MainLayoutViewData"
import MountainLayout2View from "./MountainLayout2/MountainLayout2View"
import { MLViewData, MountainLayout2ViewData } from "./MountainLayout2/MountainLayout2ViewData"

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: MLView[]
    width: number
    height: number
}

const MountainLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'Mountain') {
        throw Error('Unexpected')
    }
    const {items, itemProperties} = layoutItem

    const data: MountainLayout2ViewData = useMemo(() => {
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
                        figureDataUri: V.dataUri,
                        controlHeight: properties.controlHeight
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
        <MountainLayout2View
            data={data}
            ViewComponent={ViewComponent}
            hideCurationControl={true}
            width={width}
            height={height}
        />
    )
}

export default MountainLayoutItemView