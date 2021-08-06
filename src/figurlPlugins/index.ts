import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin/AverageWaveformsPlugin"
import AverageWaveformsNumpyPlugin from "./AverageWaveformsNumpyPlugin/AverageWaveformsNumpyPlugin"
import MountainViewPlugin from "./MountainViewPlugin/MountainViewPlugin"
import WorkspacePlugin from "./WorkspacePlugin/WorkspacePlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin,
    WorkspacePlugin,
    AverageWaveformsNumpyPlugin
]

export default plugins