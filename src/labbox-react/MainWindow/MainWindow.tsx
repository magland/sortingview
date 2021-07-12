import { useWindowDimensions } from 'labbox-react'
import { HomePageProps } from 'labbox-react/HomePage/HomePage'
import React, { useCallback } from 'react'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useRoute from './useRoute'

type Props = {
    logo?: any
    homePageProps: HomePageProps
}

const MainWindow: React.FunctionComponent<Props & {children: JSX.Element}> = ({logo, children, homePageProps}) => {
    const {setRoute} = useRoute()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    const workspaceChild = children

    return (
        <div>
            <ApplicationBar
                title={homePageProps.packageName}
                onHome={handleHome}
                logo={logo}
            />
            <div>
                <Routes
                    width={width}
                    height={height}
                    homePageProps={homePageProps}
                >
                    <workspaceChild.type
                        {...workspaceChild.props}
                        width={width - 20}
                        height = {height - 70}
                    />
                </Routes>
            </div>
        </div>
    )
}

export default MainWindow