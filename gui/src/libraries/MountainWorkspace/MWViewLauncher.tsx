import React, { Fragment, FunctionComponent, useCallback } from 'react';
import { MWViewPlugin } from './MWViewPlugin';

type Props = {
    onLaunchView: (plugin: MWViewPlugin) => void
    plugins: MWViewPlugin[]
}

const buttonStyle: React.CSSProperties = {
    fontSize: 12,
    padding: 4,
    margin: 1
}

const MWViewLauncher: FunctionComponent<Props> = ({ onLaunchView, plugins }) => {
    return (
        <Fragment>
            <div key="views" style={{flexFlow: 'wrap'}}>
                {
                    plugins.map(p => (
                        <MWLaunchViewButton key={p.name} plugin={p} onLaunch={onLaunchView} />
                    ))
                }
            </div>
        </Fragment>
    )
}

type LaunchViewButtonProps = {
    plugin: MWViewPlugin
    onLaunch: (plugin: MWViewPlugin) => void
}

const MWLaunchViewButton: FunctionComponent<LaunchViewButtonProps> = ({ plugin, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin)
    }, [onLaunch, plugin])
    return (
        <button onClick={handleClick} style={buttonStyle}>{
            plugin.icon && (
                <plugin.icon.type {...plugin.icon.props} style={{height: 14, width: 14, paddingRight: 2, paddingTop: 0}} />
            )}{plugin.label}</button>
    )
}

export default MWViewLauncher