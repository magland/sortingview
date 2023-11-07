import { ViewComponentProps } from '../../core-view-component-props';
import { MountainWorkspace } from '../../MountainWorkspace';
import { FunctionComponent, useMemo } from 'react';
import { MountainLayout2ViewData } from './MountainLayout2ViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: MountainLayout2ViewData
    ViewComponent: FunctionComponent<ViewComponentProps>
    hideCurationControl?: boolean
    width: number
    height: number
}

const MountainLayout2View: FunctionComponent<Props> = ({data, ViewComponent, hideCurationControl, width, height}) => {
    const viewPlugins = useMemo(() => (
        data.views.map((view, ii) => ({
            name: `view-${ii}`,
            label: view.label,
            component: ViewWrapper,
            singleton: true,
            additionalProps: {figureDataSha1: view.figureDataSha1, figureDataUri: view.figureDataUri, ViewComponent}
        }))
    ), [data.views, ViewComponent])
    const controlViewPlugins = useMemo(() => (
        (data.controls || []).map((view, ii) => ({
            name: `control-${ii}`,
            label: view.label,
            component: ViewWrapper,
            singleton: true,
            additionalProps: {figureDataSha1: view.figureDataSha1, figureDataUri: view.figureDataUri, ViewComponent, height: view.controlHeight || 500}
        }))
    ), [data.controls, ViewComponent])
    const viewProps = useMemo(() => ({}), [])
    return (
        <MountainWorkspace
            viewPlugins={viewPlugins}
            viewProps={viewProps}
            ViewComponent={ViewComponent}
            hideCurationControl={hideCurationControl}
            controlViewPlugins={controlViewPlugins}
            width={width}
            height={height}
        />
    )
}

export const feedIdForUri = (uri: string) => {
    return uri.split('/')[2] || 'invalid-feed-uri'
}

export default MountainLayout2View