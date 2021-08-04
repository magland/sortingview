import { FigurlPlugin } from 'figurl/types'
import { useWindowDimensions } from 'labbox-react'
import { HomePageProps } from 'labbox-react/HomePage/HomePage'
import React, { useCallback } from 'react'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useRoute from './useRoute'

type Props = {
    packageName: string
    logo?: any
    plugins: FigurlPlugin[]
    homePageProps: HomePageProps
}

const MainWindow: React.FunctionComponent<Props> = ({packageName, logo, plugins, homePageProps}) => {
    const {setRoute} = useRoute()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

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
                    homePageProps={homePageProps}
                />
            </div>
        </div>
    )
}

export default MainWindow