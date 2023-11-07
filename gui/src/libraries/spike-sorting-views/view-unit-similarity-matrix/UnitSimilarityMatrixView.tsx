import { INITIALIZE_UNITS, sortIds, useSelectedUnitIds } from '..'
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import BottomToolbar from './BottomToolbar'
import MatrixWidget from './MatrixWidget'
import { UnitSimilarityMatrixViewData } from './UnitSimilarityMatrixViewData'

type Props = {
    data: UnitSimilarityMatrixViewData
    width: number
    height: number
}

const defaultRange: [number, number] = [0, 1]

export type HoveredInfo = {
    unitId1: number | string
    unitId2: number | string
    value: number | undefined
}

const UnitSimilarityMatrixView: FunctionComponent<Props> = ({ data, width, height }) => {
    const { selectedUnitIds, visibleUnitIds, unitIdSelectionDispatch } = useSelectedUnitIds()
    const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | undefined>(undefined)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(data.unitIds)})
    }, [data.unitIds, unitIdSelectionDispatch])

    const unitIdsFilt = useMemo(() => (data.unitIds.filter(u => (!visibleUnitIds || visibleUnitIds.includes(u)))), [data.unitIds, visibleUnitIds])
    const indsForIds = useMemo(() => {
        const indsForIds: { [k: number | string]: number } = {}
        unitIdsFilt.forEach((id, i) => {
            indsForIds[id] = i
        })
        return indsForIds
    }, [unitIdsFilt])
    const matrix = useMemo(() => {
        const m: number[][] = []
        unitIdsFilt.forEach(() => { // avoid unused variables
            const a: number[] = []
            unitIdsFilt.forEach(() => {
                a.push(NaN)
            })
            m.push(a)
        })

        for (let x of data.similarityScores) {
            const ind1 = indsForIds[x.unitId1]
            const ind2 = indsForIds[x.unitId2]
            m[ind1][ind2] = x.similarity
        }
        return m
    }, [indsForIds, unitIdsFilt, data.similarityScores])

    const handleSetSelectedUnitIds = useCallback((x: (number | string)[]) => {
        unitIdSelectionDispatch({
            type: 'SET_SELECTION',
            incomingSelectedUnitIds: x
        })
    }, [unitIdSelectionDispatch])

    const handleSelectSimilarUnits = useCallback(() => {
        const id0 = [...selectedUnitIds][0]
        if (!id0) return
        const i0 = indsForIds[id0]
        const candidates: {id: number | string, similarity: number}[] = []
        for (let j = 0; j < unitIdsFilt.length; j++) {
            if (j !== i0) {
                const v = matrix[i0][j]
                if (!isNaN(v)) {
                    candidates.push({id: unitIdsFilt[j], similarity: v})
                }
            }
        }
        candidates.sort((a, b) => (b.similarity - a.similarity))
        const newSelectedIds = [id0, ...candidates.slice(0, 4).map(x => (x.id))]
        unitIdSelectionDispatch({type: 'SET_SELECTION', incomingSelectedUnitIds: newSelectedIds})
    }, [indsForIds, selectedUnitIds, matrix, unitIdSelectionDispatch, unitIdsFilt])

    const bottomToolbarHeight = 20
    return (
        <div>
            <div style={{position: 'absolute', height: height - bottomToolbarHeight, width}}>
                <MatrixWidget
                    unitIds1={unitIdsFilt}
                    unitIds2={unitIdsFilt}
                    selectedUnitIds={selectedUnitIds}
                    onSetSelectedUnitIds={handleSetSelectedUnitIds}
                    matrix={matrix}
                    range={data.range || defaultRange}
                    setHoveredInfo={setHoveredInfo}
                    width={width}
                    height={height - bottomToolbarHeight}
                />
            </div>
            <div style={{position: 'absolute', top: height - bottomToolbarHeight, height: bottomToolbarHeight, width}}>
                <BottomToolbar
                    hoveredInfo={hoveredInfo}
                    onSelectSimilarUnits={selectedUnitIds.size === 1 ? handleSelectSimilarUnits : undefined}
                />
            </div>
        </div>
    )
}

export default UnitSimilarityMatrixView