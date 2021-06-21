import { ChannelName } from 'kachery-js/types/kacheryTypes'
import SelectChannelDialog from 'kachery-react/components/SelectChannel/SelectChannelDialog'
import { useVisible } from 'labbox-react'
import React, { FunctionComponent } from 'react'
import ChannelSection from './ChannelSection'
import './Home.css'
import IntroSection from './IntroSection'
import WorkspaceSection from './WorkspaceSection'

type Props = {
    
}

const hardCodedChannels = ['ccm'] as any as ChannelName[]

const Home: FunctionComponent<Props> = () => {
    const {visible: selectChannelVisible, show: showSelectChannel, hide: hideSelectChannel} = useVisible()

    return (
        <span>
            
            <IntroSection />
            <ChannelSection onSelectChannel={showSelectChannel} />
            <WorkspaceSection />
            
            <SelectChannelDialog
                visible={selectChannelVisible}
                onClose={hideSelectChannel}
                hardCodedChannels={hardCodedChannels}
            />
        </span>
    )
}

export default Home