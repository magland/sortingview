import { FunctionComponent, useMemo } from 'react'
import { useWheelZoom } from '../../view-unit-similarity-matrix'
import ElectrodeGeometry, { Electrode, LayoutMode } from './sharedDrawnComponents/ElectrodeGeometry'
import { computeElectrodeLocations, xMargin as xMarginDefault } from './sharedDrawnComponents/electrodeGeometryLayout'
import { ElectrodeColors } from './sharedDrawnComponents/electrodeGeometryPainting'
import { getSpikeAmplitudeNormalizationFactor } from './waveformLogic'
import WaveformPlot, { WaveformColors } from './WaveformPlot'


export type WaveformOpts = {
    colors?: WaveformColors
    waveformWidth: number
    showChannelIds: boolean
    useUnitColors: boolean
}

export type WaveformWidgetProps = {
    waveforms: {
        electrodeIndices: number[]
        waveform: number[][]
        waveformStdDev?: number[][]
        waveformColors: WaveformColors
    }[]
    ampScaleFactor: number
    horizontalStretchFactor: number
    electrodes: Electrode[]
    layoutMode: LayoutMode
    hideElectrodes: boolean
    width: number
    height: number
    colors?: ElectrodeColors
    showLabels?: boolean
    peakAmplitude: number
    samplingFrequency?: number
    showChannelIds: boolean
    useUnitColors: boolean
    waveformWidth: number
    disableAutoRotate?: boolean
}

const electrodeColors: ElectrodeColors = {
    border: 'rgb(120, 100, 120)',
    base: 'rgb(240, 240, 240)',
    selected: 'rgb(196, 196, 128)',
    hover: 'rgb(128, 128, 255)',
    selectedHover: 'rgb(200, 200, 196)',
    dragged: 'rgb(0, 0, 196)',
    draggedSelected: 'rgb(180, 180, 150)',
    dragRect: 'rgba(196, 196, 196, 0.5)',
    textLight: 'rgb(162, 162, 162)',
    textDark: 'rgb(32, 150, 150)'
}
const waveformColors: WaveformColors = {
    base: 'black'
}

const defaultElectrodeOpts = {
    colors: electrodeColors,
    showLabels: false
}

export const defaultWaveformOpts: WaveformOpts = {
    colors: waveformColors,
    waveformWidth: 2,
    showChannelIds: true,
    useUnitColors: true
}

// TODO: FIX AVG WAVEFORM NUMPY VIEW
// TODO: FIX SNIPPET BOX
const WaveformWidget: FunctionComponent<WaveformWidgetProps> = (props) => {
    const colors = props.colors ?? defaultElectrodeOpts.colors
    const {electrodes, waveforms, ampScaleFactor: userSpecifiedAmplitudeScaling, horizontalStretchFactor, layoutMode, hideElectrodes, width, height, showChannelIds, useUnitColors, waveformWidth, disableAutoRotate} = props

    const maxElectrodePixelRadius = 1000

    const {handleWheel, affineTransform} = useWheelZoom(width, height, {shift: true, alt: true})

    const geometry = useMemo(() => <ElectrodeGeometry
        electrodes={electrodes}
        width={width}
        height={height}
        layoutMode={layoutMode}
        colors={colors}
        showLabels={showChannelIds}      // Would we ever not want to show labels for this?
        // offsetLabels={true}  // this isn't appropriate for a waveform view--it mislabels the electrodes
        // maxElectrodePixelRadius={defaultMaxPixelRadius}
        maxElectrodePixelRadius={maxElectrodePixelRadius}
        disableSelection={true}      // ??
        disableAutoRotate={disableAutoRotate}
        affineTransform={affineTransform}
    />, [electrodes, width, height, layoutMode, colors, showChannelIds, disableAutoRotate, affineTransform])

    // TODO: Don't do this twice, work it out differently
    const { convertedElectrodes, pixelRadius, xMargin: xMarginBase } = computeElectrodeLocations(width, height, electrodes, layoutMode, maxElectrodePixelRadius, {disableAutoRotate})
    const xMargin = xMarginBase || xMarginDefault

    // Spikes are defined as being some factor greater than the baseline noise.
    const amplitudeNormalizationFactor = useMemo(() => getSpikeAmplitudeNormalizationFactor(props.peakAmplitude), [props.peakAmplitude])
    const yScaleFactor = useMemo(() => (userSpecifiedAmplitudeScaling * amplitudeNormalizationFactor), [userSpecifiedAmplitudeScaling, amplitudeNormalizationFactor])

    // TODO: THIS LOGIC PROBABLY SHOULDN'T BE REPEATED HERE AND IN THE ELECTRODE GEOMETRY PAINT FUNCTION
    const oneElectrodeHeight = layoutMode === 'geom' ? pixelRadius * 2 : height / electrodes.length
    const oneElectrodeWidth = layoutMode === 'geom' ? pixelRadius * 2 : width - xMargin - (showChannelIds ? 2*pixelRadius : 0)
    const waveformPlot = <WaveformPlot
        electrodes={convertedElectrodes}
        waveforms={waveforms}
        oneElectrodeHeight={oneElectrodeHeight}
        oneElectrodeWidth={oneElectrodeWidth}
        horizontalStretchFactor={horizontalStretchFactor}
        yScale={yScaleFactor}
        width={width}
        height={height}
        layoutMode={layoutMode}
        waveformWidth={waveformWidth}
        affineTransform={affineTransform}
        useUnitColors={useUnitColors}
    />

    return (
        <div style={{width, height, position: 'relative'}} onWheel={handleWheel}>
            {!hideElectrodes && geometry}
            {waveformPlot}
        </div>
    )
}

export default WaveformWidget