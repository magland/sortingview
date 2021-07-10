import { AppBar, Button, Toolbar } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import ChannelControl from 'kachery-react/components/SelectChannel/ChannelControl';
import ModalWindow from 'labbox-react/components/ModalWindow/ModalWindow'
import TaskMonitorControl from 'kachery-react/components/TaskMonitor/TaskMonitorControl'
import TaskMonitor from 'kachery-react/components/TaskMonitor/TaskMonitor'
import SelectChannel from 'kachery-react/components/SelectChannel/SelectChannel';
import { useGoogleSignInClient, useSignedIn } from 'labbox-react';
import useRoute from '../useRoute';

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

    const client = useGoogleSignInClient()
    const gapi = client?.gapi
    const {setRoute} = useRoute()

    const signedIn = useSignedIn()
    const handleLogin = useCallback(() => {
        gapi.auth2.getAuthInstance().signIn();
    }, [gapi])
    const handleLogout = useCallback(() => {
        gapi.auth2.getAuthInstance().signOut()
        setRoute({routePath: '/home'})
    }, [gapi, setRoute])

    return (
        <span>
            <AppBar position="static" style={{height: appBarHeight, color: 'white'}}>
                <Toolbar>
                {
                    logo && (<img src={logo} alt="logo" height={30} style={{paddingBottom: 5, cursor: 'pointer'}} onClick={onHome} />)
                }
                &nbsp;&nbsp;&nbsp;<div style={homeButtonStyle} onClick={onHome}>{title}</div>
                <span style={{marginLeft: 'auto'}} />
                {
                    client && (
                        signedIn && (
                            <span style={{fontFamily: 'courier', color: 'lightgray'}}>{client.userId}</span>
                        )
                    )
                }
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <ChannelControl onOpen={openChannel} color={'white'} />
                </span>
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <TaskMonitorControl onOpen={openTaskMonitor} color="white" />
                </span>
                {
                    client && (
                        signedIn ? (
                            <Button color="inherit" onClick={handleLogout}>Sign out</Button>
                        ) : (
                            <Button color="inherit" onClick={handleLogin}>Sign in</Button>
                        )
                    )
                }
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