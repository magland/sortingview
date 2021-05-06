import { Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Delete, Edit } from "@material-ui/icons";
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import './NiceTable.css';

interface Row {
    key: string
    columnValues: {[key: string]: any}
}
interface Col {
    key: string
    label: string
}

interface Props {
    rows: Row[],
    columns: Col[],
    onDeleteRow?: (key: string) => void,
    deleteRowLabel?: string,
    onEditRow?: (key: string) => void,
    editRowLabel?: string,
    selectionMode?: 'none' | 'single' | 'multiple',
    selectedRowKeys?: {[key: string]: boolean},
    onSelectedRowKeysChanged?: ((keys: string[]) => void)
}

const NiceTable: FunctionComponent<Props> = ({
    rows,
    columns,
    onDeleteRow=undefined,
    deleteRowLabel=undefined,
    onEditRow=undefined,
    editRowLabel=undefined,
    selectionMode='none', // none, single, multiple
    selectedRowKeys={},
    onSelectedRowKeysChanged=undefined
}) => {
    const selectedRowKeysObj = useMemo(() => {
        const x: {[key: string]: boolean} = {};
        Object.keys(selectedRowKeys).forEach((key) => {x[key] = selectedRowKeys[key]});
        return x
    }, [selectedRowKeys])
    const [confirmDeleteRowKey, setConfirmDeleteRowKey] = useState<string | null>(null)
    const handleClickRow = useCallback((key: string) => {
        if (!onSelectedRowKeysChanged || false) return;
        
        if (selectionMode === 'single') {
            if (!(key in selectedRowKeysObj) || !selectedRowKeysObj[key]) {
                onSelectedRowKeysChanged([key + '']);
            } else {
                onSelectedRowKeysChanged([]);
            }
        }
        else if (selectionMode === 'multiple') {
            // todo: write this logic. Note, we'll need to also pass in the event to get the ctrl/shift modifiers
            onSelectedRowKeysChanged(
                Object.keys(selectedRowKeysObj)
                    // eslint-disable-next-line eqeqeq
                    .filter(k => k != key && selectedRowKeysObj[k])
                    .concat(selectedRowKeysObj[key] ? [] : [key.toString()])
            );
        }
    }, [onSelectedRowKeysChanged, selectionMode, selectedRowKeysObj])
    const handleDeleteRow = useCallback((rowKey: string) => {
        setConfirmDeleteRowKey(rowKey)
    }, [])
    const handleConfirmDeleteRow = useCallback((rowKey: string, confirmed: boolean) => {
        if (confirmed) {
            onDeleteRow && onDeleteRow(rowKey)
        }
        setConfirmDeleteRowKey(null)
    }, [onDeleteRow])
    const handleEditRow = useCallback((rowKey: string) => {
        onEditRow && onEditRow(rowKey)
    }, [onEditRow])
    return (
        <Table className="NiceTable">
            <TableHead>
                <TableRow>
                    <TableCell key="_first" style={{ width: 0 }} />
                    {
                        columns.map(col => (
                            <TableCell key={col.key}>
                                <span>{col.label}</span>
                            </TableCell>
                        ))
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    rows.map(row => (
                        <TableRow key={row.key}>
                            <TableCell>
                                {
                                    onDeleteRow && ((confirmDeleteRowKey === row.key) ? (
                                        <ConfirmDeleteRowButton
                                            title={deleteRowLabel || ''}
                                            onConfirmDeleteRow={handleConfirmDeleteRow}
                                            rowKey={row.key}
                                        />
                                    ) : (
                                        (
                                            <DeleteRowButton
                                                title={deleteRowLabel || ''}
                                                onDeleteRow={handleDeleteRow}
                                                rowKey={row.key}
                                            />
                                        )
                                    ))
                                }
                                {
                                    onEditRow && (
                                        <EditRowButton
                                            title={editRowLabel || ''}
                                            onEditRow={handleEditRow}
                                            rowKey={row.key}
                                        />
                                    )
                                }
                                {
                                    selectionMode !== 'none' && (
                                        <Checkbox
                                            checked={selectedRowKeysObj[row.key] || false}
                                            onClick={() => handleClickRow(row.key)}
                                        />
                                    )
                                }
                            </TableCell>
                            {
                                columns.map(col => (
                                    <TableCell key={col.key}>
                                        <span>{makeCell(row.columnValues[col.key])}</span>
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

const DeleteRowButton: FunctionComponent<{title: string, rowKey: string, onDeleteRow?: (key: string) => void}> = ({ title, rowKey, onDeleteRow }) => {
    const handleClick = useCallback(() => {
        onDeleteRow && onDeleteRow(rowKey)
    }, [onDeleteRow, rowKey])
    return (
        <IconButton
            title={title}
            onClick={handleClick}
        ><Delete /></IconButton>
    )
}

const ConfirmDeleteRowButton: FunctionComponent<{title: string, rowKey: string, onConfirmDeleteRow?: (key: string, confirmed: boolean) => void}> = ({ title, rowKey, onConfirmDeleteRow }) => {
    const handleClick = useCallback(() => {
        onConfirmDeleteRow && onConfirmDeleteRow(rowKey, true)
    }, [onConfirmDeleteRow, rowKey])
    const handleCancel = useCallback(() => {
        onConfirmDeleteRow && onConfirmDeleteRow(rowKey, false)
    }, [onConfirmDeleteRow, rowKey])
    return (
        <span>
            Confirm delete?
            <IconButton
                title={title}
                onClick={handleClick}
            ><Delete /></IconButton>
            <IconButton
                title={"Cancel"}
                onClick={handleCancel}
            >&#10006;</IconButton>
        </span>
    )
}

const EditRowButton: FunctionComponent<{title: string, rowKey: string, onEditRow?: (key: string) => void}> = ({title, rowKey, onEditRow}) => {
    return (
        <IconButton
            title={title}
            onClick={() => onEditRow && onEditRow(rowKey)}
        >
            <Edit />
        </IconButton>
    )
}

const makeCell = (x: any) => {
    // eslint-disable-next-line eqeqeq
    if (x == 0) return x;  // !'0' is true, but we shouldn't null out actual 0s
    if (!x) return '';
    if (typeof(x) == "object") {
        if (x.element) return x.element;
        else return x.text || '';
    }
    else {
        return x;
    }
}

export default NiceTable;