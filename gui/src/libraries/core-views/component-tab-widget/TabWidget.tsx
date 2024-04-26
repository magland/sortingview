import { FunctionComponent, PropsWithChildren, useEffect, useReducer, useState } from "react";
import TabWidgetTabBar from "./TabWidgetTabBar";

type Props = {
    tabs: {
        label: string
    }[]
    tabBarLayout?: 'horizontal' | 'vertical'
    width: number
    height: number
}

// needs to correspond to css (not best system) - see mountainview.css
const tabBarHeight = 30 + 5

const TabWidget: FunctionComponent<PropsWithChildren<Props>> = ({children, tabs, tabBarLayout, width, height}) => {
    const tbl = tabBarLayout || 'horizontal'
    if (tbl === 'horizontal') {
        return (
            <TabWidgetHorizontal
                tabs={tabs}
                tabBarLayout={tabBarLayout}
                width={width}
                height={height}
            >
                {children}
            </TabWidgetHorizontal>
        )
    }
    else if (tbl === 'vertical') {
        return (
            <TabWidgetVertical
                tabs={tabs}
                tabBarLayout={tabBarLayout}
                width={width}
                height={height}
            >
                {children}
            </TabWidgetVertical>
        )
    }
    else {
        return <div>TabWidget: unknown tabBarLayout {tbl}</div>
    }
}

const TabWidgetHorizontal: FunctionComponent<PropsWithChildren<Props>> = ({children, tabs, tabBarLayout, width, height}) => {
    const [currentTabIndex, setCurrentTabIndex] = useState<number | undefined>(undefined)
    const children2 = children as React.ReactElement[]
    if ((children2 || []).length !== tabs.length) {
        throw Error('TabWidget: incorrect number of tabs')
    }
    const hMargin = 8
    const vMargin = 8
    const W = (width || 300) - hMargin * 2
    const H = height - vMargin * 2

    const [hasBeenVisible, hasBeenVisibleDispatch] = useReducer(hasBeenVisibleReducer, [])
    useEffect(() => {
        if (currentTabIndex !== undefined) {
            hasBeenVisibleDispatch({type: 'add', index: currentTabIndex})
        }
    }, [currentTabIndex])
    return (
        <div
            style={{position: 'absolute', left: hMargin, top: vMargin, width: W, height: H, overflow: 'hidden'}}
            className="TabWidget"
        >
            <div key="tabwidget-bar" style={{position: 'absolute', left: 0, top: 0, width: W, height: tabBarHeight }}>
                <TabWidgetTabBar
                    tabs={tabs}
                    currentTabIndex={currentTabIndex}
                    onCurrentTabIndexChanged={setCurrentTabIndex}
                    onTabClosed={undefined}
                />
            </div>
            {
                children2.map((c, i) => {
                    const visible = i === currentTabIndex
                    return (
                        <div key={`child-${i}`} style={{visibility: visible ? undefined : 'hidden', overflowY: 'hidden', overflowX: 'hidden', position: 'absolute', left: 0, top: tabBarHeight, width: W, height: H}}>
                            {hasBeenVisible.includes(i) && <c.type {...c.props} width={W} height={H - tabBarHeight}/>}
                        </div>
                    )
                })
            }
        </div>
    )
}

const TabWidgetVertical: FunctionComponent<PropsWithChildren<Props>> = ({children, tabs, tabBarLayout, width, height}) => {
    const [currentTabIndex, setCurrentTabIndex] = useState<number | undefined>(0)
    const children2 = children as React.ReactElement[]
    if ((children2 || []).length !== tabs.length) {
        throw Error('TabWidget: incorrect number of tabs')
    }
    const leftPanelWidth = Math.min(250, width / 3)
    const hm = 8
    const vm = 8
    const W = width - hm * 2 - leftPanelWidth
    const H = height - vm * 2
    const [hasBeenVisible, hasBeenVisibleDispatch] = useReducer(hasBeenVisibleReducer, [])
    useEffect(() => {
        if (currentTabIndex !== undefined) {
            hasBeenVisibleDispatch({type: 'add', index: currentTabIndex})
        }
    }, [currentTabIndex])
    return (
        <div
            style={{position: 'absolute', left: hm, top: vm, width: W, height: H}}
            className="TabWidgetVertical"
        >
            <div style={{position: 'absolute', left: 0, top: 0, width: leftPanelWidth, height: H}}>
                <VerticalTabSelectionPanel
                    width={leftPanelWidth}
                    height={H}
                    tabs={tabs}
                    currentTabIndex={currentTabIndex}
                    onCurrentTabIndexChanged={setCurrentTabIndex}
                />
            </div>
            <div style={{position: 'absolute', left: leftPanelWidth, top: 0, width: W - leftPanelWidth, height: H}}>
                {
                    children2.map((c, i) => {
                        const visible = i === currentTabIndex
                        return (
                            <div key={`child-${i}`} style={{visibility: visible ? undefined : 'hidden', overflowY: 'hidden', overflowX: 'hidden', position: 'absolute', left: 0, top: 0, width: W - leftPanelWidth, height: H}}>
                                {
                                    hasBeenVisible.includes(i) && <c.type {...c.props} width={W} height={H - vm * 2}/>
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

type VerticalTabSelectionPanelProps = {
    tabs: {
        label: string
    }[]
    currentTabIndex?: number
    onCurrentTabIndexChanged: (i: number) => void
    width: number
    height: number
}

const VerticalTabSelectionPanel: FunctionComponent<VerticalTabSelectionPanelProps> = ({tabs, currentTabIndex, onCurrentTabIndexChanged, width, height}) => {
    return (
        <div style={{position: 'absolute', left: 0, top: 0, width: width, height: height, overflowY: 'auto', userSelect: 'none'}}>
            {
                tabs.map((tab, i) => (
                    <div key={i} style={{padding: 4, cursor: 'pointer', backgroundColor: i === currentTabIndex ? 'lightgray' : undefined}} onClick={() => onCurrentTabIndexChanged(i)}>
                        {tab.label}
                    </div>
                ))
            }
        </div>
    )
}

const hasBeenVisibleReducer = (state: number[], action: {type: 'add', index: number}) => {
    if (state.includes(action.index)) return state
    return [...state, action.index]
}

export default TabWidget