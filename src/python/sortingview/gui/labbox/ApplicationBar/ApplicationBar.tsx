import { AppBar, Toolbar } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import ChannelControl from './ChannelControl';
import ModalWindow from './ModalWindow';
import TaskMonitorControl from './TaskMonitor/TaskMonitorControl'
import TaskMonitor from './TaskMonitor/TaskMonitor'
import SelectChannel from '../../pages/Home/SelectChannel';

const appBarHeight = 50

type Props = {
    title: string
    logo?: any
    onHome?: () => void
}

const homeButtonStyle: React.CSSProperties = {
    paddingBottom: 0, color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold',
    cursor: 'pointer'
}

export const useModalDialog = () => {
    const [visible, setVisible] = useState<boolean>(false)
    const handleOpen = useCallback(() => {
        setVisible(true)
    }, [])
    const handleClose = useCallback(() => {
        setVisible(false)
    }, [])
    return useMemo(() => ({
        visible,
        handleOpen,
        handleClose
    }), [visible, handleOpen, handleClose])
}

const ApplicationBar: FunctionComponent<Props> = ({ title, logo, onHome }) => {
    const {visible: channelVisible, handleOpen: openChannel, handleClose: closeChannel} = useModalDialog()
    const {visible: taskMonitorVisible, handleOpen: openTaskMonitor, handleClose: closeTaskMonitor} = useModalDialog()

    return (
        <span>
            <AppBar position="static" style={{height: appBarHeight, color: 'white'}}>
                <Toolbar>
                {
                    logo && (<img src={logo} className="App-logo" alt="logo" height={30} style={{paddingBottom: 5, cursor: 'pointer'}} onClick={onHome} />)
                }
                &nbsp;&nbsp;&nbsp;<div style={homeButtonStyle} onClick={onHome}>{title}</div>
                <span style={{marginLeft: 'auto'}} />
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <ChannelControl onOpen={openChannel} color={'white'} />
                </span>
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <TaskMonitorControl onOpen={openTaskMonitor} color="white" />
                </span>
                </Toolbar>
            </AppBar>
            <ModalWindow
                open={channelVisible}
                onClose={closeChannel}
            >
                <SelectChannel
                    onClose={closeChannel}
                />
            </ModalWindow>
            <ModalWindow
                open={taskMonitorVisible}
                onClose={closeTaskMonitor}
            >
                <TaskMonitor
                    onClose={closeTaskMonitor}
                />
            </ModalWindow>
        </span>
    )
}

export default ApplicationBar