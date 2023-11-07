import { Switch } from "@material-ui/core"
import { FunctionComponent } from "react"

export type UnitsTableBottomToolbarOptions = {
    onlyShowSelected: boolean
}
export const defaultUnitsTableBottomToolbarOptions: UnitsTableBottomToolbarOptions = {
    onlyShowSelected: false
}

type Props = {
    options: UnitsTableBottomToolbarOptions
    setOptions: (o: UnitsTableBottomToolbarOptions) => void
    onRedistributeUnitColors?: () => void
}

const UnitsTableBottomToolbar: FunctionComponent<Props> = ({options, setOptions, onRedistributeUnitColors}) => {
    return (
        <div>
            <Switch
                checked={options.onlyShowSelected}
                onClick={() => {setOptions({...options, onlyShowSelected: !options.onlyShowSelected})}}
            />
            <span style={{position: 'relative', top: 2, overflow: 'hidden'}}>only show selected</span>
            &nbsp;&nbsp;
            {
                onRedistributeUnitColors && (
                    <button onClick={onRedistributeUnitColors} title="Redistribute unit colors">rc</button>
                )
            }
        </div>
    )
}

export default UnitsTableBottomToolbar