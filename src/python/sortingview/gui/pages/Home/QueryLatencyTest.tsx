import { Button } from '@material-ui/core'
import { nowTimestamp, Timestamp } from 'kachery-js/types/kacheryTypes'
import { useChannel, useKacheryNode } from 'kachery-react'
import runQueryTaskAsync from 'kachery-react/runQueryTaskAsync'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'

type Props = {
    
}

const QueryLatencyTest: FunctionComponent<Props> = () => {
    const [testCode, setTestCode] = useState<number>(0)
    const incrementTestCode = useCallback(() => setTestCode(c => (c + 1)), [])
    const [timeStarted, setTimeStarted] = useState<Timestamp | undefined>(undefined)
    const [timeFinished, setTimeFinished] = useState<Timestamp | undefined>(undefined)
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const elapsedSec = useMemo(() => {
        if (!timeStarted) return undefined
        if (!timeFinished) return undefined
        return (Number(timeFinished) - Number(timeStarted)) / 1000
    }, [timeStarted, timeFinished])
    const handleStartLatencyTest = useCallback(() => {
        incrementTestCode()
    }, [incrementTestCode])

    useEffect(() => {
        if (testCode === 0) return
        let canceled = false
        ;(async () => {
            if (canceled) return
            setTimeStarted(nowTimestamp())
            if (canceled) return
            setTimeFinished(undefined)
            if (canceled) return
            setErrorMsg(undefined)
            if (canceled) return
            let result: any
            try {
                result = await runQueryTaskAsync(kacheryNode, 'latency_test_query.1', {x: 'test1'}, {channelName, useCache: false})
            }
            catch(err) {
                if (canceled) return
                setErrorMsg(err.message)
                return
            }
            if (canceled) return
            if (result === 'test1') {
                setTimeFinished(nowTimestamp)
            }
            else {
                setErrorMsg(`Unexpected result of query: ${result}`)
            }
        })()
        return () => {
            canceled = true
        }
    }, [testCode, channelName, kacheryNode])

    if ((!timeStarted) || (errorMsg)) {
        return (
            <div>
                {
                    errorMsg && (
                        <p style={{color: 'red'}}>{errorMsg}</p>
                    )
                }
                <Button onClick={handleStartLatencyTest}>Start latency test</Button>
            </div>
        )
    }
    else if ((timeStarted) && (!timeFinished) && (!errorMsg)) {
        return (
            <div>
                <p>Running test: {testCode}</p>
                <Button onClick={handleStartLatencyTest}>Restart latency test</Button>
            </div>
        )
    }
    else if ((timeStarted) && (timeFinished)) {
        return (
            <div>
                <p>Elapsed for task (sec): {elapsedSec}</p>
                <Button onClick={handleStartLatencyTest}>Rerun latency test</Button>
            </div>
        )
    }
    else return <div>x</div>
}

export default QueryLatencyTest