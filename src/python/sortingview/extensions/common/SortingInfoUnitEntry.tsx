import React, { FunctionComponent } from 'react';
import './localStyles.css';

interface Props {
    unitId: number
    labels: string
    unitStatus: 'unselected' | 'selected'
    onUnitClicked: (unitId: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const SortingInfoUnitEntry: FunctionComponent<Props> = ({
    unitId, labels = "", unitStatus = 'unselected', onUnitClicked
}) => {
    const unitClass =
        unitStatus === 'selected' ? 'selectedUnitEntry' : 'unselectedUnitEntry'; // default to unselected
    return (
        <div
            className={unitClass}
            onClick={(event) => onUnitClicked(unitId, event)}
        >
            <span className={'unitEntryBase'}>{ unitId }</span>
            <span className={'unitLabelsStyle'}>{ labels }</span>
        </div>
    );
}

export default SortingInfoUnitEntry;