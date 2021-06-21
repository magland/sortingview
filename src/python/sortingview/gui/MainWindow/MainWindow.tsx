import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import { useWindowDimensions } from 'labbox-react'
import packageName from '../packageName'
import useRoute from '../route/useRoute'
import Routes from './Routes'
import ApplicationBar from './ApplicationBar/ApplicationBar'

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
                title={packageName}
                onHome = {handleHome}
            />
            <div style={{margin: 'auto', maxWidth: 1200}}>
                <Routes
                    width={width - 20}
                    height = {height - 100}
                />
            </div>
        </div>
    )
}

export default MainWindow