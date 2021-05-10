import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { View } from './MVSortingView';
import ViewContainerTabBar from './ViewContainerTabBar';


type Props = {
    views: View[]
    onViewClosed: (v: View) => void
    onSetViewArea: (v: View, area: 'north' | 'south') => void
    width: number
    height: number
}

// needs to correspond to css (not best system) - see mountainview.css
const tabBarHeight = 30 + 5

const ViewContainer: FunctionComponent<Props> = ({ children, views, onViewClosed, onSetViewArea, width, height }) => {
    const [currentNorthView, setCurrentNorthView] = useState<View | null>(null)
    const [currentSouthView, setCurrentSouthView] = useState<View | null>(null)
    const [activeArea, setActiveArea] = useState<'north' | 'south'>('north')
    const [splitterFrac, setSplitterFrac] = useState(0.5)
    useEffect(() => {
        views.forEach(v => {
            if (!v.area) v.area = activeArea
            if (v.activate) {
                v.activate = false
                if (v.area === 'north') {
                    setCurrentNorthView(v)
                    setActiveArea('north')
                }
                else if (v.area === 'south') {
                    setCurrentSouthView(v)
                    setActiveArea('south')
                    
                }
            }
        })
    }, [views, activeArea])

    const hMargin = 3
    const vMargin = 3
    const W = (width || 300) - hMargin * 2
    const H = height - vMargin * 2
    const splitterHeight = 16

    const a = (H - tabBarHeight * 2 - splitterHeight)
    const H1 = a * splitterFrac
    const H2 = a * (1 - splitterFrac)

    const handleSplitterDelta = useCallback((delta: number) => {
        setSplitterFrac((H1 + delta) / (H1 + H2))
    }, [setSplitterFrac, H1, H2])

    const areas: {[key: string]: {
        tabBarStyle: React.CSSProperties,
        divStyle: React.CSSProperties
    }} = {
        'north': {
            tabBarStyle: { left: 0, top: 0, width: W, height: tabBarHeight },
            divStyle: {left: 0, top: tabBarHeight, width: W, height: H1}
        },
        'south': {
            tabBarStyle: { left: 0, top: tabBarHeight + H1 + splitterHeight, width: W, height: tabBarHeight },
            divStyle: { left: 0, top: tabBarHeight * 2 + H1 + splitterHeight, width: W, height: H2 }
        }
    }
    const splitterStyle: React.CSSProperties = {
        left: 0, top: tabBarHeight + H1, width: W, height: splitterHeight 
    }

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const y = eventToPos(e)[1]
        const newActiveArea = (y < tabBarHeight + H1) ? 'north' : 'south'
        if (newActiveArea !== activeArea) {
            setActiveArea(newActiveArea)
        }
    }, [H1, activeArea, setActiveArea])

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        // the following is needed otherwise we can't get the drop. See: https://stackoverflow.com/questions/50230048/react-ondrop-is-not-firing
        event.stopPropagation();
        event.preventDefault();
    }, [])

    const handleDragDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        const y = eventToPos(e)[1]
        const dropArea = (y < tabBarHeight + H1) ? 'north' : 'south'
        const viewId = e.dataTransfer.getData('viewId')
        if (viewId) {
            const view = views.filter(v => v.viewId === viewId)[0]
            if (view) {
                if (view.area !== dropArea) {
                    onSetViewArea(view, dropArea)
                }
            }
        }
    }, [views, H1, onSetViewArea])


    if (!Array.isArray(children)) {
        throw Error('Unexpected children in ViewContainer')
    }
    const children2 = children as React.ReactElement[]
    return (
        <div
            style={{position: 'absolute', left: hMargin, top: vMargin, width: W, height: H}} onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDragDrop}
            className="ViewContainer"
        >
            <div key="north-tab-bar" style={{position: 'absolute', ...areas['north'].tabBarStyle}}>
                <ViewContainerTabBar
                    views={views.filter(v => v.area === 'north')}
                    currentView={currentNorthView}
                    onCurrentViewChanged={setCurrentNorthView}
                    onViewClosed={onViewClosed}
                    active={activeArea === 'north'}
                />
            </div>
            <div key="south-tab-bar" style={{position: 'absolute', ...areas['south'].tabBarStyle}}>
                <ViewContainerTabBar
                    views={views.filter(v => v.area === 'south')}
                    currentView={currentSouthView}
                    onCurrentViewChanged={setCurrentSouthView}
                    onViewClosed={onViewClosed}
                    active={activeArea === 'south'}
                />
            </div>
            <div key="splitter" style={{position: 'absolute', ...splitterStyle, zIndex: 9998}}>
                <SplitterGrip onDelta={handleSplitterDelta} width={W} height={splitterHeight} />
            </div>
            {
                children2.map(c => {
                    const childView = c.props.view as any as View
                    const visible = ((childView.area === 'north') && (childView === currentNorthView)) || ((childView.area === 'south') && (childView === currentSouthView))
                    const area = areas[childView.area || 'north']
                    return (
                        <div key={childView.viewId} style={{visibility: visible ? 'visible' : 'hidden', overflowY: 'auto', overflowX: 'hidden', position: 'absolute', ...area.divStyle}}>
                            <c.type {...c.props} width={W} height={area.divStyle.height}/>
                        </div>
                    )
                })
            }
        </div>
    )
}

const SplitterGrip: FunctionComponent<{onDelta: (delta: number) => void, width: number, height: number}> = ({onDelta, width, height}) => {
    const handleGripDrag = useCallback((evt: DraggableEvent, ui: DraggableData) => {
    }, [])
    const handleGripDragStop = useCallback((evt: DraggableEvent, ui: DraggableData) => {
        const newGripPosition = ui.y;
        onDelta(newGripPosition)
    }, [onDelta])

    const innerGripThickness = 4

    return (
        <Draggable
            key="drag"
            position={{ x: 0, y: 0 }}
            axis="y"
            onDrag={handleGripDrag}
            onStop={handleGripDragStop}
        >
            <div
                style={{
                    position: 'absolute',
                    width,
                    height,
                    backgroundColor: 'white',
                    cursor: 'row-resize'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width,
                        top: (height - innerGripThickness) / 2,
                        height: innerGripThickness,
                        backgroundColor: 'gray'
                    }}
                />
            </div>
            {/* <div style={{...styleGripOuter, position: 'absolute'}}>
                <div style={{...styleGrip, position: 'absolute'}}>
                    <div style={{...styleGripInner, position: 'absolute'}} />
                </div>
            </div> */}
        </Draggable>
    )
}

const eventToPos = (e: React.MouseEvent | React.DragEvent) => {
    const element = e.currentTarget
    const x = e.clientX - element.getBoundingClientRect().x
    const y = e.clientY - element.getBoundingClientRect().y
    return [x, y]
}

export default ViewContainer