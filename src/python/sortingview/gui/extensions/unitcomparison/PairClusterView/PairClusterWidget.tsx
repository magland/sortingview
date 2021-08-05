import React, { FunctionComponent, useMemo } from 'react';
import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import { RectangularRegion } from 'figurl/labbox-react/components/CanvasWidget/Geometry';
import { getArrayMax, getArrayMin } from '../../common/utility';
import createClusterLayer, { ClusterLayerProps } from './clusterLayer';

type Props = {
    x: number[]
    y: number[]
    labels: number[]
    width: number
    height: number
}

const PairClusterWidget: FunctionComponent<Props> = ({ x, y, labels, width, height }) => {
    const layerProps = useMemo((): ClusterLayerProps => {
        const xmin = getArrayMin(x)
        const xmax = getArrayMax(x)
        const ymin = getArrayMin(y)
        const ymax = getArrayMax(y)
        const rect: RectangularRegion = {xmin, xmax, ymin, ymax}
        return {
            x,
            y,
            labels,
            rect,
            width,
            height
        }
    }, [x, y, labels, width, height])
    const clusterLayer = useLayer(createClusterLayer, layerProps)
    const layers = useLayers([clusterLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width, height}}
        />
    )
}

export default PairClusterWidget