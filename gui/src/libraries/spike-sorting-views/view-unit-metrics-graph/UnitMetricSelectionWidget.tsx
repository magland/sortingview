import { useUnitMetricSelection } from "../context-unit-metrics-selection";
import { FunctionComponent, useCallback, useMemo } from "react";
import { NiceTable } from '../../core-views'

type Props = {
    width: number
    height: number
}

const UnitMetricSelectionWidget: FunctionComponent<Props> = ({width, height}) => {
    const {selectedUnitMetrics, allUnitMetrics, unitMetricSelectionDispatch} = useUnitMetricSelection()
    const columns = useMemo(() => ([
        {
            key: 'metric',
            label: 'Metric'
        }
    ]), [])
    const rows = useMemo(() => (
        (allUnitMetrics || []).map(m => ({
            key: m,
            columnValues: {
                'metric': m
            }
        }))
    ), [allUnitMetrics])
    const handleSelectedRowKeysChanged = useCallback((keys: string[]) => {
        unitMetricSelectionDispatch({
            type: 'selectUnitMetrics',
            unitMetrics: keys
        })
    }, [unitMetricSelectionDispatch])
    return (
        <div style={{position: 'absolute', width, height}}>
            <NiceTable
                rows={rows}
                columns={columns}
                selectedRowKeys={selectedUnitMetrics}
                onSelectedRowKeysChanged={handleSelectedRowKeysChanged}
                selectionMode="multiple"
            />
        </div>
    )
}

export default UnitMetricSelectionWidget