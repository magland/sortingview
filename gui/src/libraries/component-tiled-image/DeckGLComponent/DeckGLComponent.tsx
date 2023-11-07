import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { load } from '@loaders.gl/core';
import { ImageLoader } from '@loaders.gl/images';
import { clamp } from '@math.gl/core';
import { COORDINATE_SYSTEM, OrthographicView } from 'deck.gl';
import { getFileDataUrl } from '@figurl/interface';
import React, { FunctionComponent, useMemo } from 'react';


export interface Props {
    layers: {
        tileSize: number
        imageWidth: number
        imageHeight: number
        numZoomLevels: number
        imageFiles: {[key: string]: string}
    }[]
    layerIndex: number
}

// const ROOT_URL =
//   'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/image-tiles/moon.image';


const autoHighlight = true

const onTilesLoad = () => {}

const DeckGLComponent: FunctionComponent<Props> = ({layers, layerIndex}) => {
    const layer0 = layers[0]
    const {numZoomLevels: numZoomLevels0, imageWidth: imageWidth0, imageHeight: imageHeight0} = layer0
    const minZoom = -Math.floor(Math.min(numZoomLevels0 - 1, (Math.log2(Math.max(imageWidth0, imageHeight0)) - 8)))
    const initialViewState = useMemo(() => ({
        target: [imageWidth0 / 2, imageHeight0 / 2],
        zoom: minZoom
    }), [minZoom, imageWidth0, imageHeight0])

    const views = useMemo(() => (
        [new OrthographicView({id: 'ortho'})]
    ), [])

    const deckGLLayers = useMemo(() => (
        layers.map((layer, ii) => {
            const {tileSize, imageWidth, imageHeight, numZoomLevels, imageFiles} = layer
            return new TileLayer({
                id: `TileLayer-${ii}`, // each layer needs a unique ID
                pickable: true,
                tileSize,
                autoHighlight,
                highlightColor: [255, 255, 255, 20],
                minZoom: -7,
                maxZoom: 0,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                extent: [0, 0, imageWidth, imageHeight],
                // See: https://deck.gl/docs/upgrade-guide
                getTileData: async ({index}: {index: {x: number, y: number, z: number}}) => {
                    const {x, y, z} = index
                    console.info(`Get tile data ${x} ${y} ${z} ${ii}`)
                    // const data = await load(`${ROOT_URL}/moon.image_files/${15 + z}/${x}_${y}.jpeg`);
                    const key = `${numZoomLevels + z}_${x}_${y}`
                    const uri = imageFiles[key]
                    if (!uri) {
                        throw Error(`Unable to find image: ${key}`)
                    }
                    const dataUrl = await getFileDataUrl(uri)
                    if (!dataUrl) {
                        throw Error(`Unable to find image file: ${uri}`)
                    }
                    const data = await load(dataUrl, ImageLoader)
                    return data
                },
                onViewportLoad: onTilesLoad,

                renderSubLayers: (props: {tile: any, data: any}) => {
                    const {
                        bbox: {left, bottom, right, top}
                    } = props.tile;
                    // const {width, height} = dimensions;
                    return new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [
                        clamp(left, 0, imageWidth),
                        clamp(bottom, 0, imageHeight),
                        clamp(right, 0, imageWidth),
                        clamp(top, 0, imageHeight)
                    ]
                    });
                },
                visible: layerIndex === ii
            })
        })
    ), [layers, layerIndex])

    // const deckGLLayers = useMemo(() => {
    //     const {tileSize, imageWidth, imageHeight, numZoomLevels} = layers[0]
    //     return [new TileLayer({
    //         pickable: true,
    //         tileSize,
    //         autoHighlight,
    //         highlightColor: [255, 255, 255, 20],
    //         minZoom: -7,
    //         maxZoom: 0,
    //         coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    //         extent: [0, 0, imageWidth, imageHeight],
    //         getTileData: async ({x, y, z}: {x: number, y: number, z: number}) => {
    //             console.info(`Get tile data ${x} ${y} ${z} ${layerIndex.current}`)
    //             const {imageFiles} = layers[layerIndex.current]
    //             // const data = await load(`${ROOT_URL}/moon.image_files/${15 + z}/${x}_${y}.jpeg`);
    //             const key = `${numZoomLevels + z}_${x}_${y}`
    //             const uri = imageFiles[key]
    //             if (!uri) {
    //                 throw Error(`Unable to find image: ${key}`)
    //             }
    //             const dataUrl = await getFileDataUrl(uri)
    //             if (!dataUrl) {
    //                 throw Error(`Unable to find image file: ${uri}`)
    //             }
    //             const data = await load(dataUrl, ImageLoader)
    //             return data
    //         },
    //         onViewportLoad: onTilesLoad,

    //         renderSubLayers: (props: {tile: any, data: any}) => {
    //             console.log('--- renderSubLayers')
    //             const {
    //                 bbox: {left, bottom, right, top}
    //             } = props.tile;
    //             // const {width, height} = dimensions;
    //             return new BitmapLayer(props, {
    //             data: null,
    //             image: props.data,
    //             bounds: [
    //                 clamp(left, 0, imageWidth),
    //                 clamp(bottom, 0, imageHeight),
    //                 clamp(right, 0, imageWidth),
    //                 clamp(top, 0, imageHeight)
    //             ]
    //             });
    //         },

    //         opacity: 0.2
    //         // updateTriggers: {
    //         //     getTileData: getTileDataUpdateTrigger
    //         // }
    //     })]
    // }, [layers])

    return (
        <DeckGL
            views={views}
            layers={deckGLLayers}
            initialViewState={initialViewState}
            controller={true}
        />
    )
}

export default DeckGLComponent