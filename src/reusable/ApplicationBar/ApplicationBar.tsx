import { AppBar, Toolbar } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import BackendProviderControl from './BackendProviderControl';
import BackendProviderView from './BackendProviderView';
import ModalWindow from './ModalWindow';

const appBarHeight = 50

type Props = {
    logo?: any
}

const homeButtonStyle: React.CSSProperties = {
    paddingBottom: 0, color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold',
    cursor: 'pointer'
}

const useModalDialog = () => {
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

const ApplicationBar: FunctionComponent<Props> = ({ logo }) => {
    const handleHome = useCallback(() => {
        // todo
    }, [])


    const {visible: backendProviderVisible, handleOpen: openBackendProvider, handleClose: closeBackendProvider} = useModalDialog()


    return (
        <span>
            <AppBar position="static" style={{height: appBarHeight, color: 'white'}}>
                <Toolbar>
                {
                    logo && (<img src={logo} className="App-logo" alt="logo" height={30} style={{paddingBottom: 5, cursor: 'pointer'}} onClick={handleHome} />)
                }
                &nbsp;&nbsp;&nbsp;<div style={homeButtonStyle} onClick={handleHome}>Sorting view</div>
                <span style={{marginLeft: 'auto'}} />
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <BackendProviderControl onOpen={openBackendProvider} color={'white'} />
                </span>
                </Toolbar>
            </AppBar>
            <ModalWindow
                open={backendProviderVisible}
                onClose={closeBackendProvider}
            >
                <span>
                    <BackendProviderView
                        onClose={closeBackendProvider}
                    />
                </span>
            </ModalWindow>
        </span>
    )
}

export default ApplicationBar