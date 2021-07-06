import { Button } from '@material-ui/core'
import { FeedId, nowTimestamp, SubfeedHash, Timestamp } from 'kachery-js/types/kacheryTypes'
import { useChannel, useKacheryNode, useQueryTask, useSubfeed } from 'kachery-react'
import runQueryTaskAsync from 'kachery-react/runQueryTaskAsync'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'

type Props = {
    
}

const ActionLatencyTest: FunctionComponent<Props> = () => {
    const {channelName} = useChannel()
    const {returnValue: subfeedInfo} = useQueryTask<{feedId: FeedId, subfeedHash: SubfeedHash}>('get_action_latency_test_subfeed.1', {}, {channelName, useCache: true})

    const {messages: subfeedMessages} = useSubfeed({feedId: subfeedInfo ? subfeedInfo.feedId : undefined, subfeedHash: subfeedInfo ? subfeedInfo.subfeedHash : undefined })

    const [testCode, setTestCode] = useState<number>(0)
    const [result, setResult] = useState<{numMessages: number} | undefined>(undefined)
    const incrementTestCode = useCallback(() => setTestCode(c => (c + 1)), [])
    const [timeStarted, setTimeStarted] = useState<Timestamp | undefined>(undefined)
    const [timeFinished, setTimeFinished] = useState<Timestamp | undefined>(undefined)
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
    const kacheryNode = useKacheryNode()
    
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
            setResult(undefined)
            if (canceled) return
            setErrorMsg(undefined)
            if (canceled) return
            let result: any
            try {
                result = await runQueryTaskAsync<{numMessages: number}>(kacheryNode, 'subfeed_latency_test_append.1', {message: {a: 'test1'}}, {channelName, useCache: false})
            }
            catch(err) {
                if (canceled) return
                setErrorMsg(err.message)
                return
            }
            if (canceled) return
            setResult(result)
        })()
        return () => {
            canceled = true
        }
    }, [testCode, channelName, kacheryNode])

    useEffect(() => {
        if (!result) return
        if (!subfeedMessages) return
        if (!timeStarted) return
        if (subfeedMessages.length === result.numMessages) {
            setTimeFinished(nowTimestamp)
        }
    }, [subfeedMessages, result, timeStarted])

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
                <p>Elapsed (sec): {elapsedSec}</p>
                <Button onClick={handleStartLatencyTest}>Rerun latency test</Button>
            </div>
        )
    }
    else return <div>x</div>
}

export default ActionLatencyTest