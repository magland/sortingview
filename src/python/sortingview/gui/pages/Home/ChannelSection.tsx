import React, { FunctionComponent, useCallback } from 'react'
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import { ChannelName, TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import useRoute from '../../route/useRoute'
import hyperlinkStyle from './hyperlinkStyle'
import RecentlyUsedBackends from 'kachery-react/components/SelectChannel/RecentlyUsedChannels'
import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'labbox-react'
import aboutKacheryChannelsMd from './aboutKacheryChannels.md.gen'
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog'
import CheckRegisteredTaskFunctions from './CheckRegisteredTaskFunctions'
import CheckBackendPythonPackageVersion from './CheckBackendPythonPackageVersion'

type Props = {
    onSelectChannel: () => void
}

const taskFunctionIds: TaskFunctionId[] = [
    'sortingview_workspace_list_subfeed.2',
    'example_recording_sortings', 'recording_info.3', 'sorting_info.3',
    'preload_extract_snippets.2', 'get_isi_violation_rates.1', 'get_peak_channels.1',
    'get_unit_snrs.1', 'get_firing_data.1', 'fetch_correlogram_plot_data.3',
    'get_timeseries_segment.1', 'fetch_average_waveform.2', 'test_delay.1', 'individual_cluster_features.1',
    'workspace_action.1', 'workspace_sorting_curation_action.1',
    'fetch_unit_metrics.1', 'fetch_spike_amplitudes.1',
    'latency_test_query.1', 'get_action_latency_test_subfeed.1', 'subfeed_latency_test_append.1',
    'get_python_package_version.1'
].map(x => (x as any as TaskFunctionId))

const ChannelSection: FunctionComponent<Props> = ({onSelectChannel}) => {
    const {channel, setRoute} = useRoute()
    // const channelInfo = useBackendInfo()
    // const backendPythonProjectVersion = backendInfo.backendPythonProjectVersion
    // const {visible: customBackendInstructionsVisible, show: showCustomBackendInstructions, hide: hideCustomBackendInstructions} = useVisible()
    const aboutKacheryChannelsVisible = useVisible()
    const handleSetChannel = useCallback((channel: ChannelName) => {
        setRoute({channel})
    }, [setRoute])
    return (
        <div className="ChannelSection HomeSection">
            <h3>Select a kachery channel <IconButton onClick={aboutKacheryChannelsVisible.show}><Help /></IconButton></h3>
            {
                channel ? (
                    <span>
                        
                        <p>The selected channel is <span style={{fontWeight: 'bold'}}>{channel}</span></p>
                        {/* {
                            backendPythonProjectVersion && (
                                <span>
                                    {
                                        backendPythonProjectVersion === pythonProjectVersion ? (
                                            <p>Backend Python project version is {backendInfo.backendPythonProjectVersion} (this is the expected version)</p>
                                        ) : (
                                            <p>Backend Python project version is {backendInfo.backendPythonProjectVersion} (expected version is {pythonProjectVersion})</p>
                                        )
                                    }
                                </span>
                            )
                        } */}
                        <p><Hyperlink style={hyperlinkStyle} onClick={onSelectChannel}>Select a different channel</Hyperlink></p>
                        {/* <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Use your own channel</Hyperlink></p> */}
                        <CheckRegisteredTaskFunctions
                            channelName={channel}
                            taskFunctionIds={taskFunctionIds}
                        />
                        <CheckBackendPythonPackageVersion />
                    </span>
                ) : (
                    <span>
                        <p>Start by <Hyperlink style={hyperlinkStyle} onClick={onSelectChannel}>selecting a kachery channel</Hyperlink></p>
                        <RecentlyUsedBackends onSelectChannel={handleSetChannel} />
                        {/* <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Or use your own channel</Hyperlink></p> */}
                    </span>
                )
            }
            <MarkdownDialog
                visible={aboutKacheryChannelsVisible.visible}
                onClose={aboutKacheryChannelsVisible.hide}
                source={aboutKacheryChannelsMd}
            />
            {/* <MarkdownDialog
                visible={customBackendInstructionsVisible}
                onClose={hideCustomBackendInstructions}
                source={customBackendInstructionsMd}
            /> */}
        </div>
    )
}

export default ChannelSection