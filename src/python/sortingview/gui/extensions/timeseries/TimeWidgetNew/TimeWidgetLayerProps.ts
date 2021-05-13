import { TimeWidgetAction, TimeWidgetPanel } from "./TimeWidgetNew";

export interface TimeWidgetLayerProps {
    width: number,
    height: number,
    customActions: TimeWidgetAction[]
    panels: TimeWidgetPanel[]
    currentTime: number | null
    timeRange: {min: number, max: number} | null
    samplerate: number
    margins: {left: number, right: number, top: number, bottom: number}
    onClick: (args: {timepoint: number, panelIndex: number, y: number}) => void
    onDrag: (args: {newTimeRange: {min: number, max: number}}) => void
    onTimeZoom: (a: {direction: 'out' | 'in'}) => void
    onTimeShiftFrac: (frac: number) => void
    onGotoHome: () => void
    onGotoEnd: () => void
    onRepaintTimeEstimate: (ms: number) => void
}

export interface Point2D {
    x: number,
    y: number
}