import { SVGExportProps } from './svgExport'

export interface SVGExportCapability {
    canExportToSVG: boolean
    exportToSVG?: (props: SVGExportProps) => Promise<string[]>  // Returns additional SVG elements
}
