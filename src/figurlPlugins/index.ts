import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin/AverageWaveformsPlugin"
import AverageWaveformsNumpyPlugin from "./AverageWaveformsNumpyPlugin/AverageWaveformsNumpyPlugin"
import MountainViewPlugin from "./MountainViewPlugin/MountainViewPlugin"
import WorkspacePlugin from "./WorkspacePlugin/WorkspacePlugin"
import VegaLitePlugin from "./VegaLitePlugin/VegaLitePlugin"
import BoxLayoutPlugin from "./BoxLayoutPlugin/BoxLayoutPlugin"
import ExperitimeTimeseriesPlugin from "./ExperitimeTimeseriesPlugin/ExperitimeTimeseriesPlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin,
    WorkspacePlugin,
    AverageWaveformsNumpyPlugin,
    VegaLitePlugin,
    BoxLayoutPlugin,
    ExperitimeTimeseriesPlugin
]

export default plugins