import React, { FunctionComponent, ReactElement, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface Props {
    width: number
    height: number
    initialPosition: number
    positionFromRight?: boolean
    onChange?: (newPosition: number) => void
    gripThickness?: number
    gripInnerThickness?: number
    gripMargin?: number
    adjustable?: boolean
}

const defaultGripThickness = 10
const defaultGripInnerThickness = 4
const defaultGripMargin = 2

const Splitter: FunctionComponent<Props> = (props) => {
    const {width, height, initialPosition, onChange, adjustable=true, positionFromRight=false} = props

    const [gripPosition, setGripPosition] = useState<number>(initialPosition)

    if (!props.children) throw Error('Unexpected: no props.children')

    let child1: ReactElement
    let child2: ReactElement | null
    if (!Array.isArray(props.children)) {
        child1 = props.children as any as ReactElement
        child2 = null
    }
    else {
        const children = props.children.filter(c => (c !== undefined))
        child1 = children[0] as any as ReactElement
        child2 = (children[1] as any as ReactElement) || null
    }

    if (!child2) {
        return <child1.type {...child1.props} width={width} height={height} />
    }

    const gripPositionFromLeft = positionFromRight ? width - gripPosition : gripPosition

    const gripThickness = adjustable ? (props.gripThickness ?? defaultGripThickness) : 0
    const gripInnerThickness = adjustable ? (props.gripInnerThickness ?? defaultGripInnerThickness) : 0
    const gripMargin = adjustable ? (props.gripMargin ?? defaultGripMargin) : 0
    const width1 = gripPositionFromLeft - gripThickness / 2 - gripMargin
    const width2 = width - width1 - gripThickness - 2 * gripMargin

    let style0: React.CSSProperties = {
        top: 0,
        left: 0,
        width: width,
        height: height
    };
    let style1: React.CSSProperties = {
        left: 0,
        top: 0,
        width: width1,
        height: height,
        zIndex: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
    };
    let style2: React.CSSProperties = {
        left: width1 + gripThickness + 2 * gripMargin,
        top: 0,
        width: width2,
        height: height,
        zIndex: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
    };
    let styleGripOuter: React.CSSProperties = {
        left: 0,
        top: 0,
        width: gripThickness + 2 * gripMargin,
        height: height,
        backgroundColor: 'transparent',
        cursor: 'col-resize',
        zIndex: 9998
    };
    let styleGrip: React.CSSProperties = {
        left: gripMargin,
        top: 0,
        width: gripThickness,
        height: height,
        background: 'rgb(230, 230, 230)',
        cursor: 'col-resize'
    };
    let styleGripInner: React.CSSProperties = {
        top: 0,
        left: (gripThickness - gripInnerThickness) / 2,
        width: gripInnerThickness,
        height: height,
        background: 'gray',
        cursor: 'col-resize'
    };
    const _handleGripDrag = (evt: DraggableEvent, ui: DraggableData) => {
    }
    const _handleGripDragStop = (evt: DraggableEvent, ui: DraggableData) => {
        const newGripPositionFromLeft = ui.x;
        if (newGripPositionFromLeft === gripPositionFromLeft) {
            return;
        }
        const newGripPosition = positionFromRight ? width - newGripPositionFromLeft : newGripPositionFromLeft
        setGripPosition(newGripPosition)
        onChange && onChange(newGripPosition)
    }
    return (
        <div className="splitter" style={{...style0, position: 'relative'}}>
            <div key="child1" style={{...style1, position: 'absolute'}} className="SplitterChild">
                <child1.type {...child1.props} width={width1} height={height} />
            </div>
            {
                adjustable && (
                    <Draggable
                        key="drag"
                        position={{ x: gripPositionFromLeft - gripThickness / 2 - gripMargin, y: 0 }}
                        axis="x"
                        onDrag={(evt: DraggableEvent, ui: DraggableData) => _handleGripDrag(evt, ui)}
                        onStop={(evt: DraggableEvent, ui: DraggableData) => _handleGripDragStop(evt, ui)}
                    >
                        <div style={{...styleGripOuter, position: 'absolute'}}>
                            <div style={{...styleGrip, position: 'absolute'}}>
                                <div style={{...styleGripInner, position: 'absolute'}} />
                            </div>
                        </div>
                    </Draggable>
                )
            }

            <div key="child2" style={{...style2, position: 'absolute'}} className="SplitterChild">
                <child2.type {...child2.props} width={width2} height={height} />
            </div>
        </div>
    )
}

export default Splitter