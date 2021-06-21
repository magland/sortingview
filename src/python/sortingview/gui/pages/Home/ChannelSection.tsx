import React, { FunctionComponent, useCallback } from 'react'
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import { ChannelName } from 'kachery-js/types/kacheryTypes'
import useRoute from '../../route/useRoute'
import hyperlinkStyle from './hyperlinkStyle'
import RecentlyUsedBackends from 'kachery-react/components/SelectChannel/RecentlyUsedChannels'
import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'labbox-react'
import aboutKacheryChannelsMd from './aboutKacheryChannels.md.gen'
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog'

type Props = {
    onSelectChannel: () => void
}

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