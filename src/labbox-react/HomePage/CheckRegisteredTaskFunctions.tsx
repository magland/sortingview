import { RegisteredTaskFunction } from 'kachery-js/types/kacheryHubTypes'
import { ChannelName, TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import { useKacheryNode } from 'kachery-react'
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'

type Props = {
    channelName: ChannelName
    taskFunctionIds: TaskFunctionId[]
}

const CheckRegisteredTaskFunctions: FunctionComponent<Props> = ({channelName, taskFunctionIds}) => {
    const kacheryNode = useKacheryNode()
    const [registeredTaskFunctions, setRegisteredTaskFunctions] = useState<RegisteredTaskFunction[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const [probing, setProbing] = useState<boolean>(false)
    const incrementRefreshCode = useCallback(() => setRefreshCode(c => (c + 1)), [])
    useEffect(() => {
        const update = () => {
            const A: RegisteredTaskFunction[] = []
            for (let id of taskFunctionIds) {
                const a = kacheryNode.kacheryHubInterface().getRegisteredTaskFunction(channelName, id)
                if (a) {
                    A.push(a.registeredTaskFunction)
                }
            }
            setRegisteredTaskFunctions(A)
        }
        const {cancel} = kacheryNode.kacheryHubInterface().onRegisteredTaskFunctionsChanged(() => {
            update()
        })
        update()
        kacheryNode.kacheryHubInterface().probeTaskFunctionsFromChannel({channelName, taskFunctionIds})
        let canceled = false
        setProbing(true)
        setTimeout(() => {
            if (canceled) return
            setProbing(false)
        }, 5000)
        return () => {
            canceled = true
            cancel()
        }
    }, [kacheryNode, channelName, taskFunctionIds, refreshCode])

    const numRegistered = (registeredTaskFunctions || []).length

    const color = useMemo(() => {
        if (numRegistered === taskFunctionIds.length) {
            return 'darkgreen'
        }
        else if (taskFunctionIds.length > 0) {
            return 'darkred'
        }
        else return 'black'
    }, [numRegistered, taskFunctionIds.length])

    const handleRefresh = useCallback(() => {
        kacheryNode.kacheryHubInterface().clearRegisteredTaskFunctions()
        setRegisteredTaskFunctions(undefined)
        incrementRefreshCode()
    }, [incrementRefreshCode, kacheryNode])

    if ((!registeredTaskFunctions) || ((numRegistered === 0) && (probing))) return <span />
    if (numRegistered !== taskFunctionIds.length) {
        for (let id of taskFunctionIds) {
            if (!registeredTaskFunctions.map(a => (a.taskFunctionId)).includes(id)) {
                console.log(`Not registered: ${id}`)
            }
        }
    }
    return (
        <div>Task functions: <span style={{color}}>{numRegistered} of {taskFunctionIds.length} registered</span> <Hyperlink onClick={handleRefresh}>refresh</Hyperlink></div>
    )
}

export default CheckRegisteredTaskFunctions