import { MenuItem, Select } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';

export type PreprocessingSelection = {
    filterType: 'none' | 'bandpass_filter'
}

export type PreprocessingSelectionAction = {
    type: 'SetPreprocessingSelection',
    preprocessingSelection: PreprocessingSelection
}

export const preprocessingSelectionReducer = (state: PreprocessingSelection, action: PreprocessingSelectionAction) => {
    if (action.type === 'SetPreprocessingSelection') {
        return action.preprocessingSelection
    }
    else {
        return state
    }
}

type Props = {
    preprocessingSelection: PreprocessingSelection
    preprocessingSelectionDispatch: (a: PreprocessingSelectionAction) => void
}

const choices: {preprocessingSelection: PreprocessingSelection, label: string}[] = [
    {
        preprocessingSelection: {filterType: 'none'},
        label: 'No filter'
    },
    {
        preprocessingSelection: {filterType: 'bandpass_filter'},
        label: 'Bandpass filter'
    }
]

const PreprocessingControl: FunctionComponent<Props & SizeMeProps> = ({ preprocessingSelection, preprocessingSelectionDispatch }) => {
    const handleChoice = useCallback((event: React.ChangeEvent<{value: any}>) => {
        const preprocessingSelectionForValue = (val: string) => {
            return choices.filter(choice => (choice.preprocessingSelection.filterType === val))[0].preprocessingSelection
        }
        preprocessingSelectionDispatch({type: 'SetPreprocessingSelection', preprocessingSelection: preprocessingSelectionForValue(event.target.value)})
    }, [preprocessingSelectionDispatch])
    return (
        <Select
            value={preprocessingSelection.filterType}
            onChange={handleChoice}
        >
            {
                choices.map(choice => (
                    <MenuItem key={choice.preprocessingSelection.filterType} value={choice.preprocessingSelection.filterType}>{choice.label}</MenuItem>
                ))
            }
        </Select>
    )
}

export default sizeMe()(PreprocessingControl)