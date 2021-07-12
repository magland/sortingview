import { ChannelName, TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import { useChannel } from 'kachery-react'
import SelectChannelDialog from 'kachery-react/components/SelectChannel/SelectChannelDialog'
import { useVisible } from 'labbox-react'
import React, { FunctionComponent } from 'react'
import ChannelSection from './ChannelSection'
import './Home.css'
import IntroSection from './IntroSection'
import './localStyles.css'
import TestResponsivenessSection from './TestResponsivenessSection'
import WorkspaceSection from './WorkspaceSection'

export type HomePageProps = {
    taskFunctionIds: TaskFunctionId[]
    introMd: string
    packageName: string
    workspaceDescription: string
    pythonProjectVersion: string
    webAppProjectVersion: string
    repoUrl: string
}

const hardCodedChannels = ['ccm'] as any as ChannelName[]

const HomePage: FunctionComponent<HomePageProps> = ({taskFunctionIds, introMd, workspaceDescription, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl}) => {
    const selectChannelVisibility = useVisible()
    const {channelName} = useChannel()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection introMd={introMd} />
            <ChannelSection onSelectChannel={selectChannelVisibility.show} taskFunctionIds={taskFunctionIds} packageName={packageName} />
            <WorkspaceSection
                packageName={packageName}
                workspaceDescription={workspaceDescription}
            />
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