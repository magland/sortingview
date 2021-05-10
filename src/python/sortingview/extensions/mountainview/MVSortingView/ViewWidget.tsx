import React, { FunctionComponent } from 'react';
import { SortingViewPlugin, SortingViewProps } from "../../pluginInterface";
import { View } from './MVSortingView';

type Props = {
    view: View
    sortingViewProps: SortingViewProps
    width?: number
    height?: number
}

const ViewWidget: FunctionComponent<Props> = ({ view, sortingViewProps, width, height }) => {
    const p = view.plugin as SortingViewPlugin
    const Component = p.component
    let pr: {[key: string]: any} = {}
    if (width) pr.width = width
    if (height) pr.height = height
    return (
        <Component {...sortingViewProps} {...pr} {...view.extraProps} />
    )
}

export default ViewWidget