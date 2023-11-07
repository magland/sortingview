import { ViewComponentProps } from 'libraries/core-view-component-props';
import { useFileData } from '@figurl/interface';
import React, { FunctionComponent, useMemo } from 'react';
import { TimeseriesLayoutOpts } from 'View';
import './MultiTimeseriesView.css';

type Props = {
    label: string
    figureDataSha1?: string // old
    figureDataUri?: string // new
    ViewComponent: FunctionComponent<ViewComponentProps>
    isBottomPanel: boolean
    width: number
    height: number
}

const ViewWrapper: FunctionComponent<Props> = ({ label, figureDataSha1, figureDataUri, ViewComponent, isBottomPanel, width, height }) => {
    const sha1OrUri = figureDataSha1 ? figureDataSha1.toString() : figureDataUri
    if (!sha1OrUri) throw Error('No figureDataSha1 or figureDataUri in ViewWrapper')
    const { fileData: figureData, errorMessage } = useFileData(sha1OrUri)

    const opts: TimeseriesLayoutOpts = useMemo(() => {
        return {
            hideToolbar: true,
            hideTimeAxis: !isBottomPanel,
            useYAxis: true // TODO: THIS IS FOR TESTING, REVERT ME
        }
    }, [isBottomPanel])

    const labelWidth = 40
    const contentWidth = width - labelWidth

    const content = figureData ? (
        <ViewComponent
            data={figureData}
            opts={opts}
            width={contentWidth}
            height={height}
        />
    ) : (
        <div style={{ width: contentWidth, height }}>
            {
                errorMessage ? errorMessage : 'Waiting for data (3)'
            }
        </div>
    )

    const parentDivStyle: React.CSSProperties = useMemo(() => ({
        width,
        height
    }), [width, height])

    const labelDivStyle: React.CSSProperties = useMemo(() => ({
        width: labelWidth,
        height
    }), [labelWidth, height])

    const contentDivStyle: React.CSSProperties = useMemo(() => ({
        left: labelWidth,
        width: contentWidth,
        height
    }), [labelWidth, contentWidth, height])

    return (
        <div className={"MultiTimeseriesViewParent"} style={parentDivStyle}>
            <div className={"MultiTimeseriesViewLabels"} style={labelDivStyle}>
                {label}
            </div>
            <div className={"MultiTimeseriesViewContent"} style={contentDivStyle}>
                {content}
            </div>
        </div>
    )
}

export default ViewWrapper