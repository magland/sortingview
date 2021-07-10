import { ChannelName, TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import { useChannel } from 'kachery-react'
import SelectChannelDialog from 'kachery-react/components/SelectChannel/SelectChannelDialog'
import { useVisible } from 'labbox-react'
import packageName from 'python/sortingview/gui/packageName'
import { pythonProjectVersion, webAppProjectVersion } from 'python/sortingview/gui/version'
import React, { FunctionComponent } from 'react'
import './localStyles.css'
import ChannelSection from './ChannelSection'
import './Home.css'
import IntroSection from './IntroSection'
import TestResponsivenessSection from './TestResponsivenessSection'
import WorkspaceSection from './WorkspaceSection'

type Props = {
    taskFunctionIds: TaskFunctionId[]
}

const hardCodedChannels = ['ccm'] as any as ChannelName[]

const HomePage: FunctionComponent<Props> = ({taskFunctionIds}) => {
    const selectChannelVisibility = useVisible()
    const {channelName} = useChannel()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection />
            <ChannelSection onSelectChannel={selectChannelVisibility.show} taskFunctionIds={taskFunctionIds} />
            <WorkspaceSection />
            {
                channelName && <TestResponsivenessSection />
            }
            <span>
                <hr />
                <p style={{fontFamily: 'courier', color: 'gray'}}>Python package version: {packageName} {pythonProjectVersion} | GUI version: {webAppProjectVersion} | <a href="https://github.com/magland/sortingview" rel="noreferrer" target="_blank">View on GitHub</a></p>
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