import { funcToTransform } from "labbox-react/components/CanvasWidget"
import { Brush, CanvasPainter, Font, Pen } from "labbox-react/components/CanvasWidget/CanvasPainter"
import { Recording, Sorting } from "python/sortingview/gui/pluginInterface"
import getAxisTicks, { AxisTick } from "python/sortingview/gui/util/getAxisTicks"
import { getArrayMax, getArrayMin } from "../../common/utility"
import { SpikeAmplitudesData } from "./useSpikeAmplitudesData"

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const colorList = [
    'blue',
    'green',
    'red',
    'orange',
    'purple',
    'cyan'
]
export const colorForUnitId = (unitId: number | number[]): string => {
    if (Array.isArray(unitId)) return colorForUnitId(Math.min(...unitId))
    while (unitId < 0) unitId += colorList.length
    return colorList[unitId % colorList.length]
} 

class SpikeAmplitudesPanel {
    _updateHandler: (() => void) | null = null
    _timeRange: {min: number, max: number} | null = null
    _calculationScheduled: boolean = false
    _calculationError: Error | null = null
    _yrange: {min: number, max: number} | null = null
    _globalAmplitudeRange: {min: number, max: number} | null = null
    _includeZero = true
    _amplitudes: number[] | undefined = undefined
    _effectiveYRange: {min: number, max: number} | null = null
    constructor(private args: {spikeAmplitudesData: SpikeAmplitudesData | null, recording: Recording, sorting: Sorting, unitId: number | number[]}) {
    }
    setTimeRange(timeRange: {min: number, max: number}) {
        this._timeRange = timeRange
    }
    paint(painter: CanvasPainter, completenessFactor: number) {
        const timeRange = this._timeRange
        if (!timeRange) return
        const font: Font = {pixelSize: 12, family: 'Arial'}
        const color = colorForUnitId(this.args.unitId)
        const pen: Pen = {color: 'black'}
        const brush: Brush = {color}
        if (!this.args.spikeAmplitudesData) return
        const result = this.args.spikeAmplitudesData.getSpikeAmplitudes(this.args.unitId)
        if ((result) && (result.timepoints) && (result.amplitudes)) {
            const { timepoints, amplitudes } = result
            this._amplitudes = amplitudes
            let yrange = this._yrange || this.autoYRange()
            if (!yrange) return
            if (this._includeZero) {
                yrange = {min: Math.min(0, yrange.min), max: Math.max(0, yrange.max)}
            }
            this._effectiveYRange = yrange
            painter.drawLine(timeRange.min, 0, timeRange.max, 0, {color: 'gray'})
            const {majorTicks} = getAxisTicks(yrange.min, yrange.max)
            for (let t of majorTicks) {
                const y0 = (t.value - yrange.min) / (yrange.max - yrange.min)
                painter.drawLine(timeRange.min, y0, timeRange.max, y0, {color: 'lightgray', lineDash: [5, 15]})    
            }
            const N = timepoints.length
            for (let i = 0; i < N; i++) {
                const t = timepoints[i]
                const a = amplitudes[i]
                const y = (a - yrange.min) / (yrange.max - yrange.min)
                if ((timeRange.min <= t) && (t <= timeRange.max)) {
                    painter.drawMarker([t, y], {radius: 3, pen, brush})
                }
            }
        }
        else {
            this._effectiveYRange = null
            painter.drawText({
                rect: {xmin: timeRange.min, xmax: timeRange.max, ymin: 0, ymax: 1},
                alignment: {Horizontal: 'AlignCenter', Vertical: 'AlignCenter'},
                font, pen, brush,
                text: 'calculating'
            })
        }
    }
    paintYAxis(painter: CanvasPainter, width: number, height: number) {
        let yrange = this._effectiveYRange
        if (yrange) {
            paintYAxis(painter, {xmin: 0, xmax: width, ymin: 0, ymax: height}, {ymin: yrange.min, ymax: yrange.max, label:'Abs. spike amplitude'})
        }
    }
    label() {
        return this.args.unitId + ''
    }
    amplitudeRange() {
        if (this._amplitudes) {
            return {min: getArrayMin(this._amplitudes), max: getArrayMax(this._amplitudes)}
        }
        else return null
    }
    setGlobalAmplitudeRange(r: {min: number, max: number}) {
        this._globalAmplitudeRange = r
    }
    autoYRange() {
        if (this._globalAmplitudeRange) {
            return this._globalAmplitudeRange
        }
        return this.amplitudeRange()
    }
    setYRange(yrange: {min: number, max: number}) {
        this._yrange = yrange
    }
    register(onUpdate: () => void) {
        this._updateHandler = onUpdate
    }
}

const drawTick = (painter: CanvasPainter, tick: AxisTick, o: {xmin: number, xmax: number, tickSize: number, majorTickSize: number, drawLabel: boolean}) => {
    const {xmin, xmax, tickSize, majorTickSize, drawLabel} = o
    painter.drawLine(xmax - tickSize, tick.value, xmax, tick.value, {color: 'black'})
    if (drawLabel) {
        painter.drawText({
            rect: {xmin, xmax: xmax - majorTickSize - 3, ymin: tick.value, ymax: tick.value},
            alignment: {Horizontal: 'AlignRight', Vertical: 'AlignCenter'},
            font: {family: 'Arial', pixelSize: 10},
            pen: {color: 'black'},
            brush: {color: 'black'},
            text: tick.label,
            orientation: 'Horizontal'
        })
    }
}

const paintYAxis = (painter: CanvasPainter, pixelRect: {xmin: number, xmax: number, ymin: number, ymax: number}, {label, ymin, ymax}: {label: string, ymin: number, ymax: number}) => {
    const {xmin, xmax, ymin: pixelYMin, ymax: pixelYmax} = pixelRect
    const painter2 = painter.transform(funcToTransform(p => (
        [p[0], pixelYmax - (p[1] - ymin) / (ymax - ymin) * (pixelYmax - pixelYMin)]
    )))
    painter2.drawLine(xmax, ymin, xmax, ymax, {color: 'black'})
    const majorTickSize = 10
    const minorTickSize = 5
    painter2.drawText({
        rect: {xmin, xmax: xmax - majorTickSize - 40, ymin, ymax},
        alignment: {Horizontal: 'AlignRight', Vertical: 'AlignCenter'},
        font: {family: 'Arial', pixelSize: 12},
        pen: {color: 'black'},
        brush: {color: 'black'},
        text: label,
        orientation: 'Vertical'
    })
    const {majorTicks, minorTicks} = getAxisTicks(ymin, ymax)
    for (let t of minorTicks) {
        drawTick(painter2, t, {xmin, xmax, tickSize: minorTickSize, majorTickSize, drawLabel: false})
    }
    for (let t of majorTicks) {
        drawTick(painter2, t, {xmin, xmax, tickSize: majorTickSize, majorTickSize, drawLabel: true})
    }
}

class CombinedPanel {
    constructor(private panels: SpikeAmplitudesPanel[], private labelString: string) {
    }
    setTimeRange(timeRange: {min: number, max: number}) {
        this.panels.forEach(p => p.setTimeRange(timeRange))
    }
    paint(painter: CanvasPainter, completenessFactor: number) {
        this.panels.forEach(p => p.paint(painter, completenessFactor))
    }
    paintYAxis(painter: CanvasPainter, width: number, height: number) {
        const p = this.panels[0]
        p && p.paintYAxis && p.paintYAxis(painter, width, height)
    }
    label() {
        return this.labelString
    }
    register(onUpdate: () => void) {
        this.panels.forEach(p => p.register(() => {
            onUpdate()
        }))
    }
}

export const combinePanels = (panels: SpikeAmplitudesPanel[], label: string) => {
    return new CombinedPanel(panels, label)
}

export default SpikeAmplitudesPanel