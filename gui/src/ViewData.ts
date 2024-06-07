import { isTiledImageData, TiledImageData } from './libraries/component-tiled-image'
import { isOneOf } from './libraries/core-utils'
import { CompositeViewData, isCompositeViewData } from "./libraries/view-composite"
import { ConsoleViewData, isConsoleViewData } from "./libraries/view-console"
import { EpochsViewData, isEpochsViewData } from "./libraries/view-epochs"
import { ExperimentalSelector1ViewData, isExperimentalSelector1ViewData } from './libraries/view-experimental-selector-1'
import { isMountainLayoutViewData, MountainLayoutViewData } from "./libraries/view-mountain-layout"
import { isMultiTimeseriesViewData, MultiTimeseriesViewData } from "./libraries/view-multi-timeseries"
import { isPositionPdfPlotViewData, PositionPdfPlotViewData } from "./libraries/view-position-pdf-plot"
import { isPositionPlotViewData, PositionPlotViewData } from "./libraries/view-position-plot"
import { isSortingCurationViewData, SortingCurationViewData } from './libraries/view-sorting-curation'
import { isSortingLayoutViewData, SortingLayoutViewData } from './libraries/view-sorting-layout'
import { isSortingSelectionViewData, SortingSelectionViewData } from './libraries/view-sorting-selection'
import { isSummaryViewData, SummaryViewData } from "./libraries/view-summary"
import { isTest1ViewData, Test1ViewData } from './libraries/view-test-1'
import { EphysTracesViewData, isEphysTracesViewData } from './libraries/view-ephys-traces-dev'
import { isPlotlyFigureViewData, PlotlyFigureViewData } from './libraries/core-views/view-plotly-figure'

export type ViewData =
    CompositeViewData |
    MultiTimeseriesViewData |
    SummaryViewData |
    MountainLayoutViewData |
    PositionPlotViewData |
    PositionPdfPlotViewData |
    EpochsViewData |
    ConsoleViewData |
    SortingLayoutViewData |
    SortingCurationViewData |
    TiledImageData |
    SortingSelectionViewData |
    ExperimentalSelector1ViewData |
    Test1ViewData |
    EphysTracesViewData |
    PlotlyFigureViewData

export const isViewData = (x: any): x is ViewData => {
    return isOneOf([
        isCompositeViewData,
        isMultiTimeseriesViewData,
        isSummaryViewData,
        isMountainLayoutViewData,
        isPositionPlotViewData,
        isPositionPdfPlotViewData,
        isEpochsViewData,
        isConsoleViewData,
        isSortingLayoutViewData,
        isSortingCurationViewData,
        isTiledImageData,
        isSortingSelectionViewData,
        isExperimentalSelector1ViewData,
        isTest1ViewData,
        isEphysTracesViewData,
        isPlotlyFigureViewData
    ])(x)
}