import React, { FunctionComponent } from 'react'
import ModalWindow from '../ApplicationBar/ModalWindow'
import SelectBackendProvider from './SelectBackendProvider'

const SelectBackgroundProviderDialog: FunctionComponent<{visible: boolean, onClose: () => void}> = ({visible, onClose}) => {
    return (
        <ModalWindow
            open={visible}
            onClose={onClose}
        >
            <SelectBackendProvider
                onClose={onClose}
            />
        </ModalWindow>
    )
}

export default SelectBackgroundProviderDialog