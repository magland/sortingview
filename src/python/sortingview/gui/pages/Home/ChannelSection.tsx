import React, { FunctionComponent, useCallback } from 'react'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import { ChannelName } from 'kachery-js/types/kacheryTypes'
import useRoute from '../../route/useRoute'
import hyperlinkStyle from './hyperlinkStyle'
import RecentlyUsedBackends from './RecentlyUsedChannels'

type Props = {
    onSelectChannel: () => void
}

const ChannelSection: FunctionComponent<Props> = ({onSelectChannel}) => {
    const {channel, setRoute} = useRoute()
    // const channelInfo = useBackendInfo()
    // const backendPythonProjectVersion = backendInfo.backendPythonProjectVersion
    // const {visible: customBackendInstructionsVisible, show: showCustomBackendInstructions, hide: hideCustomBackendInstructions} = useVisible()
    const handleSetChannel = useCallback((channel: ChannelName) => {
        setRoute({channel})
    }, [setRoute])
    return (
        <div className="ChannelSection HomeSection">
            {
                channel ? (
                    <span>
                        <p>The selected channel is: {channel}</p>
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
                        <p>Start by selecting a <Hyperlink style={hyperlinkStyle} onClick={onSelectChannel}>channel</Hyperlink></p>
                        <RecentlyUsedBackends onSelectChannel={handleSetChannel} />
                        {/* <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Or use your own channel</Hyperlink></p> */}
                    </span>
                )
            }
            {/* <MarkdownDialog
                visible={customBackendInstructionsVisible}
                onClose={hideCustomBackendInstructions}
                source={customBackendInstructionsMd}
            /> */}
        </div>
    )
}

export default ChannelSection