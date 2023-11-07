import { Checkbox } from "@material-ui/core";
import { SortingCuration, useSortingCuration } from "..";
import { useSelectedUnitIds } from "..";
import { FunctionComponent, useCallback, useEffect, useMemo } from "react";
import { SortingCuration2ViewData } from "./SortingCuration2ViewData";
import SaveControl from "./SaveControl";
import { useUrlState } from "@figurl/interface";

type Props = {
    data: SortingCuration2ViewData
    width: number
    height: number
}

const standardLabelChoices = ['accept', 'reject', 'noise', 'artifact', 'mua']

const SortingCuration2View: FunctionComponent<Props> = ({data, width, height}) => {
    const {labelChoices: labelChoicesFromData} = data
    const {sortingCuration, sortingCurationDispatch, setLabelChoices} = useSortingCuration()
    const {selectedUnitIds: selectedUnitIdsSet, orderedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()

    const {urlState, updateUrlState} = useUrlState()
	const sortingCurationUri: string | undefined = useMemo(() => (urlState['sortingCuration']), [urlState])
    const initialSortingCurationUri: string | undefined = useMemo(() => (urlState['initialSortingCuration']), [urlState])
    const setSortingCurationUri = useCallback((uri: string) => {updateUrlState({sortingCuration: uri})}, [updateUrlState])

    const selectedUnitIds = useMemo(() => (
        orderedUnitIds.filter(x => (selectedUnitIdsSet && selectedUnitIdsSet.has(x))
    )), [selectedUnitIdsSet, orderedUnitIds])
    const labelChoices = useMemo(() => (
        getAllLabelChoices(sortingCuration, labelChoicesFromData)
    ), [sortingCuration, labelChoicesFromData])
    useEffect(() => {
        setLabelChoices && setLabelChoices(labelChoices)
    }, [labelChoices, setLabelChoices])
    const labelCheckboxStates = useMemo(() => (
        getLabelCheckboxStates(labelChoices, sortingCuration, selectedUnitIds, sortingCurationDispatch === undefined)
    ), [labelChoices, sortingCuration, selectedUnitIds, sortingCurationDispatch])
    const handleClick = useCallback((label: string, cbState: 'checked' | 'unchecked' | 'indeterminant' | 'disabled') => {
        if (sortingCurationDispatch) {
            if ((cbState === 'unchecked') || (cbState === 'indeterminant')) {
                sortingCurationDispatch({
                    type: 'ADD_UNIT_LABEL',
                    unitId: selectedUnitIds,
                    label
                })
            }
            else if (cbState === 'checked') {
                sortingCurationDispatch({
                    type: 'REMOVE_UNIT_LABEL',
                    unitId: selectedUnitIds,
                    label
                })
            }
        }
    }, [selectedUnitIds, sortingCurationDispatch])

    const handleMergeSelected = useCallback(() => {
        if (!sortingCurationDispatch) return
        sortingCurationDispatch({
            type: 'MERGE_UNITS',
            unitIds: selectedUnitIds
        })
        unitIdSelectionDispatch({type: "DESELECT_ALL"})
    }, [sortingCurationDispatch, selectedUnitIds, unitIdSelectionDispatch])

    const handleUnmergeSelected = useCallback(() => {
        if (!sortingCurationDispatch) return
        sortingCurationDispatch({
            type: 'UNMERGE_UNITS',
            unitIds: selectedUnitIds
        })
        unitIdSelectionDispatch({type: "DESELECT_ALL"})
    }, [sortingCurationDispatch, selectedUnitIds, unitIdSelectionDispatch])

    // const {updateUrlState} = useUrlState()
    // const handleSaveSelection = useCallback(() => {
    //     ;(async () => {
    //         const curationUri = await storeFileData(stringifyDeterministicWithSortedKeys(sortingCuration || {}))
    //         updateUrlState({
    //             curation: curationUri
    //         })
    //     })()
    // }, [sortingCuration, updateUrlState])

    const setSortingCuration = useCallback((x: any) => {
        sortingCurationDispatch && sortingCurationDispatch({type: 'SET_CURATION', curation: x as any as SortingCuration})
    }, [sortingCurationDispatch])
    return (
        <div style={{position: 'absolute', width: width - 10, height, overflowY: 'auto', paddingLeft: 10}}>
            <h3>Curation</h3>
            <div>
                Selected units:&nbsp;{getAbbreviatedUnitIdsString(selectedUnitIds, 25)}
            </div>
            <div>
                {
                    labelChoices.map(label => (
                        <span key={label}>
                            <Checkbox
                                checked={['checked', 'indeterminant'].includes(labelCheckboxStates[label])}
                                indeterminate={['indeterminant'].includes(labelCheckboxStates[label])}
                                disabled={['disabled'].includes(labelCheckboxStates[label])}
                                onClick={() => {handleClick(label, labelCheckboxStates[label])}}
                                style={{
                                    ...(labelCheckboxStates[label] === 'indeterminant' ? {color: 'gray'}
                                        : {}),
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
            <hr />
            {
                (selectedUnitIds.length >= 2 && !unitsAreInMergeGroups(selectedUnitIds, sortingCuration)) &&
                    <button key="merge" onClick={handleMergeSelected} disabled={sortingCuration?.isClosed}>
                        Merge selected units: {selectedUnitIds.join(', ')}
                    </button>
            }
            {
                (selectedUnitIds.length > 0 && unitsAreInMergeGroups(selectedUnitIds, sortingCuration)) &&
                    <button key="unmerge" onClick={handleUnmergeSelected} disabled={sortingCuration?.isClosed}>
                        Unmerge units: {selectedUnitIds.join(', ')}
                    </button>
            }
            <hr />
            <SaveControl
                fallbackUri={initialSortingCurationUri}
                uri={sortingCurationUri}
                setUri={setSortingCurationUri}
                object={sortingCuration}
                setObject={setSortingCuration}
            />
            {/* hide this button for now */}
            {/* <div>
                <Button onClick={handleSaveSelection}>Save curation</Button>
            </div> */}
        </div>
    )
}

const unitsAreInMergeGroups = (unitIds: (number | string)[], sortingCuration: SortingCuration | undefined) => {
    if (!sortingCuration) return false
    const mg = sortingCuration.mergeGroups || []
    const all = mg.reduce((prev, g) => [...prev, ...g], []) // all units in merge groups
    for (let unitId of unitIds) {
        if (!all.includes(unitId)) return false
    }
    return true
}

const getLabelCheckboxStates = (labelChoices: string[], sortingCuration: SortingCuration | undefined, selectedUnitIds: (string | number)[], disabled: boolean) => {
    const ret: {[label: string]: 'checked' | 'unchecked' | 'indeterminant' | 'disabled'} = {}
    for (let label of labelChoices) {
        const idsWithLabel = selectedUnitIds.filter(id => (sortingCuration && ((sortingCuration.labelsByUnit || {})[id] || []).includes(label)))
        ret[label] = disabled ? 'disabled' :
            selectedUnitIds.length === 0 ? 'disabled' :
            idsWithLabel.length === 0 ? 'unchecked' :
            idsWithLabel.length === selectedUnitIds.length ? 'checked' :
            'indeterminant'
    }
    return ret
}

export const getAllLabelChoices = (curation: SortingCuration | undefined, labelChoicesFromData: string[] | undefined) => {
    const ret = labelChoicesFromData ? [...labelChoicesFromData] : [...standardLabelChoices]
    if (curation !== undefined) {
        for (let a of Object.values(curation.labelsByUnit || {})) {
            for (let label of a) {
                if (!ret.includes(label)) ret.push(label)
            }
        }
    }
    return ret
}

export const getAbbreviatedUnitIdsString = (unitIds: (string | number)[], maxLength: number) => {
    let ret: string = ''
    for (let id of unitIds) {
        if (ret.length > maxLength - 3) {
            ret = ret + '...'
            break
        }
        ret = ret + id + ' '
    }
    return ret
}

export default SortingCuration2View