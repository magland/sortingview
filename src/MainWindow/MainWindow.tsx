import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import { useWindowDimensions } from '../python/sortingview/gui/labbox'
import { ApplicationBar } from '../python/sortingview/gui/labbox'
import useRoute from '../route/useRoute'
import Routes from './Routes'

type Props = {
}

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