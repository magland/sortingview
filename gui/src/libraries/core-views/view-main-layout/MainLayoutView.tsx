import { ViewComponentProps } from '../core-view-component-props';
import { FunctionComponent } from 'react';
import LayoutItemView from './LayoutItemView';
import { MainLayoutViewData } from './MainLayoutViewData';

type Props = {
    data: MainLayoutViewData
    ViewComponent: FunctionComponent<ViewComponentProps>
    width: number
    height: number
}

const MainLayoutView: FunctionComponent<Props> = ({data, ViewComponent, width, height}) => {
    const {layout, views} = data

    return (
        <LayoutItemView
            layoutItem={layout}
            ViewComponent={ViewComponent}
            views={views}
            width={width}
            height={height}
        />
    )
}

export default MainLayoutView