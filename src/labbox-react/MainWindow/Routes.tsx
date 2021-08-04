import { FigureObject, FigurlPlugin } from 'figurl/types'
import { isFeedId } from 'kachery-js/types/kacheryTypes'
import React, { FunctionComponent } from 'react'
import { useEffect } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'
import Figure from './Figure'
import useRoute from './useRoute'

type Props = {
    packageName: string
    plugins: FigurlPlugin[]
    width: number
    height: number
    homePageProps: HomePageProps
}

const Routes: FunctionComponent<Props> = (props) => {
    const {packageName, plugins, width, height, homePageProps} = props
    const {routePath, figureObjectOrHash, query, setRoute} = useRoute()

    useEffect(() => {
        // If we are receiving an old URL for a sorting, let's redirect to new figurl system
        if (routePath.startsWith('/workspace/sorting/')) {
            const a = routePath.split('/')
            const recordingId = a[3]
            const sortingId = a[4]
            const w = query.workspace
            if (!isFeedId(w)) return
            const workspaceUri = `workspace://${w}`
            const figureObject: FigureObject = {
                type: 'sortingview.mountainview.1',
                data: {
                    workspaceUri,
                    recordingId,
                    sortingId
                }
            }
            setRoute({routePath: `/fig`, figureObjectOrHash: figureObject})
        }
    }, [routePath, query, setRoute])

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if (routePath === '/fig') {
        return (
            <Figure
                packageName={packageName}
                plugins={plugins}
                figureObjectOrHash={figureObjectOrHash}
                width={width}
                height={height}
            />
        )
    }
    else {
        return <HomePage {...homePageProps} />
    }
}

export default Routes