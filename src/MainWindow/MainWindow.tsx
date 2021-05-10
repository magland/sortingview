import React, { useCallback, useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import ApplicationBar from '../reusable/ApplicationBar/ApplicationBar'
import useRoute from '../route/useRoute'
import Routes from './Routes'

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
    const {setRoute} = useRoute()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    return (
        <div style={{margin: 0}}>
            <ApplicationBar
                onHome = {handleHome}
            />
            <div style={{margin: 10}}>
                <Routes
                    width={width - 20}
                    height = {height - 100}
                />
            </div>
        </div>
    )
}

export default MainWindow