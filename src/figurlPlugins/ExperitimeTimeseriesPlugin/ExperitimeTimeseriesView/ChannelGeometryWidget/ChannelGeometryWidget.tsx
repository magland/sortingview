import CanvasWidget from "figurl/labbox-react/components/CanvasWidget"
import { useLayer, useLayers } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { TimeseriesSelection, TimeseriesSelectionDispatch } from "figurlPlugins/ExperitimeTimeseriesPlugin/interface/TimeseriesSelection"
import React, { useMemo } from "react"
import { ChannelGeometryLayerProps, createChannelGeometryLayer } from "./channelGeometryLayer"

// Okay, so after some hoop-jumping, we've learned the RecordingInfo has:
// - sampling frequency (number), - channel_ids (list of number),
// - channel_groups (list of number), - geom (list of Vec2),
// - num_frames (number), - is_local (boolean).

interface WidgetProps {
    channels: { label: string; id: string; x: number; y: number; }[] // Note: these shouldn't be interacted with directly. Use the bounding boxes in the state, instead.
    selection?: TimeseriesSelection
    selectionDispatch?: TimeseriesSelectionDispatch
    width: number
    height: number
}

const ChannelGeometryWidget = (props: WidgetProps) => {
    const channelGeometryLayerProps: ChannelGeometryLayerProps = useMemo(() => ({
        layoutMode: 'geom',
        channelNames: props.channels.map(e => e.id),
        channelLocations: props.channels.map(e => [e.x, e.y]),
        width: props.width,
        height: props.height,
        selection: props.selection,
        selectionDispatch: props.selectionDispatch,
        channelOpts: {
            showLabels: true,
            maxChannelBoxPixelRadius: 25
        },
        noiseLevel: 0, // not needed
        samplingFrequency: 0 // not needed
    }), [props])
    const layer = useLayer(createChannelGeometryLayer, channelGeometryLayerProps)
    const layers = useLayers([layer])
    return (
        <CanvasWidget
            key='channelGeometryCanvas'
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}

export default ChannelGeometryWidget