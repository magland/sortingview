import { useChannel, usePureCalculationTask } from 'kachery-react';
import sortByPriority from 'labbox-react/extensionSystem/sortByPriority';
import { ExternalSortingUnitMetric } from 'python/sortingview/gui/pluginInterface/Sorting';
import { SortingComparisonUnitMetricPlugin } from 'python/sortingview/gui/pluginInterface/SortingComparisonUnitMetricPlugin';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { mergeGroupForUnitId, Sorting, SortingCuration, SortingSelectionDispatch, SortingUnitMetricPlugin } from "../../../pluginInterface";
import '../unitstable.css';
import TableWidget, { Column, Row } from './TableWidget';

interface Props {
    sortingUnitMetrics?: SortingUnitMetricPlugin[]
    sortingComparisonUnitMetrics?: SortingComparisonUnitMetricPlugin[]
    units: number[]
    metrics?: {[key: string]: {data: {[key: string]: any}, error: string | null}}
    selectedUnitIds?: number[]
    selectionDispatch: SortingSelectionDispatch
    unitMetricsUri?: string
    compareSorting?: Sorting
    curation: SortingCuration
    height?: number
    selectionDisabled?: boolean
    sortingSelector?: string
}

const unitIdStyle: React.CSSProperties = {
    color: 'black',
    fontWeight: 'bold',
    cursor: 'pointer'
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

const alphaSort = (a: any, b: any) => {
    return (a < b) ? -1 : (a > b) ? 1 : 0
}
const numericSort = (a: any, b: any) => {
    return (Number(a) - Number(b))
}
const formatNumberForDisplay = (x: number) => {
    if (!x) return x
    if (Number.isInteger(x)) return x + '' // if integer, display the whole thing
    try {
        return x.toPrecision(4) + '' // otherwise, give 4 significant digits
    }
    catch {
        return x
    }
}
const numericElement = (x: any) => (<span>{formatNumberForDisplay(x as number)}</span>)

const unitIdElement = (x: any, sortingSelector: string) => {
    const {unitId, mergeGroup} = x as {unitId: number, mergeGroup: number[] | null}
    return (
        <span>
            <span key="unitId" style={unitIdStyle}>
                {unitId + '' + sortingSelector}
            </span>
            {
                ((mergeGroup) && (mergeGroup.length > 0)) && (
                    <span key="mergeGroup">{` (${mergeGroup.map(id => (id + '' + sortingSelector)).join(", ")})`}</span>
                )
            }
        </span>
    )
}

const getLabelsForUnitId = (unitId: number, curation: SortingCuration) => {
    const labelsByUnit = (curation || {}).labelsByUnit || {};
    return labelsByUnit[unitId] || []
}


const UnitsTable: FunctionComponent<Props> = (props) => {
    const { unitMetricsUri, sortingUnitMetrics, sortingComparisonUnitMetrics, units, metrics, selectedUnitIds, selectionDispatch, curation, height, selectionDisabled, sortingSelector } = props
    const selectedRowIds = useMemo(() => (selectedUnitIds || []).map(unitId => (unitId + '')), [selectedUnitIds])
    const _metrics = useMemo(() => metrics || {}, [metrics])

    // Prepare lists of metrics.
    // These memoizations work b/c the parameters should be memoized in the caller.
    const sortingUnitMetricsList = useMemo(() => {
        return sortByPriority(Object.values(sortingUnitMetrics || {})).filter(p => (!p.disabled))
    }, [sortingUnitMetrics])
    const sortingComparisonUnitMetricsList = useMemo(() => {
        return sortByPriority(Object.values(sortingComparisonUnitMetrics || {})).filter(p => (!p.disabled))
    }, [sortingComparisonUnitMetrics])
    // If we are in a comparison between sortings, use both sortingUnitMetricList and sortingComparisonUnitMetricList. Otherwise, use only the sortingUnitMetricList 
    const allUnitMetricsList = useMemo(
        () => (sortingSelector ? [...sortingComparisonUnitMetricsList, ...sortingUnitMetricsList] : sortingUnitMetricsList),
        [sortingSelector, sortingComparisonUnitMetricsList, sortingUnitMetricsList]
    )

    const handleSelectedRowIdsChanged = useCallback((selectedRowIds: string[]) => {
        selectionDispatch({
            type: 'SetSelectedUnitIds',
            selectedUnitIds: selectedRowIds.map(id => Number(id))
        })
    }, [ selectionDispatch ])

    const _unitIdElement = useCallback((x) => unitIdElement(x, sortingSelector || ''), [sortingSelector])

    // Fetch external metrics.
    const {channelName} = useChannel()
    const {returnValue: externalUnitMetrics} = usePureCalculationTask<ExternalSortingUnitMetric[]>(unitMetricsUri ? 'fetch_unit_metrics.1' : undefined, {unit_metrics_uri: unitMetricsUri || ''}, {channelName})

    // Assemble column list
    // -- Static columns (unit id & labels)
    const unitColumn = useMemo(() => {
        return ({
            columnName: '_unit_id',
            label: 'Unit ID',
            tooltip: 'Unit ID',
            sort: numericSort,
            dataElement: _unitIdElement
        })
    }, [_unitIdElement])

    const labelColumn = useMemo(() => {
        return ({
            columnName: '_labels',
            label: 'Labels',
            tooltip: 'Curation labels',
            sort: alphaSort,
            dataElement: labelsElement
        })
    }, [])

    const columns: Column[] = useMemo(() => {
        const externalMetricColumns = (externalUnitMetrics || []).map(
            (m) => ({
                columnName: 'external-metric-' + m.name,
                label: m.label,
                tooltip: m.tooltip || '',
                sort: numericSort,
                dataElement: numericElement
            })
        )
        const internalMetricColumns = (allUnitMetricsList || []).map(
            (m) => {
                const metric = _metrics[m.name] || null
                return ({
                    columnName: 'plugin-metric-' + m.name,
                    label: m.columnLabel,
                    tooltip: m.tooltip || '',
                    sort: numericSort,
                    dataElement: m.component,
                    calculating: (metric && !metric?.data)
            })}
        )

        return [unitColumn, labelColumn, ...externalMetricColumns, ...internalMetricColumns]
    }, [unitColumn, labelColumn, externalUnitMetrics, allUnitMetricsList, _metrics])

    // Given known columns, assemble rows.

    const rows: Row[] = useMemo(() => {
        return units.map((unitId) => {
            const unitIdData = {
                value: {unitId, mergeGroup: mergeGroupForUnitId(unitId, curation)},
                sortValue: unitId
            }
            const labels = getLabelsForUnitId(unitId, curation)
            const labelData = {
                value: labels,
                sortValue: labels.join(', ')
            }
            const unitIdStr = unitId + ''
            const externalMetricsData = (externalUnitMetrics || []).reduce((data, m) => {
                const value = m.data[unitIdStr]
                return {
                    ...data,
                    ['external-metric-' + m.name]: {
                        value: value ?? '', // Or 'NaN' to display 'NaN' text
                        sortValue: value ?? NaN
                    }
                }
            }, {})
            const internalMetricsData = (allUnitMetricsList || []).reduce((data, m) => {
                    const unitRecord = _metrics[m.name]?.data?.[unitIdStr]
                    const value = unitRecord && m.getValue(unitRecord)
                    return {
                        ...data,
                        ['plugin-metric-' + m.name]: {
                            value: unitRecord,
                            sortValue: value ?? (m.isNumeric ? NaN : '')
                        }
                    }
                }, {})

            return ({
                rowId: unitId + '',
                data: {
                    '_unit_id': unitIdData,
                    '_labels': labelData,
                    ...externalMetricsData,
                    ...internalMetricsData
                }
            })
        })
    }, [units, curation, externalUnitMetrics, _metrics, allUnitMetricsList])

    return (
        <TableWidget
            rows={rows}
            columns={columns}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChanged={handleSelectedRowIdsChanged}
            defaultSortColumnName="_unit_id"
            height={height}
            selectionDisabled={selectionDisabled}
        />
    )
}

export default UnitsTable