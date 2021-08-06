import { FigurlPlugin } from 'figurl/types'
import { useWindowDimensions } from '..'
import { HomePageProps } from '../HomePage/HomePage'
import React, { useCallback } from 'react'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useRoute from './useRoute'
import { RecentFigure, RecentFigures, RecentFiguresAction } from 'figurl/RecentFigures'
import { useHistory, useLocation } from 'react-router-dom'

type Props = {
    packageName: string
    logo?: any
    plugins: FigurlPlugin[]
    homePageProps: HomePageProps
    recentFigures: RecentFigures
    recentFiguresDispatch: (a: RecentFiguresAction) => void
}

const MainWindow: React.FunctionComponent<Props> = ({packageName, logo, plugins, homePageProps, recentFiguresDispatch}) => {
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
                    plugins={plugins}
                    homePageProps={{...homePageProps, onOpenFigure: handleOpenFigure}}
                    recentFiguresDispatch={recentFiguresDispatch}
                />
            </div>
        </div>
    )
}

export default MainWindow