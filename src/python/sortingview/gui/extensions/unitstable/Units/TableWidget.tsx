import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import '../unitstable.css';

export interface Row {
    rowId: string
    data: {[key: string]: {
        value: any,
        sortValue: any
    }}
}

export interface Column {
    columnName: string
    label: string
    tooltip: string
    sort: (a: any, b: any) => number
    dataElement: (d: any) => JSX.Element
    calculating?: boolean
}

type ColumnDirections = 'ascending' | 'descending'

type HeaderRowProps = {
    columns: Column[]
    onColumnClick: (column: Column) => void
    primarySortColumnName?: string
    primarySortColumnDirection?: ColumnDirections
    onDeselectAll?: (() => void)
    onSelectAll?: (() => void)
    selectionDisabled?: boolean
}

const SortCaret = (primarySortColumnDirection: string | undefined) => (
    primarySortColumnDirection === 'ascending'
        ? <FontAwesomeIcon icon={faCaretUp} />
        : <FontAwesomeIcon icon={faCaretDown} />
)

const HeaderRow: FunctionComponent<HeaderRowProps> = (props) => {
    const { columns, onColumnClick, primarySortColumnDirection, primarySortColumnName, onDeselectAll, onSelectAll, selectionDisabled } = props
    const _columns = useMemo(() => columns, [columns])
    const _renderedColumns = useMemo(() => (
        _columns.map(column => {
            const tooltip = (column.tooltip || column.label || '') + ' (click to sort)'
            return (
                <TableCell key={column.columnName} onClick={() => onColumnClick(column)} title={tooltip} style={{cursor: 'pointer'}}>
                    <Grid container justify="flex-start" style={{flexFlow: 'row'}}>
                        <Grid item key="icon">
                            <span style={{fontSize: 16, color: 'gray', paddingLeft: 3, paddingRight: 5, paddingTop: 2}}>
                                {
                                    (primarySortColumnName === column.columnName) && (SortCaret(primarySortColumnDirection))
                                }
                            </span>
                        </Grid>
                        <Grid item key="text">
                            <span>
                                <span key="label">{column.label}</span>
                                <span key="progress">{column.calculating && <LinearProgress />}</span>
                            </span>
                        </Grid>
                    </Grid>
                </TableCell>
            )
        })
    ), [_columns, onColumnClick, primarySortColumnDirection, primarySortColumnName])

    return (
        <TableHead>
            <TableRow>
                {
                    onDeselectAll ? (
                        <TableCell key="_checkbox">
                            <RowCheckbox
                                rowId={''}
                                selected={false}
                                onClick={onDeselectAll}
                                isDeselectAll={true}
                                isDisabled={selectionDisabled}
                            />
                        </TableCell>
                    ) : onSelectAll ? (
                        <TableCell key="_checkbox">
                            <RowCheckbox
                                rowId={'all'}
                                selected={false}
                                onClick={onSelectAll}
                                isDeselectAll={false}
                                isDisabled={selectionDisabled}
                            />
                        </TableCell>
                    ) : (
                        <TableCell key="_checkbox" />
                    )
                }
                {_renderedColumns}
            </TableRow>
        </TableHead>
    )
}

type CheckboxProps = {
    rowId: string,
    selected: boolean,
    onClick: (rowId: string) => void,
    isDeselectAll?: boolean,
    isDisabled?: boolean
}

const RowCheckbox = (props: CheckboxProps) => {
    const { rowId, selected, onClick, isDeselectAll, isDisabled } = props
    return (
        <Checkbox
            checked={selected}
            indeterminate={isDeselectAll ? true : false}
            onClick={() => onClick(rowId)}
            style={{
                padding: 1
            }}
            title={isDeselectAll ? "Deselect all" : `Select ${rowId}`}
            disabled={isDisabled}
        />
    )
}

interface TableProps {
    selectedRowIds: string[]
    onSelectedRowIdsChanged: (x: string[]) => void
    rows: Row[]
    columns: Column[]
    defaultSortColumnName?: string
    height?: number
    selectionDisabled?: boolean
}

type sortFieldEntry = {columnName: string, keyOrder: number, sortAscending: boolean}
const interpretSortFields = (fields: string[]): sortFieldEntry[] => {
    const result: sortFieldEntry[] = []
    for (let i = 0; i < fields.length; i ++) {
        // We are ascending unless two fields in a row are the same
        const sortAscending = (fields[i - 1] !== fields[i])
        result.push({columnName: fields[i], keyOrder: i, sortAscending})
    }
    return result
}

const TableWidget: FunctionComponent<TableProps> = (props) => {
    const { selectedRowIds, onSelectedRowIdsChanged, rows, columns, defaultSortColumnName, height, selectionDisabled } = props
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])

    useEffect(() => {
        if ((sortFieldOrder.length === 0) && (defaultSortColumnName)) {
            setSortFieldOrder([defaultSortColumnName])
        }
    }, [sortFieldOrder, setSortFieldOrder, defaultSortColumnName])

    const toggleSelectedRowId = useCallback(
        (rowId: string) => {
            const newSelectedRowIds = selectedRowIds.includes(rowId) ? selectedRowIds.filter(x => (x !== rowId)) : [...selectedRowIds, rowId]
            onSelectedRowIdsChanged(newSelectedRowIds)
        },
        [selectedRowIds, onSelectedRowIdsChanged]
    )

    // I'm not sure memoizing rows or columns achieves much, given that they're probably compared based
    // on reference equality. There may be a win here in the future if we can break them down more.
    const _columns = useMemo(() => columns, [columns])
    const columnForName = useCallback((columnName: string): Column => (_columns.filter(c => (c.columnName === columnName))[0]), [_columns])
    const sortingRules = interpretSortFields(sortFieldOrder)

    const sortedRows = useMemo(() => {
        let _draft = [...rows]
        for (const r of sortingRules) {
            const columnName = r.columnName
            const column = columnForName(columnName)
            _draft.sort((a, b) => {
                const dA = (a.data[columnName] || {})
                const dB = (b.data[columnName] || {})
                const valueA = dA.sortValue
                const valueB = dB.sortValue
    
                return r.sortAscending ? column.sort(valueA, valueB) : column.sort(valueB, valueA)
            })
        }
        return _draft
    }, [rows, sortingRules, columnForName])

    const selectedRowsSet: Set<string> = useMemo(() => new Set(selectedRowIds || []), [selectedRowIds])
    const allRowIds = useMemo(() => rows.map(r => r.rowId), [rows])
    const allRowsSelected = useMemo(() => selectedRowIds.length === allRowIds.length, [selectedRowIds, allRowIds])

    const handleSelectAll = useCallback(() => {
        onSelectedRowIdsChanged(allRowIds)
    }, [onSelectedRowIdsChanged, allRowIds])

    const handleDeselectAll = useCallback(() => {
        onSelectedRowIdsChanged([])
    }, [onSelectedRowIdsChanged])

    const handleColumnClick = useCallback((column) => {
        const columnName = column.columnName
        const len = sortFieldOrder.length
        const priorSortField = len === 0 ? '' : sortFieldOrder[sortFieldOrder.length - 1]
        const lastTwoSortingColumnsMatch = len > 1 && sortFieldOrder[len - 1] === sortFieldOrder[len - 2]
        const newSortfieldOrder =
            priorSortField === columnName
                ? lastTwoSortingColumnsMatch
                    // Requesting the same sort 3x in a row has the same effect as just once, so just remove the column's second appearance.
                    ? sortFieldOrder.slice(0, sortFieldOrder.length - 1)
                    // This click was the 2nd one in a row the column was clicked: add it again & keep the previous one (to mark descending)
                    : [...sortFieldOrder, columnName]
                // The user just requested sorting by a new column. Any prior appearances won't affect the sorting order,
                // so clear them out and add it once at the end.
                : [...sortFieldOrder.filter(m => (m !== columnName)), columnName]
        setSortFieldOrder(newSortfieldOrder)
    }, [sortFieldOrder, setSortFieldOrder])

    const primaryRule = (sortingRules.length > 0) ? sortingRules[sortingRules.length - 1] : undefined
    const primarySortColumnName = primaryRule ? primaryRule.columnName : undefined
    const primarySortColumnDirection = primaryRule ? (primaryRule.sortAscending ? 'ascending' : 'descending') : undefined

    const header = useMemo(() =>
        (<HeaderRow
            columns={_columns}
            primarySortColumnName={primarySortColumnName}
            primarySortColumnDirection={primarySortColumnDirection}
            onColumnClick={handleColumnClick}
            onDeselectAll={allRowsSelected ? handleDeselectAll : undefined}
            onSelectAll={allRowsSelected ? undefined : handleSelectAll }
            selectionDisabled={selectionDisabled}
        />), [_columns, primarySortColumnName, primarySortColumnDirection, handleColumnClick, allRowsSelected, handleDeselectAll, handleSelectAll, selectionDisabled])

    // This was an attempt to memoize row contents and avoid some repetitive calculations,
    // but it didn't yield much benefit. Leaving it here commented in case we want to try
    // further similar optimizations down the line.
    // const _metricsByRow = useMemo(() => {
    //     const contents = Object.assign(
    //         {},
    //         ...sortedRows.map((row) => {
    //             const columnValues = _columns.map(column => (
    //                 <TableCell key={column.columnName}>
    //                     <div title={column.tooltip}>
    //                         {column.dataElement(row.data[column.columnName].value)}
    //                     </div>
    //                 </TableCell>
    //             ))
    //             return {[row.rowId]: columnValues}
    //         })
    //     )
    //     return contents as any as {[key: string]: JSX.Element[]}
    // }, [sortedRows, _columns])

    // This memoization is probably not effective, since it's still rebuilding the *entire* list
    // every time the selections change, instead of just touching the rows whose selection
    // status changed...
    const _rows = useMemo(() => {
        return sortedRows.map((row) => {
            const selected = selectedRowsSet.has(row.rowId)
            return (
                <TableRow key={row.rowId} className={selected ? "selectedRow" : ""}>
                    <TableCell key="_checkbox">
                        <RowCheckbox
                            rowId={row.rowId}
                            selected={selected}
                            onClick={() => toggleSelectedRowId(row.rowId)}
                            isDisabled={selectionDisabled}
                        />
                    </TableCell>
                    {
                        _columns.map(column => (
                            <TableCell key={column.columnName}>
                                <div title={column.tooltip}>
                                    {column.dataElement(row.data[column.columnName].value)}
                                </div>
                            </TableCell>
                        ))
                    }
                </TableRow>
            )
        })
    }, [selectedRowsSet, sortedRows, _columns, selectionDisabled, toggleSelectedRowId])

    return (
        <TableContainer style={height !== undefined ? {maxHeight: height} : {}}>
            <Table stickyHeader className="TableWidget">
                {header}
                <TableBody>
                    {_rows}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TableWidget