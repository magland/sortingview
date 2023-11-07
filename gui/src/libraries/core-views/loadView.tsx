import { FunctionComponent } from "react"
import { ViewComponentProps } from "./core-view-component-props"
import ImageView, { isImageViewData } from "./view-image/ImageView"
import { isMainLayoutViewData, MainLayoutView } from "./view-main-layout"
import { isMarkdownViewData, MarkdownView } from "./view-markdown"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height, ViewComponent} = o
    if (isMainLayoutViewData(data)) {
        return <MainLayoutView data={data} width={width} height={height} ViewComponent={ViewComponent}></MainLayoutView>
    }
    else if (isMarkdownViewData(data)) {
        return <MarkdownView data={data} width={width} height={height}></MarkdownView>
    }
    else if (isImageViewData(data)) {
        return <ImageView data={data} width={width} height={height}></ImageView>
    }
    else return undefined
}

export default loadView