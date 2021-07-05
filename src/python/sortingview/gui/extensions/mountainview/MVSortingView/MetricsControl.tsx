import { useVisible } from 'labbox-react';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog';
import React, { FunctionComponent } from 'react';
import setExternalMetricsMd from './setExternalMetrics.md.gen'

type Props = {
    workspaceUri?: string
    sortingId?: string
}

const MetricsControl: FunctionComponent<Props> = ({workspaceUri, sortingId}) => {
    const setExternalMetricsVisibility = useVisible()
    return (
        <div>
            <Hyperlink onClick={setExternalMetricsVisibility.show}>Set external unit metrics for this sorting</Hyperlink>
            <MarkdownDialog
                source={setExternalMetricsMd}
                visible={setExternalMetricsVisibility.visible}
                onClose={setExternalMetricsVisibility.hide}
                substitute={{
                    workspaceUri,
                    sortingId
                }}
            />
        </div>
    )
}

export default MetricsControl