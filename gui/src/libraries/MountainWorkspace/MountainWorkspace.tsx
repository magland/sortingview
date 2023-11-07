import { Splitter } from '../core-views';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { ViewComponentProps } from 'libraries/core-view-component-props';
import { FunctionComponent, useCallback, useReducer } from 'react';
import Expandable from './components/Expandable/Expandable';
import MWViewContainer from './MWContainer';
import MWViewLauncher from './MWViewLauncher';
import { MWView, MWViewPlugin } from './MWViewPlugin';
import MWViewWidget from './MWViewWidget';
import openViewsReducer from './openViewsReducer';

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

    const launchIcon = <span style={{color: 'gray'}}><OpenInBrowserIcon /></span>
    
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
            <div>
                {/* Launch */}
                <Expandable icon={launchIcon} label="Open views" defaultExpanded={true} unmountOnExit={false}>
                    <MWViewLauncher
                        onLaunchView={handleLaunchView}
                        plugins={viewPlugins}
                    />
                </Expandable>

                {/* Curation */}
                {/* {
                    !hideCurationControl && (
                        <Expandable icon={launchIcon} label="Curation" defaultExpanded={true} unmountOnExit={false}>
                            <MWCurationControl />
                        </Expandable>
                    )
                } */}

                {
                    controlViewPlugins.map(v => (
                        <Expandable key={v.name} icon={launchIcon} label={v.label} defaultExpanded={true} unmountOnExit={false}>
                            <MWViewWrapper
                                viewPlugin={v}
                                ViewComponent={ViewComponent}
                            />
                        </Expandable>
                    ))
                }
            </div>
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
}

const MWViewWrapper: FunctionComponent<WrapperProps> = ({ viewPlugin }) => {
    const p = viewPlugin
    const Component = p.component
    return (
        <Component {...(p.additionalProps || {})} />
    )
}

export default MountainWorkspace