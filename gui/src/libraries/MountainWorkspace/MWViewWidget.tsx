import React, { FunctionComponent } from 'react';
import { MWView, MWViewPlugin } from './MWViewPlugin';

type Props = {
    view: MWView
    viewProps: {[key: string]: any}
    width?: number
    height?: number
}

const MWViewWidget: FunctionComponent<Props> = ({ view, viewProps, width, height }) => {
    const p = view.plugin as MWViewPlugin
    const Component = p.component
    let pr: {[key: string]: any} = {}
    if (width) pr.width = width
    if (height) pr.height = height
    return (
        <Component {...viewProps} {...pr} {...view.extraProps} {...(p.additionalProps || {})} />
    )
}

export default MWViewWidget