import { validateObject } from "../../core-utils"
import { isEqualTo } from "../../core-utils"

export type ElectrodeGeometryViewData = {
    type: 'ElectrodeGeometry'
    channelLocations: {[key: string]: number[]}
}

export const isElectrodeGeometryViewData = (x: any): x is ElectrodeGeometryViewData => {
    return validateObject(x, {
        type: isEqualTo('ElectrodeGeometry'),
        channelLocations: () => (true)
    })
}