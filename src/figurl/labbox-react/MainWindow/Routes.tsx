import { RecentFiguresAction } from 'figurl/RecentFigures'
import { FigureObject } from 'figurl/types'
import { isFeedId } from 'kachery-js/types/kacheryTypes'
import React, { FunctionComponent, useEffect } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'
import Figure from './Figure'
import SelectWorkspace from './SelectWorkspace'
import useRoute from './useRoute'

type Props = {
    packageName: string
    width: number
    height: number
    homePageProps: HomePageProps
    recentFiguresDispatch: (a: RecentFiguresAction) => void
}

const Routes: FunctionComponent<Props> = (props) => {
    const {packageName, width, height, homePageProps, recentFiguresDispatch} = props
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
        else if (routePath.startsWith('/workspace/recording/')) {
            // const a = routePath.split('/')
            // const recordingId = a[3]
            const w = query.workspace
            if (!isFeedId(w)) return
            const workspaceUri = `workspace://${w}`
            const figureObject: FigureObject = {
                type: 'sortingview.workspace.1',
                data: {
                    workspaceUri
                }
            }
            setRoute({routePath: `/fig`, figureObjectOrHash: figureObject})
        }
        else if (routePath + '' === '/workspace') {
            const w = query.workspace
            if (!isFeedId(w)) return
            const workspaceUri = `workspace://${w}`
            const figureObject: FigureObject = {
                type: 'sortingview.workspace.1',
                data: {
                    workspaceUri
                }
            }
            setRoute({routePath: `/fig`, figureObjectOrHash: figureObject})
        }
    }, [routePath, query, setRoute])

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if (routePath === '/selectWorkspace') {
        return (
            <SelectWorkspace
                width={width}
                height={height}
                packageName={homePageProps.packageName}
            />
        )
    }
    else if (routePath === '/fig') {
        return (
            <Figure
                packageName={packageName}
                figureObjectOrHash={figureObjectOrHash}
                width={width}
                height={height}
                recentFiguresDispatch={recentFiguresDispatch}
            />
        )
    }
    else {
        return <HomePage {...homePageProps} />
    }
}

export default Routes