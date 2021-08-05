import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin"
import MountainViewPlugin from "./MountainViewPlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin
]

export default plugins