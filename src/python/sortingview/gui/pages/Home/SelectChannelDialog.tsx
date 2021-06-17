import React, { FunctionComponent } from 'react'
import ModalWindow from '../../labbox/ApplicationBar/ModalWindow'
import SelectChannel from './SelectChannel'

const SelectChannelDialog: FunctionComponent<{visible: boolean, onClose: () => void}> = ({visible, onClose}) => {
    return (
        <ModalWindow
            open={visible}
            onClose={onClose}
        >
            <SelectChannel
                onClose={onClose}
            />
        </ModalWindow>
    )
}

export default SelectChannelDialog