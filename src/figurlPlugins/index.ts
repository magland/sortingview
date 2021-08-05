import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin"
import MountainViewPlugin from "./MountainViewPlugin"
import WorkspacePlugin from "./WorkspacePlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin,
    WorkspacePlugin
]

export default plugins