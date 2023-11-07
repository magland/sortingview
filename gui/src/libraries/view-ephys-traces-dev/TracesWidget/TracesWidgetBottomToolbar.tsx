import { Switch } from "@material-ui/core"
import { FunctionComponent } from "react"

export type TracesWidgetBottomToolbarOptions = {
    mode: 'traces' | 'heatmap'
}
export const defaultTracesWidgetBottomToolbarOptions: TracesWidgetBottomToolbarOptions = {
    mode: 'traces'
}

type Props = {
    options: TracesWidgetBottomToolbarOptions
    setOptions: (o: TracesWidgetBottomToolbarOptions) => void
}

export const tracesWidgetBottomToolbarHeight = 40

const TracesWidgetBottomToolbar: FunctionComponent<Props> = ({options, setOptions}) => {
    return (
        <div>
            <Switch
                checked={options.mode === 'heatmap'}
                onClick={() => {setOptions({...options, mode: options.mode === 'heatmap' ? 'traces' : 'heatmap'})}}
            />
            <span style={{position: 'relative', top: 2, overflow: 'hidden'}}>heatmap</span>
            &nbsp;&nbsp;
        </div>
    )
}

export default TracesWidgetBottomToolbar