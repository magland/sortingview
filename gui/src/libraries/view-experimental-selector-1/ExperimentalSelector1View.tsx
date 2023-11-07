import { Button } from '@material-ui/core';
import { Hyperlink } from '../core-views';
import { NiceTable } from '../core-views';
import { NiceTableColumn, NiceTableRow } from '../core-views';
import { FunctionComponent, useCallback, useContext, useMemo, useState } from 'react';
import { ExperimentalSelector1ViewData } from './ExperimentalSelector1ViewData';
import { TimeseriesSelectionContext } from '../timeseries-views';

type Props = {
    data: ExperimentalSelector1ViewData
    width: number
    height: number
}

const columns: NiceTableColumn[] = [
    {
        key: 'name',
        label: 'Name'
    },
    {
        key: 'time',
        label: 'Time'
    }
]

const ExperimentalSelector1View: FunctionComponent<Props> = ({data, width, height}) => {
    const {timeseriesSelection, timeseriesSelectionDispatch} = useContext(TimeseriesSelectionContext)
    const {currentTimeSec} = timeseriesSelection
    const [savedTimes, setSavedTimes] = useState<number[]>([])

    const rows: NiceTableRow[] = useMemo(() => {
        return savedTimes.map((t, i) => (
            {
                key: `${i}`,
                columnValues: {
                    name: `${i}`,
                    time: {
                        element: <Hyperlink onClick={() => timeseriesSelectionDispatch({type: 'setFocusTime', currentTimeSec: t})}>{t}</Hyperlink>
                    }
                }
            }
        ))
    }, [savedTimes, timeseriesSelectionDispatch])

    const handleAdd = useCallback(() => {
        currentTimeSec !== undefined && setSavedTimes(x => ([...x, currentTimeSec]))
    }, [currentTimeSec])

    const handleDelete = useCallback((key: string) => {
        const i = parseInt(key)
        setSavedTimes(x => [...x.slice(0, i), ...x.slice(i + 1)])
    }, [])

    const handleExport = useCallback(() => {
        const savedTimesJson = JSON.stringify(savedTimes)
        download('saved-times.json', savedTimesJson)
    }, [savedTimes])

    return (
        <div style={{margin: 20}}>
            Selected time (sec): {currentTimeSec !== undefined ? currentTimeSec : 'undefined'}
            <Button disabled={currentTimeSec === undefined} onClick={handleAdd}>Add selected time</Button>
            <hr />
            <NiceTable
                rows={rows}
                columns={columns}
                onDeleteRow={handleDelete}
            />
            <hr />
            <Button onClick={handleExport}>Export times</Button>
        </div>
    )
}

// thanks: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

export default ExperimentalSelector1View