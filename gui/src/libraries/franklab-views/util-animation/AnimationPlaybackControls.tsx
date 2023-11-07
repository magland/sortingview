import React, { useEffect, useMemo, useState } from 'react'
import { PlaybackControlLogic } from './AnimationControls/PlaybackControlButtonLogic'
import { PlaybackOptionalButtons } from './AnimationControls/PlaybackOptionalButtons'
import AnimationStatePlaybackBarLayer from './AnimationStatePlaybackBarLayer'
import { AnimationStateDispatcher } from './AnimationStateReducer'
import MainPlaybackControls from './MainPlaybackControls'
import GetSecondaryPlaybackControls from './SecondaryPlaybackControls'

export type AnimationPlaybackControlsProps = {
    width: number
    height: number
    verticalOffset: number
    dispatch: AnimationStateDispatcher<any>
    totalFrameCount: number
    visibleWindow: [number, number]
    windowProposal?: [number, number]
    currentFrameIndex: number
    isPlaying: boolean
    playbackRate: number
    logic: PlaybackControlLogic,
    ui?: ControlFeatures
}

export type ControlFeatures = {
    isSynced?: boolean
    isCropped?: boolean
    couldCrop?: boolean
    stateIsBookmarked?: boolean
    doBookmark?: () => void
    optionalButtons?: PlaybackOptionalButtons[]
    usingRateButtons?: boolean
    customPlaybackRates?: number[]
}

// TODO: Allow changing?
const leftButtonWidthPx = 280
export type SelectionWindow = [number, number] | undefined
export type SelectedWindowUpdater = React.Dispatch<React.SetStateAction<SelectionWindow>>


const AnimationPlaybackControls = (props: AnimationPlaybackControlsProps) => {
    const { width, height, verticalOffset, dispatch, isPlaying, visibleWindow, windowProposal, currentFrameIndex, playbackRate, logic, ui } = props
    const [selectedWindow, updateSelectedWindow] = useState<SelectionWindow>(undefined)
    useEffect(() => { updateSelectedWindow(undefined) }, [windowProposal])

    const ctrlPanelDiv = useMemo(() => {
        return (<MainPlaybackControls
            height={height}
            dispatch={dispatch}
            isPlaying={isPlaying}
            buttonWidthPx={leftButtonWidthPx}
            playbackRate={playbackRate}
            logic={logic}
            ui={ui}
        />)
    }, [height, dispatch, isPlaying, playbackRate, logic, ui])

    const secondaryControls = GetSecondaryPlaybackControls({...props})
    const { panelWidth: secondaryControlPanelWidthPx, panel: secondaryPlaybackControlPanel } = secondaryControls

    const barLayerDiv = useMemo(() => {
        return (<AnimationStatePlaybackBarLayer
            width={width}
            height={height}
            leftOffset={leftButtonWidthPx}
            rightOffset={secondaryControlPanelWidthPx}
            dispatch={dispatch}
            visibleWindow={visibleWindow}
            windowProposal={windowProposal}
            selectedWindow={selectedWindow}
            updateSelectedWindow={updateSelectedWindow}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
        />)
    }, [currentFrameIndex, dispatch, height, isPlaying, visibleWindow, width, secondaryControlPanelWidthPx, selectedWindow, updateSelectedWindow, windowProposal])

    return (
        <div style={{position: 'absolute', top: verticalOffset, userSelect: "none"}}>
            {ctrlPanelDiv}
            {barLayerDiv}
            {secondaryPlaybackControlPanel}
        </div>
    )
}

export default AnimationPlaybackControls
