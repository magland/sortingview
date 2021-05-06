import React, { useCallback, useState } from 'react'
import { FunctionComponent } from "react"
import ApplicationBar from '../reusable/ApplicationBar/ApplicationBar'
import SelectRecordingSorting from './SelectRecordingSorting'
import useRoute from '../route/useRoute'
import Hyperlink from '../reusable/common/Hyperlink'

type Props = {
    
}

const MainWindow: FunctionComponent<Props> = () => {
    const {recordingUri, sortingUri} = useRoute()

    const [selectingRecordingSorting, setSelectingRecordingSorting] = useState<boolean>(false)
    const handleChangeRecordingSorting = useCallback(() => {
        setSelectingRecordingSorting(true)
    }, [])

    return (
        <div style={{margin: 0}}>
            <ApplicationBar />
            <div style={{margin: 10}}>
                {
                    ((!recordingUri) && (!sortingUri)) || (selectingRecordingSorting) ? (
                        <SelectRecordingSorting onUpdated={() => {setSelectingRecordingSorting(false)}} />
                    ) : (
                        <div>
                            <Hyperlink onClick={handleChangeRecordingSorting}>Select a different recording/sorting</Hyperlink>
                            <div>
                                {recordingUri} {sortingUri}
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default MainWindow