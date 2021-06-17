import React from 'react'
import { FunctionComponent } from "react"
import Home from '../pages/Home/Home'
import WorkspacePage from '../pages/WorkspacePage/WorkspacePage'
import useRoute from '../route/useRoute'
import SelectWorkspace from './SelectWorkspace'

type Props = {
    width: number
    height: number
}

const Routes: FunctionComponent<Props> = ({width, height}) => {
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
            />
        )
    }
    else if (((routePath === '/workspace') || (routePath.startsWith('/workspace/'))) && (workspaceUri)) {
        return (
            <WorkspacePage
                width={width}
                height={height}
            />
        )
    }
    else {
        return <Home />
    }
}

export default Routes