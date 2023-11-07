import { useFileData } from "@figurl/interface";
import { ProgressComponent } from "../component-progress";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { LayoutItem, MLView } from "./MainLayoutViewData";
import { ViewComponentProps } from "../core-view-component-props";

type Props = {
    layoutItem: LayoutItem
    ViewComponent: FunctionComponent<ViewComponentProps>
    views: MLView[]
    width: number
    height: number
}  

const IndividualLayoutItemView: FunctionComponent<Props> = ({layoutItem, ViewComponent, views, width, height}) => {
    if (layoutItem.type !== 'View') {
        throw Error('Unexpected')
    }
    const {viewId} = layoutItem
    const view = views.filter(v => (v.viewId === viewId))[0]
    if (!view) throw Error(`View not found ${viewId}`)

    const { fileData: figureData, progress, errorMessage } = useFileData(view.dataUri)
    const [progressValue, setProgressValue] = useState<{loaded: number, total: number} | undefined>(undefined)
    useEffect(() => {
        progress.onProgress(({loaded, total}) => {
            setProgressValue({loaded, total})
        })
    }, [progress])

    const opts = useMemo(() => ({}), [])

    if (!figureData) {
        return (
            <div className="IndividualLayoutItemNoFigureData" style={{ width, height, overflow: 'hidden' }}>
                {
                    errorMessage ? errorMessage : (
                        <ProgressComponent
                            loaded={progressValue?.loaded}
                            total={progressValue?.total}
                        />
                    )
                }
            </div>
        )
    }
    return (
        <ViewComponent
            data={figureData}
            opts={opts}
            width={width}
            height={height}
        />
    )
}

export default IndividualLayoutItemView