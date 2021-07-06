import { ChannelName } from 'kachery-js/types/kacheryTypes'
import { useChannel } from 'kachery-react'
import SelectChannelDialog from 'kachery-react/components/SelectChannel/SelectChannelDialog'
import { useVisible } from 'labbox-react'
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import React, { FunctionComponent } from 'react'
import '../../commonComponents/localStyles.css'
import packageName from '../../packageName'
import { pythonProjectVersion, webAppProjectVersion } from '../../version'
import ChannelSection from './ChannelSection'
import './Home.css'
import IntroSection from './IntroSection'
import TestResponsivenessSection from './TestResponsivenessSection'
import WorkspaceSection from './WorkspaceSection'

type Props = {
    
}

const hardCodedChannels = ['ccm'] as any as ChannelName[]

const Home: FunctionComponent<Props> = () => {
    const selectChannelVisibility = useVisible()
    const {channelName} = useChannel()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection />
            <ChannelSection onSelectChannel={selectChannelVisibility.show} />
            <WorkspaceSection />
            {
                channelName && <TestResponsivenessSection />
            }
            <span>
                <hr />
                <p style={{fontFamily: 'courier', color: 'gray'}}>Python package version: {packageName} {pythonProjectVersion} | GUI version: {webAppProjectVersion} | <a href="https://github.com/magland/sortingview" target="_blank">View on GitHub</a></p>
            </span>
            
            <SelectChannelDialog
                visible={selectChannelVisibility.visible}
                onClose={selectChannelVisibility.hide}
                hardCodedChannels={hardCodedChannels}
            />
        </div>
    )
}

export default Home