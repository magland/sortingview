import React, { FunctionComponent } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'
import SelectWorkspace from './SelectWorkspace'
import useRoute from './useRoute'

type Props = {
    width: number
    height: number
    homePageProps: HomePageProps
}

const Routes: FunctionComponent<Props & {children: JSX.Element}> = (props) => {
    const {width, height, homePageProps} = props
    const {routePath, workspaceUri, setRoute} = useRoute()

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if (routePath === '/selectWorkspace') {
        return (
            <SelectWorkspace
                onUpdated={() => {setRoute({routePath: '/workspace'})}}
                width={width}
                height={height}
                packageName={homePageProps.packageName}
            />
        )
    }
    else if (((routePath === '/workspace') || (routePath.startsWith('/workspace/'))) && (workspaceUri)) {
        return (
            props.children
        )
    }
    else {
        return <HomePage {...homePageProps} />
    }
}

export default Routes