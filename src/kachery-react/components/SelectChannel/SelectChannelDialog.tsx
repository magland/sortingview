import React, { FunctionComponent } from 'react'
import ModalWindow from 'labbox-react/components/ModalWindow/ModalWindow'
import SelectChannel from './SelectChannel'
import { ChannelName } from 'kachery-js/types/kacheryTypes'

const SelectChannelDialog: FunctionComponent<{visible: boolean, hardCodedChannels?: ChannelName[], onClose: () => void}> = ({visible, hardCodedChannels, onClose}) => {
    return (
        <ModalWindow
            open={visible}
            onClose={onClose}
        >
            <SelectChannel
                onClose={onClose}
                hardCodedChannels={hardCodedChannels}
            />
        </ModalWindow>
    )
}

export default SelectChannelDialog