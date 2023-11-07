import { FunctionComponent } from 'react';
import { SortingCurationViewData } from './SortingCurationViewData';

type Props = {
    data: SortingCurationViewData
    width: number
    height: number
}

const SortingCurationView: FunctionComponent<Props> = ({data, width, height}) => {
    return (
        <div style={{position: 'absolute', width, height}}>
            {/* <MVCurationControl /> */}
        </div>
    )
}

export default SortingCurationView