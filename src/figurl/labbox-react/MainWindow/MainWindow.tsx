import { RecentFigure, RecentFigures, RecentFiguresAction } from 'figurl/RecentFigures'
import React, { useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useWindowDimensions } from '..'
import { HomePageProps } from '../HomePage/HomePage'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useRoute from './useRoute'

type Props = {
    packageName: string
    logo?: any
    homePageProps: HomePageProps
    recentFigures: RecentFigures
    recentFiguresDispatch: (a: RecentFiguresAction) => void
}

const MainWindow: React.FunctionComponent<Props> = ({packageName, logo, homePageProps, recentFiguresDispatch}) => {
    const {setRoute} = useRoute()
    const {width, height} = useWindowDimensions()
    const location = useLocation()
    const history = useHistory()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    const handleOpenFigure = useCallback((recentFigure: RecentFigure) => {
        history.push({...location, ...recentFigure.location})
    }, [location, history])

    return (
        <div>
            <ApplicationBar
                title={homePageProps.packageName}
                onHome={handleHome}
                logo={logo}
            />
            <div>
                <Routes
                    packageName={packageName}
                    width={width}
                    height={height - 50}
                    homePageProps={{...homePageProps, onOpenFigure: handleOpenFigure}}
                    recentFiguresDispatch={recentFiguresDispatch}
                />
            </div>
        </div>
    )
}

export default MainWindow