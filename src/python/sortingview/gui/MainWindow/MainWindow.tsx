import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import { useWindowDimensions } from 'labbox-react'
import packageName from '../packageName'
import useRoute from '../route/useRoute'
import Routes from './Routes'
import ApplicationBar from './ApplicationBar/ApplicationBar'

type Props = {
    logo?: any
}

const MainWindow: FunctionComponent<Props> = ({logo}) => {
    const {setRoute} = useRoute()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    return (
        <div>
            <ApplicationBar
                title={packageName}
                onHome={handleHome}
                logo={logo}
            />
            <div>
                <Routes
                    width={width - 20}
                    height = {height - 70}
                />
            </div>
        </div>
    )
}

export default MainWindow