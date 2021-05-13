import { funcToTransform } from '../../../commonComponents/CanvasWidget'
import { Brush, CanvasPainter, Font, TextAlignment } from "../../../commonComponents/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "../../../commonComponents/CanvasWidget/CanvasWidgetLayer"
import { getInverseTransformationMatrix, RectangularRegion, TransformationMatrix, Vec2 } from "../../../commonComponents/CanvasWidget/Geometry"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {
    transformation: TransformationMatrix
    inverseTransformation: TransformationMatrix
}

const initialLayerState = {
    transformation: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as any as TransformationMatrix,
    inverseTransformation: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as any as TransformationMatrix
}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { timeRange, samplerate } = layerProps
    if (!timeRange) return

    painter.wipe()

    const pen = {color: 'rgb(22, 22, 22)'}
    const font: Font = {pixelSize: 12, family: 'Arial'}
    const brush: Brush = {color: 'rgb(22, 22, 22)'}

    const { transformation } = state

    const painter2 = painter.transform(transformation)

    painter2.drawLine(timeRange.min, 1, timeRange.max, 1, pen);
    const tickData = get_ticks(timeRange.min, timeRange.max, layerProps.width, samplerate)
    for (let tick of tickData.ticks) {
        painter2.drawLine(tick.t, 1, tick.t, 1 - tick.height, pen)
    }
    const si = tickData.scale_info
    if (si.label) {
        painter2.drawLine(si.t1, 0.45, si.t2, 0.45, pen)
        painter2.drawLine(si.t1, 0.45, si.t1, 0.5, pen)
        painter2.drawLine(si.t2, 0.45, si.t2, 0.5, pen)
        let rect: RectangularRegion = {xmin: si.t1, ymin: 0, xmax: si.t2 - si.t1, ymax: 0.35}
        let alignment: TextAlignment = {Horizontal: "AlignCenter", Vertical: "AlignTop"}
        painter2.drawText({
            rect, alignment, font, pen, brush, text: si.label
        })
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
    const { timeRange, width, height, margins } = layerProps
    if (!timeRange) return
    const transformation = funcToTransform((p: Vec2): Vec2 => {
        const xfrac = (p[0] - timeRange.min) / (timeRange.max - timeRange.min)
        const yfrac = p[1]
        const x = margins.left + xfrac * (width - margins.left - margins.right)
        const y = height - margins.bottom + 50 - yfrac * 50
        return [x, y]
    })
    const inverseTransformation = getInverseTransformationMatrix(transformation)
    layer.setState({
        ...layer.getState(),
        transformation,
        inverseTransformation
    })
    layer.repaintImmediate()
}

interface TicksData {
    ticks: {
        t: number,
        height: number
    }[]
    scale_info: {
        t1: number
        t2: number
        label: string
    }
}

const get_ticks = (t1: number, t2: number, width: number, samplerate: number): TicksData => {

    const ret: TicksData = {
        ticks: [],
        scale_info: {
            t1: 0,
            t2: 0,
            label: ''
        }
    }

    let W = width;

    // adapted from MountainView
    const min_pixel_spacing_between_ticks = 15;
    const tickinfo: {name: string, interval: number}[] = [
        {
            name: '1 ms',
            interval: 1e-3 * samplerate
        },
        {
            name: '10 ms',
            interval: 10 * 1e-3 * samplerate
        },
        {
            name: '100 ms',
            interval: 100 * 1e-3 * samplerate
        },
        {
            name: '1 s',
            interval: 1 * samplerate
        },
        {
            name: '10 s',
            interval: 10 * samplerate
        },
        {
            name: '1 m',
            interval: 60 * samplerate
        },
        {
            name: '10 m',
            interval: 10 * 60 * samplerate
        },
        {
            name: '1 h',
            interval: 60 * 60 * samplerate
        },
        {
            name: '1 day',
            interval: 24 * 60 * 60 * samplerate
        }
    ];

    let first_scale_shown = true;
    let height = 0.2;
    for (let info of tickinfo) {
        const scale_pixel_width = W / (t2 - t1) * info.interval;
        let show_scale = false;
        if (scale_pixel_width >= min_pixel_spacing_between_ticks) {
            show_scale = true;
        }
        else {
            show_scale = false;
        }
        if (show_scale) {
            // msec
            let u1 = Math.floor(t1 / info.interval);
            let u2 = Math.ceil(t2 / info.interval);
            let first_tick = true;
            for (let u = u1; u <= u2; u++) {
                let t = u * info.interval;
                if ((t1 <= t) && (t <= t2)) {
                    let tick = {
                        t: t,
                        height: height
                    };
                    if (first_scale_shown) {
                        if (first_tick) {
                            ret.scale_info = {
                                t1: t1,
                                t2: t1 + info.interval,
                                label: info.name
                            }
                            first_tick = false;
                        }
                        first_scale_shown = false;
                    }
                    ret.ticks.push(tick);
                }
            }
            height += 0.1;
            height = Math.min(height, 0.45);
        }
    }
    // remove duplicates
    ret.ticks = ret.ticks.filter((tick, i) => {
        if (i > 0) {
            if (Math.abs(ret.ticks[i - 1].t - tick.t) < 1) return false
            else return true
        }
        else return true
    })
    return ret
}

export const createTimeAxisLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState
    )
}