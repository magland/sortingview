import { TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import { useWindowDimensions } from 'labbox-react'
import React, { useCallback } from 'react'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useRoute from './useRoute'

type Props = {
    packageName: string
    logo?: any
    taskFunctionIds: TaskFunctionId[]
}

const MainWindow: React.FunctionComponent<Props & {children: JSX.Element}> = ({logo, packageName, taskFunctionIds, children}) => {
    const {setRoute} = useRoute()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    const workspaceChild = children

    return (
        <div>
            <ApplicationBar
                title={packageName}
                onHome={handleHome}
                logo={logo}
            />
            <div>
                <Routes
                    taskFunctionIds={taskFunctionIds}
                    width={width}
                    height={height}
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