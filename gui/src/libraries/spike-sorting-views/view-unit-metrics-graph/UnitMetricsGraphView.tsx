import { useUnitMetricSelection } from '../context-unit-metrics-selection';
import {Splitter} from '../../core-views';
import { FunctionComponent, useEffect } from 'react';
import UnitMetricSelectionWidget from './UnitMetricSelectionWidget';
import UnitMetricsGraphViewChild from './UnitMetricsGraphViewChild';
import { UnitMetricsGraphViewData } from './UnitMetricsGraphViewData';

type Props = {
    data: UnitMetricsGraphViewData
    width: number
    height: number
}

const UnitMetricsGraphView: FunctionComponent<Props> = ({data, width, height}) => {
    const {metrics} = data
    const {unitMetricSelectionDispatch} = useUnitMetricSelection()

    useEffect(() => {
        unitMetricSelectionDispatch({type: 'initialize', unitMetrics: metrics.map(m => (m.key))})
    }, [metrics, unitMetricSelectionDispatch])

    return (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={200}
                adjustable={true}
            >
                <UnitMetricSelectionWidget
                    width={0}
                    height={0}
                />
                <UnitMetricsGraphViewChild
                    data={data}
                    width={0}
                    height={0}
                />
            </Splitter>
        </div>
    )
}

export default UnitMetricsGraphView