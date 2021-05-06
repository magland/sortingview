import { useHitherJob } from 'labbox';
import React, { FunctionComponent, useCallback } from 'react';
import { mergeGroupForUnitId, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch, SortingUnitMetricPlugin } from "../../pluginInterface";
import { ExternalSortingUnitMetric } from '../../pluginInterface/Sorting';
import sortByPriority from '../../sortByPriority';
import '../unitstable.css';
import TableWidget, { Column, Row } from './TableWidget';

interface Props {
    sortingUnitMetrics?: SortingUnitMetricPlugin[]
    units: number[]
    metrics?: {[key: string]: {data: {[key: string]: any}, error: string | null}}
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    sorting: Sorting
    curation: SortingCuration
    height?: number
}

const UnitsTable: FunctionComponent<Props> = (props) => {
    const { sortingUnitMetrics, units, metrics, selection, selectionDispatch, curation, sorting, height } = props
    const selectedUnitIds = ((selection || {}).selectedUnitIds || [])
    const sortingUnitMetricsList = sortByPriority(Object.values(sortingUnitMetrics || {})).filter(p => (!p.disabled))

    const handleSelectedRowIdsChanged = useCallback((selectedRowIds: string[]) => {
        selectionDispatch({
            type: 'SetSelectedUnitIds',
            selectedUnitIds: selectedRowIds.map(id => Number(id))
        })
    }, [ selectionDispatch ])

    const rows: Row[] = units.map(unitId => ({
        rowId: unitId + '',
        data: {}
    }))

    const numericSort = (a: any, b: any) => {
        return (Number(a) - Number(b))
    }
    const numericElement = (x: any) => (<span>{x + ''}</span>)
    const unitIdStyle: React.CSSProperties = {
        color: 'black',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
    const unitIdElement = (x: any) => {
        const {unitId, mergeGroup} = x as {unitId: number, mergeGroup: number[] | null}
        return (
            <span>
                <span key="unitId" style={unitIdStyle}>
                    {unitId + ''}
                </span>
                {
                    ((mergeGroup) && (mergeGroup.length > 0)) && (
                        <span key="mergeGroup">{` (${mergeGroup.map(id => (id + '')).join(", ")})`}</span>
                    )
                }
            </span>
        )
    }

    const alphaSort = (a: any, b: any) => {
        return (a < b) ? -1 : (a > b) ? 1 : 0
    }
    const labelStyle: React.CSSProperties = {
        color: 'gray',
        textDecoration: 'underline',
        cursor: 'pointer'
    }
    const labelsElement = (x: any) => {
        const y = x as string[]
        return (
            <span>
                {
                    y.map(label => (
                        <span key={label}><span style={labelStyle}>{label}</span>&nbsp;</span>
                    ))
                }
            </span>
        )
    }

    const columns: Column[] = []
    
    // first column (Unit ID)
    columns.push({
        columnName: '_unit_id',
        label: 'Unit ID',
        tooltip: 'Unit ID',
        sort: numericSort,
        dataElement: unitIdElement
    })
    rows.forEach(row => {
        const unitId = Number(row.rowId)
        row.data['_unit_id'] = {
            value: {unitId, mergeGroup: mergeGroupForUnitId(unitId, curation)},
            sortValue: unitId
        }
    })

    // second column (Labels)
    columns.push({
        columnName: '_labels',
        label: 'Labels',
        tooltip: 'Curation labels',
        sort: alphaSort,
        dataElement: labelsElement
    })
    rows.forEach(row => {
        const unitId = Number(row.rowId)
        const labels = getLabelsForUnitId(unitId, curation)
        row.data['_labels'] = {
            value: labels,
            sortValue: labels.join(', ')
        }
    })

    const {result: externalUnitMetrics, job: externalUnitMetricsJob} = useHitherJob<ExternalSortingUnitMetric[]>('createjob_fetch_unit_metrics', {unit_metrics_uri: sorting.unitMetricsUri || ''}, {useClientCache: true})

    ;(externalUnitMetrics || []).forEach((m: ExternalSortingUnitMetric) => {
        const columnName = 'external-metric-' + m.name
        columns.push({
            columnName,
            label: m.label,
            tooltip: m.tooltip || '',
            sort: numericSort,
            dataElement: numericElement
        })
        rows.forEach(row => {
            const unitId = Number(row.rowId)
            const v = m.data[unitId + '']
            row.data[columnName] = {
                value: v !== undefined ? v : NaN,
                sortValue: v !== undefined ? v : NaN
            }
        })
    })

    ;(sortingUnitMetricsList).forEach((m: SortingUnitMetricPlugin) => {
        const columnName = 'plugin-metric-' + m.name
        const metric = (metrics || {})[m.name] || null
        const metricData = metric ? metric.data : null
        columns.push({
            columnName,
            label: m.columnLabel,
            tooltip: m.tooltip || '',
            sort: numericSort,
            dataElement: m.component,
            calculating: (metric && (!metricData))
        })
        
        rows.forEach(row => {
            const unitId = Number(row.rowId)
            const record = metricData ? (
                (unitId + '' in metricData) ? metricData[unitId + ''] : undefined
            ) : undefined
            const v = (record !== undefined) ? m.getValue(record) : undefined
            row.data[columnName] = {
                value: record,
                sortValue: v !== undefined ? v : (m.isNumeric ? NaN : '')
            }
        })
    })

    const selectedRowIds = selectedUnitIds.map(unitId => (unitId + ''))
   
    return (
        <TableWidget
            rows={rows}
            columns={columns}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChanged={handleSelectedRowIdsChanged}
            defaultSortColumnName="_unit_id"
            height={height}
        />
    )
}

const getLabelsForUnitId = (unitId: number, curation: SortingCuration) => {
    const labelsByUnit = (curation || {}).labelsByUnit || {};
    return labelsByUnit[unitId] || []
}

// const UnitIdCell = React.memo((props: {id: number, mergeGroup: number[] | null, sortingId: string}) => {
//     const g = props.mergeGroup
//     return <TableCell><span>{props.id + ''}{g && ' (' + [...g].sort().join(', ') + ')'}</span></TableCell>
// })

// const UnitLabelCell = React.memo((props: {labels: string}) => (
//     <TableCell><span>{props.labels}</span></TableCell>
// ));

// const MetricCell = React.memo((a: {title?: string, error: string, data: any, PayloadComponent: React.ComponentType<{record: any}>}) => {
//     const { error, data, PayloadComponent } = a
//     if (error !== '') {
//         return (<TableCell><span>{`Error: ${error}`}</span></TableCell>);
//     }
//     if (data === null || data === '') { // 0 is a valid value!!
//         return (<TableCell><LinearProgress style={{'width': '60%'}}/></TableCell>);
//     } else {
//         return (
//             <TableCell>
//                 <span title={a.title}>
//                     <PayloadComponent record = {data} />
//                 </span>
//             </TableCell>
//         );
//     }
// });

export default UnitsTable