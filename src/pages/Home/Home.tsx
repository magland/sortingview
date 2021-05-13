import React from 'react'
import { FunctionComponent } from "react"
import { SelectBackendProviderDialog, useVisible } from '../../python/sortingview/gui/labbox'
import './Home.css'
import SignInSection from './SignInSection'
import BackendProviderSection from './BackendProviderSection'
import IntroSection from './IntroSection'
import WorkspaceSection from './WorkspaceSection'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    const {visible: selectBackendProviderVisible, show: showSelectBackendProvider, hide: hideSelectBackendProvider} = useVisible()

    return (
        <span>
            
            <IntroSection />
            <SignInSection />
            <BackendProviderSection onSelectBackendProvider={showSelectBackendProvider} />
            <WorkspaceSection />
            
            <SelectBackendProviderDialog visible={selectBackendProviderVisible} onClose={hideSelectBackendProvider} />
        </span>
    )
}

export default Home