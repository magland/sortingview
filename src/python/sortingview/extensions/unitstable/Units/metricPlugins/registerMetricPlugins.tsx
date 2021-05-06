import { LabboxExtensionContext } from "../../../pluginInterface"
import { default as EventCountPlugin } from './EventCount'
import { default as FiringRatePlugin } from './FiringRate'
import { default as IsiViolationsPlugin } from './IsiViolations'
import { default as PeakChannelsPlugin } from './PeakChannels'
import { default as UnitSnrsPlugin } from './UnitSnrs'

const registerMetricPlugins = (context: LabboxExtensionContext) => {
    context.registerPlugin(EventCountPlugin)
    context.registerPlugin(FiringRatePlugin)
    context.registerPlugin(IsiViolationsPlugin)
    context.registerPlugin(PeakChannelsPlugin)
    context.registerPlugin(UnitSnrsPlugin)
}

export default registerMetricPlugins