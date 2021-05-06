import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import ApplicationBar from '../reusable/ApplicationBar/ApplicationBar'
import SelectRecordingSorting from './SelectRecordingSorting'
import useRoute from '../route/useRoute'
import Hyperlink from '../reusable/common/Hyperlink'
import MountainView from '../MountainView/MountainView'

type Props = {
}

// Thanks: https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
//////////////////////////////////////////////////////////////////////////////////////////////////

const MainWindow: FunctionComponent<Props> = () => {
    const {recordingUri, sortingUri} = useRoute()

    const {width, height} = useWindowDimensions()

    const [selectingRecordingSorting, setSelectingRecordingSorting] = useState<boolean>(false)
    const handleSelectRecordingSorting = useCallback(() => {
        setSelectingRecordingSorting(true)
    }, [])

    return (
        <div style={{margin: 0}}>
            <ApplicationBar
                onHome = {handleSelectRecordingSorting}
            />
            <div style={{margin: 10}}>
                {
                    (!recordingUri) || (!sortingUri) || (selectingRecordingSorting) ? (
                        <SelectRecordingSorting onUpdated={() => {setSelectingRecordingSorting(false)}} />
                    ) : (
                        <div>
                            <MountainView
                                recordingUri={recordingUri}
                                sortingUri={sortingUri}
                                width={width - 20}
                                height={height - 100}
                            />
                            {/* <Hyperlink onClick={handleSelectRecordingSorting}>Select a different recording/sorting</Hyperlink> */}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default MainWindow