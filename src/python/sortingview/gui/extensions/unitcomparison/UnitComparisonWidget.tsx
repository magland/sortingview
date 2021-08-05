import Expandable from 'figurl/labbox-react/components/Expandable/Expandable';
import React, { FunctionComponent } from 'react';
import { Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from '../../pluginInterface';
import { useRecordingInfo } from '../../pluginInterface/useRecordingInfo';
import CrossCorrelogramsWidget from '../correlograms/CrossCorrelogramsView/CrossCorrelogramsWidget';
import PairClusterView from './PairClusterView/PairClusterView';
import PairWaveformView from './PairWaveformView/PairWaveformView';

type Props = {
    recording: Recording
    sorting: Sorting
    selection: SortingSelection
    curation?: SortingCuration
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    snippetLen?: [number, number]
    width: number
    height: number
    sortingSelector?: string
}

const UnitComparisonWidget: FunctionComponent<Props> = ({recording, sorting, selection, curation, selectionDispatch, unitIds, snippetLen, width, height, sortingSelector}) => {
    const viewHeight = 300
    const recordingInfo = useRecordingInfo(recording.recordingPath)
    const noiseLevel = (recordingInfo || {}).noise_level || 1  // fix this
    return (
        <div style={{overflowY: 'auto', overflowX: 'hidden'}}>
            <Expandable
                label="Cross-correlograms"
                defaultExpanded={false}
            >
                <CrossCorrelogramsWidget
                    {...{sorting, selection, curation, selectionDispatch, unitIds, width: width - 40, height: viewHeight, sortingSelector}
                    }
                />
            </Expandable>
            <Expandable
                label="Cluster"
                defaultExpanded={false}
            >
                <PairClusterView
                    {...{recording, sorting, selection, curation, selectionDispatch, unitIds, width: width - 40, height: viewHeight, snippetLen, sortingSelector}
                    }
                />
            </Expandable>
            <Expandable
                label="Waveform"
                defaultExpanded={false}
            >
                <PairWaveformView
                    {...{recording, sorting, selection, curation, selectionDispatch, unitIds, width: width - 40, height: viewHeight, snippetLen, noiseLevel, sortingSelector}
                    }
                />
            </Expandable>
        </div>
    )
}

export default UnitComparisonWidget