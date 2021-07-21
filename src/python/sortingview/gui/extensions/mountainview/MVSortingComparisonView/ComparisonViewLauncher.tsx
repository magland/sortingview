import { usePlugins } from "labbox-react"
import sortByPriority from "labbox-react/extensionSystem/sortByPriority"
import { LabboxPlugin, SortingComparisonViewPlugin, sortingComparisonViewPlugins, SortingSelection } from "python/sortingview/gui/pluginInterface"
import { FunctionComponent, useCallback } from "react"

type Props = {
    selection1: SortingSelection
    selection2: SortingSelection
    onLaunchSortingComparisonView: (plugin: SortingComparisonViewPlugin) => void
}

type LaunchSortingComparisonViewButtonProps = {
    plugin: SortingComparisonViewPlugin
    onLaunch: (plugin: SortingComparisonViewPlugin) => void
}

const buttonStyle: React.CSSProperties = {
    fontSize: 12,
    padding: 4,
    margin: 1
}

const LaunchSortingComparisonViewButton: FunctionComponent<LaunchSortingComparisonViewButtonProps> = ({ plugin, onLaunch }) => {
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

const ComparisonViewLauncher: FunctionComponent<Props> = ({ onLaunchSortingComparisonView, selection1, selection2 }) => {
    const plugins = usePlugins<LabboxPlugin>()
    return (
        <div key="sortingViews" style={{flexFlow: 'wrap'}}>
                {
                    sortByPriority(sortingComparisonViewPlugins(plugins)).filter(p => (p.name !== 'MVSortingComparisonView')).map(scv => (
                        <LaunchSortingComparisonViewButton key={scv.name} plugin={scv} onLaunch={onLaunchSortingComparisonView} />
                    ))
                }
        </div>
    )
}

export default ComparisonViewLauncher