import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import React, { Fragment, FunctionComponent } from 'react';
import { Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import SelectUnitsWidget from './SelectUnitsWidget';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation?: SortingCuration
    locked: boolean
    toggleLockStateCallback: () => void
    sortingSelector?: string
}

const LockableSelectUnitsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, curation, locked, toggleLockStateCallback, sortingSelector }) => {
    return (
        <Fragment>
            <FormGroup className={"lock-switch"}>
                <FormControlLabel
                    control={ <Switch checked={locked} size={"small"} onChange={() => toggleLockStateCallback()} /> }
                    label={<Typography variant="caption">Lock selection</Typography>}
                />
            </FormGroup>
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} curation={curation} selectionDisabled={locked} sortingSelector={sortingSelector} />
        </Fragment>
    )
}

export default LockableSelectUnitsWidget