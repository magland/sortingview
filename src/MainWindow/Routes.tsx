import React from 'react'
import { FunctionComponent } from "react"
import Home from '../pages/Home/Home'
import MountainView from '../pages/MountainView/MountainView'
import useRoute from '../route/useRoute'
import SelectRecordingSorting from './SelectRecordingSorting'

type Props = {
    width: number
    height: number
}

const Routes: FunctionComponent<Props> = ({width, height}) => {
    const {routePath, recordingUri, sortingUri, backendUri, setRoute} = useRoute()

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if ((routePath === '/mountainview') && (recordingUri) && (sortingUri)) {
        return (
            <MountainView
                recordingUri={recordingUri}
                sortingUri={sortingUri}
                width={width}
                height={height}
            />
        )
    }
    else if (routePath === '/selectData') {
        return (
            <SelectRecordingSorting
                onUpdated={() => {setRoute({routePath: '/mountainview'})}}
            />
        )
    }
    else {
        return <Home />
    }
}

export default Routes