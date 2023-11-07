import { INITIALIZE_UNITS, sortIds, useSelectedUnitIds } from '..'
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import {MatrixWidget, BottomToolbar} from '../view-unit-similarity-matrix'
import { ConfusionMatrixViewData } from './ConfusionMatrixViewData'

type Props = {
    data: ConfusionMatrixViewData
    width: number
    height: number
}

const defaultRange: [number, number] = [0, 1]

export type HoveredInfo = {
    unitId1: number | string
    unitId2: number | string
    value: number | undefined
}

const ConfusionMatrixView: FunctionComponent<Props> = ({ data, width, height }) => {
    const { selectedUnitIds, unitIdSelectionDispatch } = useSelectedUnitIds()
    const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | undefined>(undefined)

    const {sorting1UnitIds, sorting2UnitIds, unitEventCounts, matchingUnitEventCounts} = data

    const {allUnitIds1, allUnitIds2} = useMemo(() => (
        {
            allUnitIds1: sortIds([...sorting1UnitIds]),
            allUnitIds2: sortIds([...sorting2UnitIds])
        }
    ), [sorting1UnitIds, sorting2UnitIds])

    const allUnitIds = useMemo(() => ([...allUnitIds1, ...allUnitIds2]), [allUnitIds1, allUnitIds2])

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: allUnitIds})
    }, [allUnitIds, unitIdSelectionDispatch])

    const eventCountsForIds = useMemo(() => {
        const ret: {[id: number | string]: number} = {}
        for (let x of unitEventCounts) {
            ret[x.unitId] = x.count
        }
        return ret
    }, [unitEventCounts])

    const matchingEventCountsForIdPairs = useMemo(() => {
        const ret: {[idPair: string]: number} = {}
        for (let x of matchingUnitEventCounts) {
            ret[`${x.unitId1}/${x.unitId2}`] = x.count
        }
        return ret
    }, [matchingUnitEventCounts])

    const matrix = useMemo(() => {
        // const indsForIds1: { [k: number | string]: number } = {}
        // allUnitIds1.forEach((id, i) => {
        //     indsForIds1[id] = i
        // })
        // const indsForIds2: { [k: number | string]: number } = {}
        // allUnitIds2.forEach((id, i) => {
        //     indsForIds2[id] = i
        // })
        const m: number[][] = []
        allUnitIds1.forEach((id1) => { // avoid unused variables
            const a: number[] = []
            allUnitIds2.forEach((id2) => {
                const x = matchingEventCountsForIdPairs[`${id1}/${id2}`]
                if (x !== undefined) {
                    const ct1 = eventCountsForIds[id1]
                    const ct2 = eventCountsForIds[id2]
                    if ((ct1 !== undefined) && (ct2 !== undefined) && (ct1 + ct2 - x > 0)) {
                        const p = x  / (ct1 + ct2 - x)
                        a.push(p)
                    }
                    else a.push(NaN)
                }
                else {
                    a.push(NaN)
                }
            })
            m.push(a)
        })

        return m
    }, [allUnitIds1, allUnitIds2, eventCountsForIds, matchingEventCountsForIdPairs])

    const handleSetSelectedUnitIds = useCallback((x: (number | string)[]) => {
        unitIdSelectionDispatch({
            type: 'SET_SELECTION',
            incomingSelectedUnitIds: x
        })
    }, [unitIdSelectionDispatch])

    const bottomToolbarHeight = 30
    return (
        <div>
            <MatrixWidget
                unitIds1={allUnitIds1}
                unitIds2={allUnitIds2}
                selectedUnitIds={selectedUnitIds}
                onSetSelectedUnitIds={handleSetSelectedUnitIds}
                matrix={matrix}
                range={defaultRange}
                setHoveredInfo={setHoveredInfo}
                width={width}
                height={height - bottomToolbarHeight}
            />
            <BottomToolbar
                hoveredInfo={hoveredInfo}
            />
        </div>
    )
}

export default ConfusionMatrixView