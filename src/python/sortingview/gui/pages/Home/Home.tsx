import { ChannelName } from 'kachery-js/types/kacheryTypes'
import SelectChannelDialog from 'kachery-react/components/SelectChannel/SelectChannelDialog'
import { useVisible } from 'labbox-react'
import React, { FunctionComponent } from 'react'
import ChannelSection from './ChannelSection'
import './Home.css'
import IntroSection from './IntroSection'
import WorkspaceSection from './WorkspaceSection'
import '../../commonComponents/localStyles.css'

type Props = {
    
}

const hardCodedChannels = ['ccm'] as any as ChannelName[]

const Home: FunctionComponent<Props> = () => {
    const {visible: selectChannelVisible, show: showSelectChannel, hide: hideSelectChannel} = useVisible()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection />
            <ChannelSection onSelectChannel={showSelectChannel} />
            <WorkspaceSection />
            
            <SelectChannelDialog
                visible={selectChannelVisible}
                onClose={hideSelectChannel}
                hardCodedChannels={hardCodedChannels}
            />
        </div>
    )
}

export default Home