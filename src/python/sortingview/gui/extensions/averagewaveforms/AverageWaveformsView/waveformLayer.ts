import { funcToTransform } from 'labbox-react/components/CanvasWidget';
import { CanvasPainter } from 'labbox-react/components/CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer, KeyboardEvent, KeyboardEventHandler } from 'labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import setupElectrodes, { ElectrodeBox } from '../../common/sharedCanvasLayers/setupElectrodes';
import { WaveformLayerProps } from './WaveformWidget';

export type WaveformColors = {
    base: string
}
const defaultWaveformColors: WaveformColors = {
    base: 'black'
}
type LayerState = {
    electrodeBoxes: ElectrodeBox[]
}
const initialLayerState = {
    electrodeBoxes: []
}

// If any custom actions have been set (that is, something a user of this component wants to happen in response to a key press)
// expect them to have been passed in with the key 'customActions' & call them here.
export const handleKeyboardEvent: KeyboardEventHandler = (e: KeyboardEvent, layer: CanvasWidgetLayer<WaveformLayerProps, LayerState>): boolean => {
    const props = layer.getProps()
    if (!props) return true
    for (let a of props.customActions || []) {
        if (a.type === 'button') {
            if (a.keyCode === e.keyCode) {
                a.callback()
                return false
            }
        }
    }
    return true
}

export const createWaveformLayer = () => {
    const onPaint = (painter: CanvasPainter, props: WaveformLayerProps, state: LayerState) => {
        const { waveform } = props
        if (!waveform) return
        const opts = props.waveformOpts
        const colors = opts?.colors || defaultWaveformColors
        // const maxAbs = Math.max(...waveform.map(w => Math.max(...w.map(x => Math.abs(x)))))
        painter.wipe()
        // const yScaleFactor = 1 / maxAbs
        const yScaleFactor = (props.ampScaleFactor || 1) / (props.noiseLevel || 1) * 1/10
        for (let i = 0; i < state.electrodeBoxes.length; i++) {
            const e = state.electrodeBoxes[i]
            const painter2 = painter.transform(e.transform).transform(funcToTransform(p => {
                return [p[0] / waveform[i].length, 0.5 - (p[1] / 2) * yScaleFactor]
            }))
            const path = painter2.createPainterPath()
            for (let j = 0; j < waveform[i].length; j ++) {
                path.lineTo(j, waveform[i][j])
            }
            painter2.drawPath(path, {color: colors.base, width: opts?.waveformWidth})
        }
    }
    const onPropsChange = (layer: CanvasWidgetLayer<WaveformLayerProps, LayerState>, props: WaveformLayerProps) => {
        const { width, height, electrodeLocations, electrodeIds } = props
        const { electrodeBoxes, transform } = setupElectrodes({width, height, electrodeLocations, electrodeIds, layoutMode: props.layoutMode, maxElectrodePixelRadius: props.electrodeOpts.maxElectrodePixelRadius})
        layer.setTransformMatrix(transform)
        layer.setState({electrodeBoxes})
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<WaveformLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
            keyboardEventHandlers: [handleKeyboardEvent]
        }
    )
}