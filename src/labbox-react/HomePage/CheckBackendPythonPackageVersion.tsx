import { useChannel, useQueryTask } from 'kachery-react'
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView'
import React, { FunctionComponent } from 'react'

type Props = {
    packageName: string
}

const CheckBackendPythonPackageVersion: FunctionComponent<Props> = ({packageName}) => {
    const {channelName} = useChannel()

    const {returnValue: version, task} = useQueryTask<string>(`${packageName}_get_python_package_version.1`, {}, {channelName, useCache: false})
    if (!channelName) return <span />
    if (!version) {
        if ((task) && (task.status === 'waiting')) {
            return <span />
        }
        else return <TaskStatusView label="Checking backend package version" task={task} />
    }
    return (
        <div>
            Backend package version: {packageName} {version}
        </div>
    )
}

export default CheckBackendPythonPackageVersion