import { PGPlot, PlotGrid, Splitter, VerticalScrollView } from '../../core-views';
import { ToolbarItem } from '../../timeseries-views/ViewToolbar';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { idToNum, INITIALIZE_UNITS, sortIds, useSelectedUnitIds } from '../context-unit-selection';
import { getUnitColor } from '../view-units-table';
import { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbar, UnitsTableBottomToolbarOptions, ViewToolbar } from '../ViewToolbar';
import { viewToolbarWidth } from '../ViewToolbar/ViewToolbar';
import UnitImageBox from './UnitImageBox';
import { UnitImagesViewData } from './UnitImagesViewData';

type UnitImagesViewProps = {
    data: UnitImagesViewData
    width: number
    height: number
}

const UnitImagesView: FunctionComponent<UnitImagesViewProps> = ({data, width, height}) => {
    const {items, itemWidth, itemHeight} = data

    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>(defaultUnitsTableBottomToolbarOptions)
    const {selectedUnitIds, orderedUnitIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()
    const [plotBoxScaleFactor, setPlotBoxScaleFactor] = useState<number>(1)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(items.map(item => item.unitId))})
    }, [items, unitIdSelectionDispatch])

    const plots: PGPlot[] = useMemo(() => (items.filter(a => (toolbarOptions.onlyShowSelected ? selectedUnitIds.has(a.unitId) : true)).map(item => ({
        unitId: item.unitId,
        key: item.unitId,
        label: `Unit ${item.unitId}`,
        labelColor: getUnitColor(idToNum(item.unitId)),
        clickHandler: !toolbarOptions.onlyShowSelected ? plotClickHandlerGenerator(item.unitId) : undefined,
        props: {
            imageUrl: item.url,
            width: itemWidth * plotBoxScaleFactor,
            height: itemHeight * plotBoxScaleFactor
        }
    }))), [items, plotClickHandlerGenerator, toolbarOptions.onlyShowSelected, selectedUnitIds, plotBoxScaleFactor, itemWidth, itemHeight])
    const plots2: PGPlot[] = useMemo(() => {
        if (orderedUnitIds) {
            return orderedUnitIds.map(unitId => (plots.filter(a => (a.unitId === unitId))[0])).filter(p => (p !== undefined))
        }
        else return plots
    }, [plots, orderedUnitIds])

    const customToolbarActions: ToolbarItem[] = useMemo(() => {
        const boxSizeActions: ToolbarItem[] = [
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s * 1.3)),
                title: 'Increase box size',
                icon: <FaPlus />
            },
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s / 1.3)),
                title: 'Decrease box size',
                icon: <FaMinus />
            }
        ]
        return [
            ...boxSizeActions
        ]
    }, [])

    const bottomToolbarHeight = 30
    const TOOLBAR_WIDTH = viewToolbarWidth // hard-coded for now

    return (
        <div>
            <Splitter
                width={width}
                height={height - bottomToolbarHeight}
                initialPosition={TOOLBAR_WIDTH}
                adjustable={false}
            >
                <ViewToolbar
                    width={TOOLBAR_WIDTH}
                    height={height}
                    customActions={customToolbarActions}
                />
                <VerticalScrollView width={0} height={0}>
                    <PlotGrid
                        plots={plots2}
                        plotComponent={UnitImageBox}
                        selectedPlotKeys={toolbarOptions.onlyShowSelected ? undefined : selectedUnitIds}
                    />
                </VerticalScrollView>
            </Splitter>
            <div style={{position: 'absolute', top: height - bottomToolbarHeight, height: bottomToolbarHeight, overflow: 'hidden'}}>
                <UnitsTableBottomToolbar
                    options={toolbarOptions}
                    setOptions={setToolbarOptions}
                />
            </div>
        </div>
    )
}


export default UnitImagesView