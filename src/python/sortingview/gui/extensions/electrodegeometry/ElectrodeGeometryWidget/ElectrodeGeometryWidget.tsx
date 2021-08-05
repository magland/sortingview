import React, { useMemo } from "react"
import CanvasWidget from "figurl/labbox-react/components/CanvasWidget"
import { useLayer, useLayers } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { RecordingSelection, RecordingSelectionDispatch } from "../../../pluginInterface"
import { createElectrodesLayer } from "../../averagewaveforms/AverageWaveformsView/electrodesLayer"
import { ElectrodeLayerProps } from "../../averagewaveforms/AverageWaveformsView/WaveformWidget"
import { Electrode } from "./electrodeGeometryLayer"

// Okay, so after some hoop-jumping, we've learned the RecordingInfo has:
// - sampling frequency (number), - channel_ids (list of number),
// - channel_groups (list of number), - geom (list of Vec2),
// - num_frames (number), - is_local (boolean).

interface WidgetProps {
    electrodes: Electrode[] // Note: these shouldn't be interacted with directly. Use the bounding boxes in the state, instead.
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
    width: number
    height: number
}

const ElectrodeGeometryWidget = (props: WidgetProps) => {
    const electrodeLayerProps: ElectrodeLayerProps = useMemo(() => ({
        layoutMode: 'geom',
        electrodeIds: props.electrodes.map(e => e.id),
        electrodeLocations: props.electrodes.map(e => [e.x, e.y]),
        width: props.width,
        height: props.height,
        selection: props.selection,
        selectionDispatch: props.selectionDispatch,
        electrodeOpts: {
            showLabels: true,
            maxElectrodePixelRadius: 25
        },
        noiseLevel: 0, // not needed
        samplingFrequency: 0 // not needed
    }), [props])
    const layer = useLayer(createElectrodesLayer, electrodeLayerProps)
    const layers = useLayers([layer])
    return (
        <CanvasWidget
            key='electrodeGeometryCanvas'
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}

export default ElectrodeGeometryWidget