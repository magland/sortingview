import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Checkbox, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { useMemoCompare } from 'kachery-react/useMemoCompare'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import '../unitstable.css'


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

type Modifier = null | 'shift' | 'ctrl'

type HeaderRowProps = {
    headers: ColumnHeaderInfo[]
    onColumnClick: (columnName: string) => void
    onDeselectAll?: (() => void)
    onSelectAll?: (() => void)
    allRowsSelected: boolean
    selectionDisabled?: boolean
}

type ColumnHeaderInfo = {
    name: string
    tooltip?: string
    label?: string
    isCalculating: boolean
    isPrimarySort: boolean
    isAscendingSort: boolean
}

const SortCaret = (ascending?: boolean) => (
    ascending
        ? <FontAwesomeIcon icon={faCaretUp} />
        : <FontAwesomeIcon icon={faCaretDown} />
)

const HeaderRow: FunctionComponent<HeaderRowProps> = (props) => {
    const { headers, onColumnClick, onDeselectAll, onSelectAll, allRowsSelected, selectionDisabled } = props
    const _renderedHeaders = useMemo(() => {
        return headers.map(column => {
            const tooltip = (column.tooltip || column.label || '') + ' (click to sort)'
            return (
                <TableCell key={column.name} onClick={() => onColumnClick(column.name)} title={tooltip} style={{cursor: 'pointer'}}>
                    <Grid container justify="flex-start" style={{flexFlow: 'row'}}>
                        <Grid item key="icon">
                            <span style={{fontSize: 16, color: 'gray', paddingLeft: 3, paddingRight: 5, paddingTop: 2}}>
                                {
                                    (column.isPrimarySort) && (SortCaret(column.isAscendingSort))
                                }
                            </span>
                        </Grid>
                        <Grid item key="text">
                            <span>
                                <span key="label">{column.label}</span>
                                <span key="progress">{column.isCalculating && <LinearProgress />}</span>
                            </span>
                        </Grid>
                    </Grid>
                </TableCell>
            )
        })
    }, [headers, onColumnClick]) // referential equality should be fine here b/c we can control the construction of the list.

    return (
        <TableHead>
            <TableRow>
                {
                    <TableCell key="_checkbox">
                        <RowCheckbox 
                            rowId={'all'}
                            selected={false}
                            onClick={(allRowsSelected ? onDeselectAll : onSelectAll) || (() => {return})}
                            isDeselectAll={allRowsSelected}
                            isDisabled={selectionDisabled}
                        />
                    </TableCell>
                }
                {_renderedHeaders}
            </TableRow>
        </TableHead>
    )
}

type CheckboxProps = {
    rowId: string,
    selected: boolean,
    onClick: (m: Modifier) => void,
    isDeselectAll?: boolean,
    isDisabled?: boolean
}

const RowCheckbox: FunctionComponent<CheckboxProps> = (props: CheckboxProps) => {
    const { rowId, selected, onClick, isDeselectAll, isDisabled } = props
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((evt) => {
        const modifier = evt.ctrlKey ? 'ctrl' : evt.shiftKey ? 'shift' : null
        onClick(modifier)
    }, [onClick])
    return (
        <Checkbox
            checked={selected}
            indeterminate={isDeselectAll ? true : false}
            onClick={handleClick}
            style={{
                padding: 1
            }}
            title={isDeselectAll ? "Deselect all" : `Select ${rowId}`}
            disabled={isDisabled}
        />
    )
}

type RowProps = {
    rowId: string,
    selected: boolean,
    // onClick: (sortedRowIds: string[], rowId: string, m: Modifier) => void,
    // handleClick: (sortedRowIds: string[], rowId: string, m: Modifier) => void,
    handleClick: (m: Modifier) => void,
    isDisabled: boolean,
    contentRepository: {[key: string]: JSX.Element[]}
}
const ContentRow: FunctionComponent<RowProps> = (props: RowProps) => {
    const {rowId, selected, handleClick, isDisabled, contentRepository} = props
    return <TableRow key={rowId} className={selected ? "selectedRow": ""}>
        <TableCell key="_checkbox">
            <RowCheckbox
                rowId={rowId}
                selected={selected}
                onClick={(m: Modifier) => handleClick(m)}
                isDisabled={isDisabled}
            />
        </TableCell>
        {contentRepository[rowId]}
    </TableRow>
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
    // useCheckForChanges('TableWidget', props)
    const { selectedRowIds, onSelectedRowIdsChanged, rows, columns, defaultSortColumnName, height, selectionDisabled } = props
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])
    const _selections = useMemoCompare<string[]>('_selections', selectedRowIds, [])
    const selectedRowsSet: Set<string> = useMemo(() => {
        return new Set(_selections || [])
    }, [_selections])
    const allRowIds = useMemo(() => rows.map(r => r.rowId), [rows])
    const allRowsSelected = useMemo(() => _selections.length === allRowIds.length, [_selections, allRowIds])

    useEffect(() => {
        if ((sortFieldOrder.length === 0) && (defaultSortColumnName)) {
            setSortFieldOrder([defaultSortColumnName])
        }
    }, [sortFieldOrder, setSortFieldOrder, defaultSortColumnName])

    // const toggleAllSelectedRowIds = useCallback(
    //     (rowCount: number) => {
    //         const invertedResult = [...Array(rowCount + 1).keys()]
    //                             .filter(r => !selectedRowIds.includes(r.toString()))
    //                             .map((rowId) => rowId.toString())
    //         onSelectedRowIdsChanged(invertedResult)
    //     },
    //     [selectedRowIds, onSelectedRowIdsChanged]
    // )

    const toggleSelectedRegion = useCallback(
        (sortedRowIds: string[], clickedRowId: string) => {
            // We don't know the IDs of each row, only that they're in
            // sorted order.
            // We want to toggle the selection status of the row that was
            // clicked, as well as the contiguous block with the same status
            // on either side.
            // To do this without repeatedly iterating through the list of
            // rows, we'll maintain the current 'run' of units, restarting it
            // every time the selection status ('polarity') changes, until we've
            // found the row with the clicked ID. At that point, we'll flip the
            // selection status of the current run when it ends.

            // Make a Set: closer-to-constant-time lookups of selection status
            let run: string[] = []
            let runPolarity: boolean = selectedRowsSet.has(sortedRowIds[0])
            let pastClickedRow: boolean = false
            for (const r of sortedRowIds) {
                if (selectedRowsSet.has(r) !== runPolarity) {
                    // We don't care what else is in the list if we've
                    // reached the end of the run that includes the
                    // clicked row.
                    if (pastClickedRow) break

                    // if we aren't past the clicked row when the run ended,
                    // then the current run didn't contain the clicked row, so
                    // it wasn't the right run. Flip polarity & start a new one.
                    runPolarity = !runPolarity
                    run = []
                }
                run.push(r)
                pastClickedRow = pastClickedRow || r === clickedRowId
            }
            // Done finding the run; now we need to update the selection.
            // - If runPolarity is true, the run has selected items to deselect.
            // - Otherwise they're to be added to the selection set.
            onSelectedRowIdsChanged(runPolarity
                ? selectedRowIds.filter(x => !run.includes(x))
                : [...selectedRowIds, ...run])
        },
        [selectedRowsSet, selectedRowIds, onSelectedRowIdsChanged]
    )

    const toggleSelectedRowId = useCallback(
        (rowId: string) => {
            const newSelectedRowIds = selectedRowsSet.has(rowId) ? _selections.filter(x => (x !== rowId)) : [..._selections, rowId]
            onSelectedRowIdsChanged(newSelectedRowIds)
        },
        [_selections, selectedRowsSet, onSelectedRowIdsChanged]
    )

    const columnForName = useCallback((columnName: string): Column => (columns.filter(c => (c.columnName === columnName))[0]), [columns])
    const sortingRules = useMemoCompare<sortFieldEntry[]>('sortingRules', interpretSortFields(sortFieldOrder), [])
    const handleRowClick = useCallback(
        (sortedRowIds: string[], rowId: string, modifier: Modifier) => {
            if(!modifier) toggleSelectedRowId(rowId)
            if (modifier === 'shift') {
                toggleSelectedRegion(sortedRowIds, rowId)
            }
            // if (modifier === 'ctrl') {
            //     toggleAllSelectedRowIds(sortedRows.length)
            // }
        }, [toggleSelectedRowId, toggleSelectedRegion]
    )

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

    const handleSelectAll = useCallback(() => {
        onSelectedRowIdsChanged(allRowIds)
    }, [onSelectedRowIdsChanged, allRowIds])

    const handleDeselectAll = useCallback(() => {
        onSelectedRowIdsChanged([])
    }, [onSelectedRowIdsChanged])

    const handleColumnClick = useCallback((columnName) => {
        const len = sortFieldOrder.length
        const priorSortField = len === 0 ? '' : sortFieldOrder[sortFieldOrder.length - 1]
        const lastTwoSortingColumnsMatch = len > 1 && sortFieldOrder[len - 1] === sortFieldOrder[len - 2]
        // Three cases:
        //   Case 1: The new click is the same sort as the last one and the one before. Choosing the same click 3x has
        // the same effect as choosing it once, so to keep the list short we'll trim the last one so it only appears once.
        //   Case 2: The new click is the same as the last one, but the last two don't match. That means the user is
        // toggling from ascending to descending sort, & we need both in the list. Just add the clicked column name.
        //   Case 3: The new click is not the same as the last one. We want to add an ascending sort by the clicked column,
        // but to keep the list trimmed, we remove any preceding sorts by this column (which can't impact the order any more).
        const newSortfieldOrder =
            priorSortField === columnName
                ? lastTwoSortingColumnsMatch
                    ? sortFieldOrder.slice(0, sortFieldOrder.length - 1)
                    : [...sortFieldOrder, columnName]
                : [...sortFieldOrder.filter(m => (m !== columnName)), columnName]
        setSortFieldOrder(newSortfieldOrder)
    }, [sortFieldOrder, setSortFieldOrder])

    const primaryRule = sortingRules[sortingRules.length - 1]

    const headers = useMemo(() => {
        return columns.map((c) => ({
            name: c.columnName,
            tooltip: c.tooltip,
            label: c.label,
            isCalculating: c.calculating || false,
            isPrimarySort: c.columnName === primaryRule?.columnName,
            isAscendingSort: primaryRule?.sortAscending || false
        }))
    }, [columns, primaryRule])

    const header = useMemo(() => {
        return (<HeaderRow
            headers={headers}
            onColumnClick={handleColumnClick}
            onDeselectAll={allRowsSelected ? handleDeselectAll : undefined}
            onSelectAll={allRowsSelected ? undefined : handleSelectAll }
            allRowsSelected={allRowsSelected}
            selectionDisabled={selectionDisabled}
        />)
    }, [headers, handleColumnClick, allRowsSelected, handleDeselectAll, handleSelectAll, selectionDisabled])

    const _metricsByRow = useMemo(() => {
        const contents = Object.assign(
            {},
            ...rows.map((row) => {
                const columnValues = columns.map(column => (
                    <TableCell key={column.columnName}>
                        <div title={column.tooltip}>
                            {column.dataElement(row.data[column.columnName].value)}
                        </div>
                    </TableCell>
                ))
                return {[row.rowId]: columnValues}
            })
        )
        return contents as any as {[key: string]: JSX.Element[]}
    }, [rows, columns])

    // Trying to pre-build the rendered rows and then update the subset with changes.
    // ...which doesn't actually work, because a) it's still redoing all of them each time bu
    // b) the effect hook keeps react from recognizing the change, so the DOM doesn't update.
    // This achieves the opposite of both our goals, but I'll keep the code for now.
    // const _rowsByRowId = useMemo(() => {
    //     console.log(`Rebuilding row set. ${Date.now()}`)
    //     const contents = Object.assign(
    //         {},
    //         ..._rows.map((row) => {
    //             const rendered = (
    //                 <ContentRow 
    //                     rowId={row.rowId}
    //                     selected={false}
    //                     onClick={toggleSelectedRowId}
    //                     isDisabled={selectionDisabled || false}
    //                     contentRepository={_metricsByRow}
    //                 />
    //             )
    //             return {[row.rowId]: rendered}
    //         })
    //     )
    //     return contents as any as {[key: string]: JSX.Element}
    // }, [_rows, _metricsByRow, toggleSelectedRowId, selectionDisabled])

    // useEffect(() => {
    //     selectionDelta.forEach((rowId) => {
    //         // console.log(`Toggling selection of row ${rowId}`)
    //         _rowsByRowId[rowId] = <ContentRow
    //                                 rowId={rowId}
    //                                 selected={selectedRowsSet.has(rowId)}
    //                                 onClick={toggleSelectedRowId}
    //                                 isDisabled={selectionDisabled || false}
    //                                 contentRepository={_metricsByRow}
    //         />
    //     })
    // }, [_rowsByRowId, selectionDelta, selectedRowsSet, toggleSelectedRowId, selectionDisabled, _metricsByRow])

    // This memoization is not effective, since it's still rebuilding the *entire* list
    // every time the selections change, instead of just touching the rows whose selection
    // status changed...
    const _unitrows = useMemo(() => {
        const sortedRowIds = sortedRows.map((row) => row.rowId)
        return sortedRows.map((row) => {
            return (
                <ContentRow
                    rowId={row.rowId}
                    selected={selectedRowsSet.has(row.rowId)}
                    handleClick={(m: Modifier) => handleRowClick(sortedRowIds, row.rowId, m)}
                    isDisabled={selectionDisabled || false}
                    contentRepository={_metricsByRow}
                />
            )
        })
    }, [selectedRowsSet, sortedRows, handleRowClick, _metricsByRow, selectionDisabled])

    return (
        <TableContainer style={height !== undefined ? {maxHeight: height} : {}}>
            <Table stickyHeader className="TableWidget">
                {header}
                <TableBody>
                    {_unitrows}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TableWidget