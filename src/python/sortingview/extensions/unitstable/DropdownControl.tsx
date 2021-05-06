import { FormControl, FormHelperText, makeStyles, MenuItem, Select } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const DropdownControl: React.FunctionComponent<{
    label: string,
    value: any,
    onSetValue: (v: any) => void,
    options: {
        value: any,
        label: string,
    }[]
}> = ({ label, value, onSetValue, options }) => {
    const classes = useStyles();
    return (
        <FormControl className={classes.formControl}>
            <Select
                value={value}
                onChange={(evt) => onSetValue(evt.target.value)}
                displayEmpty
                className={classes.selectEmpty}
                inputProps={{ 'aria-label': label }}
            >
                {
                    options.map(opt => (
                        <MenuItem value={opt.value} key={opt.label}>{opt.label}</MenuItem>
                    ))
                }
            </Select>
            <FormHelperText>{label}</FormHelperText>
        </FormControl>
    );
}

export default DropdownControl;