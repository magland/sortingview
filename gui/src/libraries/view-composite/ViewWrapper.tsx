import { useFileData } from '@figurl/interface';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ViewComponentProps } from 'libraries/core-view-component-props';

type Props = {
    figureDataSha1?: string // old
    figureDataUri?: string //new
    ViewComponent: FunctionComponent<ViewComponentProps>
    width: number
    height: number
}

const ViewWrapper: FunctionComponent<Props> = ({ figureDataSha1, figureDataUri, ViewComponent, width, height }) => {
    const sha1OrUri = figureDataSha1 ? figureDataSha1.toString() : figureDataUri
    if (!sha1OrUri) throw Error('No figureDataSha1 or figureDataUri in ViewWrapper')
    const { fileData: figureData, progress, errorMessage } = useFileData(sha1OrUri)
    const [progressValue, setProgressValue] = useState<{loaded: number, total: number} | undefined>(undefined)
    useEffect(() => {
        progress.onProgress(({loaded, total}) => {
            setProgressValue({loaded, total})
        })
    }, [progress])

    const opts = useMemo(() => ({}), [])

    if (!figureData) {
        return (
            <div style={{ width, height }}>
                {
                    errorMessage ? errorMessage : progressValue ? `Waiting for data ${progressValue.loaded} / ${progressValue.total}` : 'Waiting for data (1)'
                }
            </div>
        )
    }
    return (
        <ViewComponent
            data={figureData}
            opts={opts}
            width={width}
            height={height}
        />
    )
}

export default ViewWrapper