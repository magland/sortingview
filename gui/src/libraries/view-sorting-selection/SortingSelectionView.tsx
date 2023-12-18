import { Button, Checkbox } from "@material-ui/core";
import { SortingCuration, useSortingCuration } from "../spike-sorting-views";
import { useUrlState } from "@fi-sci/figurl-interface";
import { useSelectedUnitIds } from "../spike-sorting-views";
import { FunctionComponent, useCallback, useMemo } from "react";
import { getAbbreviatedUnitIdsString, getAllLabelChoices } from "../spike-sorting-views";
import { SortingSelectionViewData } from "./SortingSelectionViewData";

type Props = {
    data: SortingSelectionViewData
    width: number
    height: number
}

const SortingSelectionView: FunctionComponent<Props> = ({width, height}) => {
    const {sortingCuration} = useSortingCuration()
    const {selectedUnitIds: selectedUnitIdsSet, orderedUnitIds, allOrderedUnitIds, unitIdSelectionDispatch, restrictedUnitIds} = useSelectedUnitIds()
    const selectedUnitIds = useMemo(() => (
        orderedUnitIds.filter(x => (selectedUnitIdsSet && selectedUnitIdsSet.has(x))
    )), [selectedUnitIdsSet, orderedUnitIds])
    const labelChoices = useMemo(() => (
        getAllLabelChoices(sortingCuration, undefined)
    ), [sortingCuration])
    const labelSelectedStates = useMemo(() => (
        getLabelSelectedStates(labelChoices, sortingCuration, selectedUnitIds, orderedUnitIds)
    ), [labelChoices, sortingCuration, selectedUnitIds, orderedUnitIds])
    // const labelChoicesIncludingNot = useMemo(() => (
    //     [...labelChoices, ...labelChoices.map(x => (`not:${x}`))]
    // ), [labelChoices])
    const handleClick = useCallback((label: string, cbState: 'selected' | 'unselected' | 'partially-selected' | 'disabled') => {
        if ((cbState === 'unselected') || (cbState === 'partially-selected')) {
            const newSelectedIds = orderedUnitIds.filter(id => {
                if (selectedUnitIdsSet.has(id)) return true
                if (!label.startsWith('not:')) {
                    return ((sortingCuration?.labelsByUnit || {})[id] || []).includes(label)
                }
                else {
                    const nottedLabel = label.slice('not:'.length)
                    return !((sortingCuration?.labelsByUnit || {})[id] || []).includes(nottedLabel)
                }
            })
            unitIdSelectionDispatch({
                type: 'SET_SELECTION',
                incomingSelectedUnitIds: newSelectedIds
            })
        }
        else if (cbState === 'selected') {
            const newSelectedIds = orderedUnitIds.filter(id => {
                if (!selectedUnitIdsSet.has(id)) return false
                if (!label.startsWith('not:')) {
                    return !((sortingCuration?.labelsByUnit || {})[id] || []).includes(label)
                }
                else {
                    const nottedLabel = label.slice('not:'.length)
                    return ((sortingCuration?.labelsByUnit || {})[id] || []).includes(nottedLabel)
                }
            })
            unitIdSelectionDispatch({
                type: 'SET_SELECTION',
                incomingSelectedUnitIds: newSelectedIds
            })
        }
    }, [selectedUnitIdsSet, orderedUnitIds, sortingCuration, unitIdSelectionDispatch])
    const handleClearSelectedUnits = useCallback(() => {
        unitIdSelectionDispatch({
            type: 'SET_SELECTION',
            incomingSelectedUnitIds: []
        })
    }, [unitIdSelectionDispatch])
    const handleRestrictToSelectedUnits = useCallback(() => {
        unitIdSelectionDispatch({
            type: 'SET_RESTRICTED_UNITS',
            newRestrictedUnitIds: selectedUnitIds
        })
    }, [unitIdSelectionDispatch, selectedUnitIds])
    const handleClearUnitRestriction = useCallback(() => {
        unitIdSelectionDispatch({
            type: 'SET_RESTRICTED_UNITS',
            newRestrictedUnitIds: undefined
        })
    }, [unitIdSelectionDispatch])
    const {updateUrlState} = useUrlState()
    const handleSaveSelection = useCallback(() => {
        updateUrlState({
            selectedUnitIds,
            visibleUnitIds: restrictedUnitIds
        })
    }, [selectedUnitIds, updateUrlState, restrictedUnitIds])
    return (
        <div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
            <h3>Selection</h3>
            <div>
                Selected units:&nbsp;{getAbbreviatedUnitIdsString(selectedUnitIds, 50)}
            </div>
            <hr />
            <div>
                {
                    [false, true].map(useNot => (
                        <div key={useNot ? 'true' : 'false'}>
                            {
                                labelChoices.map(label => (useNot ? 'not:' + label : label)).map(label => (
                                    <span key={label}>
                                        <Checkbox
                                            checked={['selected', 'partially-selected'].includes(labelSelectedStates[label])}
                                            indeterminate={['partially-selected'].includes(labelSelectedStates[label])}
                                            disabled={['disabled'].includes(labelSelectedStates[label])}
                                            onClick={() => {handleClick(label, labelSelectedStates[label])}}
                                            style={{
                                                ...(labelSelectedStates[label] === 'partially-selected' ? (
                                                    {color: 'gray'}
                                                ) : {}),
                                                paddingRight: 3,
                                                paddingLeft: 3,
                                            }}
                                        />
                                        <span style={{paddingRight: 7}}>
                                            {label}
                                        </span>
                                    </span>
                                ))
                            }      
                        </div>
                    ))
                }
            </div>
            <div>
                <Button onClick={handleClearSelectedUnits}>Clear selected units</Button>
            </div>
            <hr />
            <div>
                {
                    orderedUnitIds.length === allOrderedUnitIds.length ? (
                        <div>No unit restriction</div>
                    ) : (
                        <span>
                            <div>Restricted to {orderedUnitIds.length} / {allOrderedUnitIds.length} units</div>
                            <div>Restricted units:&nbsp;{getAbbreviatedUnitIdsString(orderedUnitIds, 50)}</div>
                        </span>
                    )
                }
                <Button onClick={handleRestrictToSelectedUnits}>Restrict to selected units</Button>
                <Button onClick={handleClearUnitRestriction}>Clear unit restriction</Button>
            </div>
            <hr />
            <div>
                <Button onClick={handleSaveSelection}>Save selection</Button>
            </div>
        </div>
    )
}

const getLabelSelectedStates = (labelChoices: string[], sortingCuration: SortingCuration | undefined, selectedUnitIds: (string | number)[], allUnitIds: (string | number)[]) => {
    const ret: {[label: string]: 'selected' | 'unselected' | 'partially-selected' | 'disabled'} = {}
    const selectedUnitIdsSet = new Set(selectedUnitIds)
    for (const label of labelChoices) {
        const idsWithLabel = allUnitIds.filter(id => (sortingCuration && ((sortingCuration.labelsByUnit || {})[id] || []).includes(label)))
        if (idsWithLabel.length === 0) {
            ret[label] = 'disabled'
        }
        else {
            const x = idsWithLabel.filter(id => (selectedUnitIdsSet.has(id)))
            if (x.length === idsWithLabel.length) ret[label] = 'selected'
            else if (x.length > 0) ret[label] = 'partially-selected'
            else ret[label] = 'unselected'
        }
    }

    // not
    for (const label of labelChoices) {
        const idsWithLabel = allUnitIds.filter(id => {
            const a: string[] = sortingCuration ? (sortingCuration.labelsByUnit || {})[id] || [] : []
            return !a.includes(label)
        })
        if ((idsWithLabel.length === 0) || (idsWithLabel.length === allUnitIds.length)) {
            ret['not:' + label] = 'disabled'
        }
        else {
            const x = idsWithLabel.filter(id => (selectedUnitIdsSet.has(id)))
            if (x.length === idsWithLabel.length) ret['not:' + label] = 'selected'
            else if (x.length > 0) ret['not:' + label] = 'partially-selected'
            else ret['not:' + label] = 'unselected'
        }
    }
    return ret
}

export default SortingSelectionView