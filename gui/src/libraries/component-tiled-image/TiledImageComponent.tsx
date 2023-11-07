import { validateObject, isArrayOf, isEqualTo, isJSONObject, isNumber, isString } from '../core-utils';
import React, { FunctionComponent, useMemo, useState } from 'react';
import LeftPanel from './LeftPanel';

export type TiledImageLayerData = {
    label: string
    tileSize: number
    width: number
    height: number
    numZoomLevels: number
    imageFiles: {[key: string]: string}
}

export const isTiledImageLayerData = (x: any): x is TiledImageLayerData => {
    return validateObject(x, {
        label: isString,
        tileSize: isNumber,
        width: isNumber,
        height: isNumber,
        numZoomLevels: isNumber,
        imageFiles: isJSONObject
    })
}

export type TiledImageData = {
    type: 'TiledImage'
    layers: TiledImageLayerData[]
}
export const isTiledImageData = (x: any): x is TiledImageData => {
    return validateObject(x, {
        type: isEqualTo('TiledImage'),
        layers: isArrayOf(isTiledImageLayerData)
    })
}

type Props = {
    data: TiledImageData
    width: number
    height: number
}

// lazy import this to reduce the js bundle size
const DeckGLComponent = React.lazy(() => import('./DeckGLComponent/DeckGLComponent'))

export const TiledImageComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {layers} = data
    const layers2 = useMemo(() => (layers.map(layer => ({
        tileSize: layer.tileSize,
        imageWidth: layer.width,
        imageHeight: layer.height,
        numZoomLevels: layer.numZoomLevels,
        imageFiles: layer.imageFiles
    }))), [layers])
    const layerLabels = useMemo(() => (layers.map(layer => (layer.label))), [layers])
    const [layerIndex, setLayerIndex] = useState<number>(0)
    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 150, height}}>
                <LeftPanel
                    layerLabels={layerLabels}
                    layerIndex={layerIndex}
                    setLayerIndex={setLayerIndex}
                />
            </div>
            <div style={{position: 'absolute', left: 150, top: 0, width: width - 150, height}}>
                <DeckGLComponent
                    layers={layers2}
                    layerIndex={layerIndex}
                />
            </div>
        </div>
    )
}