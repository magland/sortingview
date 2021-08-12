import React, { FunctionComponent, useMemo } from 'react';
import { ChannelPropertiesInterface, TimeseriesInfo } from '../interface/TimeseriesInfo';
import { TimeseriesSelection, TimeseriesSelectionDispatch } from '../interface/TimeseriesSelection';
import ChannelGeometryWidget from './ChannelGeometryWidget/ChannelGeometryWidget';


interface Props {
    timeseriesInfo: TimeseriesInfo
    width: number
    height: number
    selection?: TimeseriesSelection
    selectionDispatch?: TimeseriesSelectionDispatch
    visibleChannelNames: string[]
}

const ChannelGeometryView: FunctionComponent<Props> = ({timeseriesInfo, width, height, selection, visibleChannelNames, selectionDispatch}) => {
    const ri = timeseriesInfo
    const channels = useMemo(() => (ri ? zipChannels(ri.channelProperties, ri.channelNames) : []).filter(a => (visibleChannelNames.includes(a.id))), [ri, visibleChannelNames])
    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <ChannelGeometryWidget
            channels={channels}
            selection={selection}
            selectionDispatch={selectionDispatch}
            width={width}
            height={height}
        />
    );
}

const zipChannels = (channelProperties: {[key: string]: ChannelPropertiesInterface} | undefined, ids: string[]) => {
    return (ids.map((id, i) => {
        const loc = ((channelProperties || {})[id] || {}).location
        const {x, y} = loc === undefined ? ({
            x: i,
            y: 0
        }) : ({
            x: loc[0],
            y: loc[1] || 0
        })
        return {
            label: id, id, x, y
        }
    }))
}

export default ChannelGeometryView