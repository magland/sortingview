import { TickSet } from "../component-time-scroll-view/YAxisTicks";
import { TimeTick } from "./timeTicks";

export interface SVGExportProps {
    width: number
    height: number
    margins: {left: number, right: number, top: number, bottom: number}
    timeTicks: TimeTick[]
    yTickSet?: TickSet
    gridlineOpts?: {hideX: boolean, hideY: boolean}
    currentTimePixels?: number
    currentTimeIntervalPixels?: [number, number]
    canvasImageData?: string // base64 encoded canvas data
}

export const exportToSVG = (props: SVGExportProps): string => {
    const {width, height, margins, timeTicks, yTickSet, gridlineOpts, currentTimePixels, currentTimeIntervalPixels, canvasImageData} = props
    
    // Create SVG elements
    const svgElements: string[] = []
    
    // SVG header
    svgElements.push(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`)
    
    // Add canvas content as image if available
    if (canvasImageData) {
        svgElements.push(`<image x="0" y="0" width="${width}" height="${height}" href="${canvasImageData}" />`)
    }
    
    // Add axes and gridlines
    svgElements.push(...renderAxesToSVG(props))
    
    // Add cursor elements
    svgElements.push(...renderCursorToSVG(props))
    
    // SVG footer
    svgElements.push('</svg>')
    
    return svgElements.join('\n')
}

const renderAxesToSVG = (props: SVGExportProps): string[] => {
    const {width, height, margins, timeTicks, gridlineOpts, yTickSet} = props
    const elements: string[] = []
    
    const xAxisVerticalPosition = height - margins.bottom
    
    // Time ticks and gridlines
    elements.push(...renderTimeTicksToSVG(timeTicks, xAxisVerticalPosition, margins.top, {hideGridlines: gridlineOpts?.hideX}))
    
    // X-axis line
    elements.push(`<line x1="${margins.left}" y1="${xAxisVerticalPosition}" x2="${width - margins.right}" y2="${xAxisVerticalPosition}" stroke="black" />`)
    
    // Y ticks and gridlines
    if (yTickSet) {
        const topMargin = 0
        elements.push(...renderYTicksToSVG(yTickSet, xAxisVerticalPosition, margins.left, width - margins.right, topMargin, {hideGridlines: gridlineOpts?.hideY}))
    }
    
    return elements
}

const renderTimeTicksToSVG = (timeTicks: TimeTick[], xAxisPixelHeight: number, plotTopPixelHeight: number, o: {hideGridlines?: boolean}): string[] => {
    const elements: string[] = []
    const hideTimeAxis = false
    
    if (!timeTicks || timeTicks.length === 0) return elements
    
    const labelOffsetFromGridline = 2
    const gridlineBottomEdge = xAxisPixelHeight + (hideTimeAxis ? 0 : 5)
    
    timeTicks.forEach(tick => {
        const strokeColor = tick.major ? 'gray' : 'lightgray'
        const topPixel = !o.hideGridlines ? plotTopPixelHeight : xAxisPixelHeight
        
        // Gridline
        elements.push(`<line x1="${tick.pixelXposition}" y1="${gridlineBottomEdge}" x2="${tick.pixelXposition}" y2="${topPixel}" stroke="${strokeColor}" />`)
        
        // Label
        if (!hideTimeAxis) {
            const fillColor = tick.major ? 'black' : 'gray'
            elements.push(`<text x="${tick.pixelXposition}" y="${gridlineBottomEdge + labelOffsetFromGridline}" text-anchor="middle" dominant-baseline="hanging" fill="${fillColor}" font-family="Arial, sans-serif" font-size="12">${tick.label}</text>`)
        }
    })
    
    return elements
}

const renderYTicksToSVG = (tickSet: TickSet, xAxisYCoordinate: number, yAxisXCoordinate: number, plotRightPx: number, topMargin: number, o: {hideGridlines?: boolean}): string[] => {
    const elements: string[] = []
    const labelOffsetFromGridline = 2
    const gridlineLeftEdge = yAxisXCoordinate - 5
    const labelRightEdge = gridlineLeftEdge - labelOffsetFromGridline
    const { ticks } = tickSet
    
    ticks.forEach(tick => {
        if (!tick.pixelValue) return
        
        const pixelValueWithMargin = tick.pixelValue + topMargin
        const strokeColor = tick.isMajor ? 'gray' : 'lightgray'
        const fillColor = tick.isMajor ? 'black' : 'gray'
        const rightPixel = !o.hideGridlines ? plotRightPx : yAxisXCoordinate
        
        // Gridline
        elements.push(`<line x1="${gridlineLeftEdge}" y1="${pixelValueWithMargin}" x2="${rightPixel}" y2="${pixelValueWithMargin}" stroke="${strokeColor}" />`)
        
        // Label
        elements.push(`<text x="${labelRightEdge}" y="${pixelValueWithMargin}" text-anchor="end" dominant-baseline="middle" fill="${fillColor}" font-family="Arial, sans-serif" font-size="12">${tick.label}</text>`)
    })
    
    return elements
}

const renderCursorToSVG = (props: SVGExportProps): string[] => {
    const {margins, currentTimePixels, currentTimeIntervalPixels, height} = props
    const elements: string[] = []
    
    // Current time interval
    if (currentTimeIntervalPixels !== undefined) {
        const x = currentTimeIntervalPixels[0]
        const y = margins.top
        const w = currentTimeIntervalPixels[1] - currentTimeIntervalPixels[0]
        const h = height - margins.bottom - margins.top
        
        elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(255, 225, 225, 0.4)" stroke="rgba(150, 50, 50, 0.9)" />`)
    }
    
    // Current time
    if ((currentTimePixels !== undefined) && (currentTimeIntervalPixels === undefined)) {
        elements.push(`<line x1="${currentTimePixels}" y1="${margins.top}" x2="${currentTimePixels}" y2="${height - margins.bottom}" stroke="red" />`)
    }
    
    return elements
}

export const downloadSVG = (svgContent: string, filename = 'timeseries-view.svg') => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
