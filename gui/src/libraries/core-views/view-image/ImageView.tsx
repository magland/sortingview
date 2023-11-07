import { isEqualTo, isString, validateObject } from '../../core-utils';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';

export type ImageViewData = {
    type: 'Image'
    url: string
}
export const isImageViewData = (x: any): x is ImageViewData => {
    return validateObject(x, {
        type: isEqualTo('Image'),
        url: isString
    })
}

type Props = {
    data: ImageViewData
    width: number
    height: number
}

const ImageView: FunctionComponent<Props> = ({data, width, height}) => {
    const {url} = data
    const [naturalSize, setNaturalSize] = useState<{width: number, height: number}>()
    const setElement = useCallback((element: HTMLImageElement | null) => {
        if (!element) return
        element.onload = () => {
            setNaturalSize({width: element.naturalWidth, height: element.naturalHeight})
        }
    }, [])
    const r = useMemo(() => {
        if (!naturalSize) return undefined
        const scale = Math.min(width / naturalSize.width, height / naturalSize.height)
        const W = naturalSize.width * scale
        const H = naturalSize.height * scale
        return {
            x: (width - W) / 2,
            y: (height - H) / 2,
            w: W,
            h: H
        }
    }, [width, height, naturalSize])
    return (
        <div style={{position: 'absolute', width, height}}>
            <img ref={elmt => setElement(elmt)} src={url} width={r?.w} height={r?.h} style={{position: 'absolute', left: r?.x, top: r?.y, width: r?.w, height: r?.h}} alt="" />
        </div>
    )
}

export default ImageView