import { Select } from "@material-ui/core"
import { FunctionComponent, useCallback } from "react"

type Props = {
    layerLabels: string[]
    layerIndex: number
    setLayerIndex: (x: number) => void
}

const LeftPanel: FunctionComponent<Props> = ({layerLabels, layerIndex, setLayerIndex}) => {
    const handleChange = useCallback((event: React.ChangeEvent<{value: any}>) => {
        setLayerIndex(parseInt(event.target.value))
    }, [setLayerIndex])
    return (
        <div style={{margin: 20}}>
            <Select
                native
                value={`${layerIndex}`}
                onChange={handleChange}
            >
                {
                    layerLabels.map((layerLabel, ii) => (
                        <option key={ii} value={`${ii}`}>
                            {layerLabel}
                        </option>
                    ))
                }
            </Select>
        </div>
    )
}

export default LeftPanel