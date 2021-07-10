import { TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import React, { FunctionComponent } from 'react'
import HomePage from '../HomePage/HomePage'
import SelectWorkspace from './SelectWorkspace'
import useRoute from './useRoute'

type Props = {
    width: number
    height: number
    taskFunctionIds: TaskFunctionId[]
}

const Routes: FunctionComponent<Props & {children: JSX.Element}> = (props) => {
    const {width, height, taskFunctionIds} = props
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
            props.children
        )
    }
    else {
        return <HomePage taskFunctionIds={taskFunctionIds} />
    }
}

export default Routes