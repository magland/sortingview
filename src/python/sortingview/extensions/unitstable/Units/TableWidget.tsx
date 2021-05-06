import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
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

const HeaderRow: FunctionComponent<{
    columns: Column[],
    onColumnClick: (column: Column) => void
    primarySortColumnName: string | undefined
    primarySortColumnDirection: 'ascending' | 'descending' | undefined
    onDeselectAll?: (() => void)
}> = (props) => {
    const { columns, onColumnClick, primarySortColumnDirection, primarySortColumnName, onDeselectAll } = props
    return (
        <TableHead>
            <TableRow>
                {
                    onDeselectAll ? (
                        <TableCell key="_checkbox">
                            <RowCheckbox
                                rowId={''}
                                selected={false}
                                onClick={() => {onDeselectAll()}}
                                isDeselectAll={true}
                            />
                        </TableCell>
                    ) : (
                        <TableCell key="_checkbox" />
                    )
                }
                {
                    columns.map(column => {
                        const tooltip = (column.tooltip || column.label || '') + ' (click to sort)'
                        return (
                            <TableCell key={column.columnName} onClick={() => onColumnClick(column)} title={tooltip} style={{cursor: 'pointer'}}>
                                <Grid container justify="flex-start" style={{flexFlow: 'row'}}>
                                    <Grid item key="icon">
                                        <span style={{fontSize: 16, color: 'gray', paddingLeft: 3, paddingRight: 5, paddingTop: 2}}>
                                            {
                                                (primarySortColumnName === column.columnName) && (
                                                    primarySortColumnDirection === 'ascending' ? (
                                                        // <TriangleUp fontSize="inherit" />
                                                        <FontAwesomeIcon icon={faCaretUp} />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCaretDown} />
                                                    )
                                                )
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
                }
            </TableRow>
        </TableHead>
    )
}

const RowCheckbox = React.memo((props: {rowId: string, selected: boolean, onClick: (rowId: string) => void, isDeselectAll?: boolean}) => {
    const { rowId, selected, onClick, isDeselectAll } = props
    return (
        <Checkbox
            checked={selected}
            indeterminate={isDeselectAll ? true : false}
            onClick={() => onClick(rowId)}
            style={{
                padding: 1
            }}
            title={isDeselectAll ? "Deselect all" : `Select ${rowId}`}
        />
    );
});

interface Props {
    selectedRowIds: string[]
    onSelectedRowIdsChanged: (x: string[]) => void
    rows: Row[]
    columns: Column[]
    defaultSortColumnName?: string
    height?: number
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

const TableWidget: FunctionComponent<Props> = (props) => {

    const { selectedRowIds, onSelectedRowIdsChanged, rows, columns, defaultSortColumnName, height } = props

    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])

    useEffect(() => {
        if ((sortFieldOrder.length === 0) && (defaultSortColumnName)) {
            setSortFieldOrder([defaultSortColumnName])
        }
    }, [setSortFieldOrder, sortFieldOrder, defaultSortColumnName])

    const toggleSelectedRowId = useCallback(
        (rowId: string) => {
            const newSelectedRowIds = selectedRowIds.includes(rowId) ? selectedRowIds.filter(x => (x !== rowId)) : [...selectedRowIds, rowId]
            onSelectedRowIdsChanged(newSelectedRowIds)
        },
        [selectedRowIds, onSelectedRowIdsChanged]
    )

    const sortedRows = [...rows]

    const columnForName = (columnName: string): Column => (columns.filter(c => (c.columnName === columnName))[0])

    const sortingRules = interpretSortFields(sortFieldOrder)
    for (const r of sortingRules) {
        const columnName = r.columnName
        const column = columnForName(columnName)
        sortedRows.sort((a, b) => {
            const dA = (a.data[columnName] || {})
            const dB = (b.data[columnName] || {})
            const valueA = dA.sortValue
            const valueB = dB.sortValue

            return r.sortAscending ? column.sort(valueA, valueB) : column.sort(valueB, valueA)
        })
    }
    const selectedRowIdsLookup: {[key: string]: boolean} = (selectedRowIds || []).reduce((m, id) => {m[id] = true; return m}, {} as {[key: string]: boolean})

    const primaryRule = (sortingRules.length > 0) ? sortingRules[sortingRules.length - 1] : undefined
    const primarySortColumnName = primaryRule ? primaryRule.columnName : undefined
    const primarySortColumnDirection = primaryRule ? (primaryRule.sortAscending ? 'ascending' : 'descending') : undefined
    
    return (
        <TableContainer style={height !== undefined ? {maxHeight: height} : {}}>
            <Table stickyHeader className="TableWidget">
                <HeaderRow
                    columns={columns}
                    primarySortColumnName={primarySortColumnName}
                    primarySortColumnDirection={primarySortColumnDirection}
                    onColumnClick={(column) => {
                        const columnName = column.columnName
                        let newSortFieldOrder = [...sortFieldOrder]
                        if (sortFieldOrder[sortFieldOrder.length - 1] === columnName) {
                            if (sortFieldOrder[sortFieldOrder.length - 2] === columnName) {
                                // the last two match this column, let's just remove the last one
                                newSortFieldOrder = newSortFieldOrder.slice(0, newSortFieldOrder.length - 1)
                            }
                            else {
                                // the last one matches this column, let's add another one
                                newSortFieldOrder = [...newSortFieldOrder, columnName]
                            }
                        }
                        else {
                            // the last one does not match this column, let's clear out all previous instances and add one
                            newSortFieldOrder = [...newSortFieldOrder.filter(m => (m !== columnName)), columnName]
                        }
                        setSortFieldOrder(newSortFieldOrder)
                    }}
                    onDeselectAll={selectedRowIds.length > 0 ? () => {onSelectedRowIdsChanged([])} : undefined}
                />
                <TableBody>
                    {
                        sortedRows.map((row) => {
                            const selected = selectedRowIdsLookup[row.rowId] || false
                            return (
                                <TableRow key={row.rowId}>
                                    <TableCell key="_checkbox" className={selected ? "selectedRow" : ""}>
                                        <RowCheckbox
                                            rowId={row.rowId}
                                            selected={selected}
                                            onClick = {() => toggleSelectedRowId(row.rowId)}
                                        />
                                    </TableCell>
                                    {
                                        columns.map(column => (
                                            <TableCell key={column.columnName} className={selected ? "selectedRow" : ""}>
                                                <div title={column.tooltip}>
                                                    {column.dataElement(row.data[column.columnName].value)}
                                                </div>
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>       
                            )
                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TableWidget