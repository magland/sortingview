import { FunctionComponent, useEffect } from "react";
import EphysTracesClient, { EphysTracesInfo } from "./EphysTracesClient";
import TracesWidget from './TracesWidget/TracesWidget';


type Props = {
    ephysTracesClient: EphysTracesClient
    ephysTracesInfo: EphysTracesInfo
    width: number
    height: number
}

const EphysTracesWidget: FunctionComponent<Props> = ({ephysTracesClient, ephysTracesInfo, width, height}) => {
    useEffect(() => {
        console.info('Raw ephys info:', ephysTracesInfo)
    }, [ephysTracesInfo])
    return (
        <TracesWidget
            ephysTracesClient={ephysTracesClient}
            ephysTracesInfo={ephysTracesInfo}
            width={width}
            height={height}
        />
    )    
}

export default EphysTracesWidget