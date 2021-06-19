import React from 'react'
import { FunctionComponent } from "react"
import { useVisible } from 'labbox-react'
import './Home.css'
import SignInSection from './SignInSection'
import ChannelSection from './ChannelSection'
import IntroSection from './IntroSection'
import WorkspaceSection from './WorkspaceSection'
import SelectChannelDialog from 'kachery-react/components/SelectChannel/SelectChannelDialog'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    const {visible: selectChannelVisible, show: showSelectChannel, hide: hideSelectChannel} = useVisible()

    return (
        <span>
            
            <IntroSection />
            <SignInSection />
            <ChannelSection onSelectChannel={showSelectChannel} />
            <WorkspaceSection />
            
            <SelectChannelDialog visible={selectChannelVisible} onClose={hideSelectChannel} />
        </span>
    )
}

export default Home