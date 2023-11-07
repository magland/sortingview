
import { FunctionComponent, useCallback, useReducer } from 'react';
import MWViewContainer from './MWContainer';
import { MWView, MWViewPlugin } from './MWViewPlugin';
import MWViewWidget from './MWViewWidget';
import openViewsReducer from './openViewsReducer';
// import MWCurationControl from './MWCurationControl';
import { Splitter } from '../component-splitter';
import { ViewComponentProps } from '../core-view-component-props';
import MountainWorkspaceLeftPanel from './MountainWorkspaceLeftPanel';

type Props = {
    viewPlugins: MWViewPlugin[]
    viewProps: {[key: string]: any}
    ViewComponent: FunctionComponent<ViewComponentProps>
    hideCurationControl?: boolean
    controlViewPlugins: MWViewPlugin[]
    width: number
    height: number
}

const initialLeftPanelWidth = 320

const MountainWorkspace: FunctionComponent<Props> = ({width, height, viewPlugins, ViewComponent, viewProps, hideCurationControl, controlViewPlugins}) => {
    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])
    
    const handleLaunchView = useCallback((plugin: MWViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            area: ''
        })
    }, [openViewsDispatch])

    const handleViewClosed = useCallback((v: MWView) => {
        openViewsDispatch({
            type: 'CloseView',
            view: v
        })
    }, [openViewsDispatch])

    const handleSetViewArea = useCallback((view: MWView, area: 'north' | 'south') => {
        openViewsDispatch({
            type: 'SetViewArea',
            viewId: view.viewId,
            area
        })
    }, [openViewsDispatch])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={initialLeftPanelWidth}
        >
            <MountainWorkspaceLeftPanel
                onLaunchView={handleLaunchView}
                viewPlugins={viewPlugins}
                controlViewPlugins={controlViewPlugins}
                ViewComponent={ViewComponent}
                width={0}
                height={0}
            />
            <MWViewContainer
                onViewClosed={handleViewClosed}
                onSetViewArea={handleSetViewArea}
                views={openViews}
                width={0} // will be replaced by splitter
                height={0} // will be replaced by splitter
            >
                {
                    openViews.map(v => (
                        <MWViewWidget
                            key={v.viewId}
                            view={v}
                            viewProps={viewProps}
                        />
                    ))
                }
            </MWViewContainer>
        </Splitter>
    )
}

type WrapperProps = {
    viewPlugin: MWViewPlugin
    ViewComponent: FunctionComponent<ViewComponentProps>
    width?: number
}

export const MWViewWrapper: FunctionComponent<WrapperProps> = ({ viewPlugin, width }) => {
    const p = viewPlugin
    const Component = p.component
    return (
        <Component {...{width}} {...(p.additionalProps || {})} />
    )
}

export default MountainWorkspace