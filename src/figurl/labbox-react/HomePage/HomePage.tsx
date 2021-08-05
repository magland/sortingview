import { useChannel } from 'figurl/kachery-react'
import SelectChannelDialog from 'figurl/kachery-react/components/SelectChannel/SelectChannelDialog'
import { ChannelName, TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import React, { FunctionComponent } from 'react'
import { useVisible } from '..'
import ChannelSection from './ChannelSection'
import './Home.css'
import IntroSection from './IntroSection'
import './localStyles.css'
import TestResponsivenessSection from './TestResponsivenessSection'

export type HomePageProps = {
    taskFunctionIds: TaskFunctionId[]
    introMd: string
    packageName: string
    pythonProjectVersion: string
    webAppProjectVersion: string
    repoUrl: string
}

const hardCodedChannels = ['ccm'] as any as ChannelName[]

const HomePage: FunctionComponent<HomePageProps> = ({taskFunctionIds, introMd, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl}) => {
    const selectChannelVisibility = useVisible()
    const {channelName} = useChannel()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection introMd={introMd} />
            <ChannelSection onSelectChannel={selectChannelVisibility.show} taskFunctionIds={taskFunctionIds} packageName={packageName} />
            {
                channelName && <TestResponsivenessSection />
            }
            <span>
                <hr />
                <p style={{fontFamily: 'courier', color: 'gray'}}>Python package version: {packageName} {pythonProjectVersion} | GUI version: {webAppProjectVersion} | <a href={repoUrl} rel="noreferrer" target="_blank">View project source code</a></p>
            </span>
            
            <SelectChannelDialog
                visible={selectChannelVisibility.visible}
                onClose={selectChannelVisibility.hide}
                hardCodedChannels={hardCodedChannels}
            />
        </div>
    )
}

export default HomePage