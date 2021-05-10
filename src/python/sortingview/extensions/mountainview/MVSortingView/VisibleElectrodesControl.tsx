import { Button, Radio } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { RecordingInfo, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";

type Props = {
    recordingInfo: RecordingInfo
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const VisibleElectrodesControl: FunctionComponent<Props> = ({ recordingInfo, selection, selectionDispatch }) => {
    const [mode, setMode] = useState<'all' | 'custom'>('all')
    const [customElectrodeIds, setCustomElectrodeIds] = useState<number[]>([])
    const { selectedElectrodeIds } = selection

    const handleModeAll = useCallback(() => {
        setMode('all')
    }, [setMode])
    const handleModeCustom = useCallback(() => {
        setMode('custom')
    }, [setMode])
    useEffect(() => {
        const includeElectrode = (eid: number) => {
            switch(mode) {
                case 'all': return true
                case 'custom': return customElectrodeIds.includes(eid)
                default: throw Error('Unexpected mode')
            }
        }
        const visibleElectrodeIds = (recordingInfo?.channel_ids || []).filter(eid => includeElectrode(eid))
        selectionDispatch({type: 'SetVisibleElectrodeIds', visibleElectrodeIds})
    }, [recordingInfo, selectionDispatch, mode, customElectrodeIds])
    const handleRestrictToSelected = useCallback(() => {
        setMode('custom')
        setCustomElectrodeIds(selectedElectrodeIds || [])
    }, [selectedElectrodeIds, setMode, setCustomElectrodeIds])

    const hasSelection = useMemo(() => ((selectedElectrodeIds || []).length > 0), [selectedElectrodeIds])

    return (
        <div>
            <span style={{whiteSpace: 'nowrap'}}><Radio checked={mode === 'all'} onClick={handleModeAll}/> Show all</span>
            <span style={{whiteSpace: 'nowrap'}}><Radio checked={mode === 'custom'} onClick={handleModeCustom} /> Show custom</span>
            <Button disabled={!hasSelection} onClick={handleRestrictToSelected}>Restrict to selected</Button>
        </div>
    )
}

export default VisibleElectrodesControl