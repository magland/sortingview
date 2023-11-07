import { IconButton } from "@material-ui/core";
import { SelectAll } from '@material-ui/icons';
import { FunctionComponent } from "react";
import { HoveredInfo } from "./UnitSimilarityMatrixView";

type Props = {
    hoveredInfo: HoveredInfo | undefined
    onSelectSimilarUnits?: () => void
}

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 0, paddingBottom: 0}

const BottomToolbar: FunctionComponent<Props> = ({hoveredInfo, onSelectSimilarUnits}) => {
    return (
        <span>
            {onSelectSimilarUnits && <IconButton style={iconButtonStyle} onClick={onSelectSimilarUnits} title="Select similar units"><SelectAll /></IconButton>}
            {
                hoveredInfo ? (
                    <span>
                        Units {hoveredInfo.unitId1}/{hoveredInfo.unitId2} | {hoveredInfo.value !== undefined ? `value: ${hoveredInfo.value}` : ''}
                    </span>
                ) : (
                    <span />
                )
            }
        </span>
    )
}

export default BottomToolbar