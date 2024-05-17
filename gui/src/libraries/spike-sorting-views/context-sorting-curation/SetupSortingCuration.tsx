import { FunctionComponent, KeyboardEventHandler, PropsWithChildren, useCallback, useMemo, useReducer, useState } from "react";
import { useSelectedUnitIds } from "../context-unit-selection";
import SortingCurationContext, { sortingCurationReducer } from './SortingCurationContext';

type Props = {
}

const SetupSortingCuration: FunctionComponent<PropsWithChildren<Props>> = ({children}) => {
    const [sortingCuration, sortingCurationDispatch] = useReducer(sortingCurationReducer, {})
    const [labelChoices, setLabelChoices] = useState<string[]>()
    const value = useMemo(() => (
        {sortingCuration, sortingCurationDispatch, labelChoices, setLabelChoices}
    ), [sortingCuration, sortingCurationDispatch, labelChoices])

    const {selectedUnitIds} = useSelectedUnitIds()

    return (
        <SortingCurationContext.Provider value={value}>
            <div tabIndex={0}>
                {children}
            </div>
        </SortingCurationContext.Provider>
    )
}

export default SetupSortingCuration