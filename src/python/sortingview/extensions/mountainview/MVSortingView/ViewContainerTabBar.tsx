import { IconButton, Tab, Tabs } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CloseIcon from "@material-ui/icons/Close";
import { default as React, FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { View } from './MVSortingView';

type Props = {
    views: View[]
    currentView: View | null
    onCurrentViewChanged: (v: View) => void
    onViewClosed: (v: View) => void
    active: boolean
}

const ViewContainerTabBar: FunctionComponent<Props> = ({ views, currentView, onCurrentViewChanged, onViewClosed, active }) => {
    useEffect(() => {
        const i = currentView ? views.indexOf(currentView) : -1
        if (i < 0) {
            if (views.length > 0) {
                onCurrentViewChanged(views[0])
            }
        }
    }, [currentView, onCurrentViewChanged, views])
    const handleClickView = useCallback((v: View) => {
        onCurrentViewChanged(v)
    }, [onCurrentViewChanged])
    let currentIndex: number | null = currentView ? views.indexOf(currentView) : null
    if (currentIndex === -1) currentIndex = null
    const classes = ['ViewContainerTabBar']
    if (active) classes.push('active')
    const opts = useMemo(() => (
        views.map((v, i) => (
            {selected: (i === (currentIndex || 0))}
        ))
    ), [views, currentIndex])
    return (
        <Tabs
            value={currentIndex || 0}
            // onChange={handleChange}
            scrollButtons="auto"
            variant="scrollable"
            className={classes.join(' ')}
        >
            {views.map((v, i) => (
                <ViewContainerTab
                    key={i}
                    view={v}
                    onClick={handleClickView}
                    onClose={onViewClosed}
                    opts={opts[i]}
                />
            ))}
        </Tabs>
    )
}

const ViewContainerTab: FunctionComponent<{view: View, onClose: (v: View) => void, opts: {selected?: boolean}, onClick: (v: View) => void}> = ({view, onClose, opts, onClick}) => {
    // thanks: https://stackoverflow.com/questions/63265780/react-material-ui-tabs-close/63277341#63277341
    // thanks also: https://www.freecodecamp.org/news/reactjs-implement-drag-and-drop-feature-without-using-external-libraries-ad8994429f1a/
    const icon = useMemo(() => (view.plugin.icon || <CheckBoxOutlineBlankIcon />), [view.plugin.icon])
    const handleClick = useCallback(() => {
        onClick(view)
    }, [onClick, view])
    const label = (
        <div
            style={{whiteSpace: 'nowrap'}}
            draggable
            onDragStart={(e) => {e.dataTransfer.setData('viewId', view.viewId);}}
            onClick={handleClick}
        >
            {<icon.type {...icon.props} style={{paddingRight: 5, paddingLeft: 3, paddingTop: 0, width: 20, height: 20, display: 'inline', verticalAlign: 'middle'}} />}
            <span style={{display: 'inline', verticalAlign: 'middle'}}>{view.label}</span>
            <span>&nbsp;</span>
            <IconButton
                component="div"
                onClick={() => onClose(view)}
                className="CloseButton"
                style={{padding: 0}}
            >
                <CloseIcon
                    style={{
                        display: 'inline',
                        verticalAlign: 'middle',
                        fontSize: 20
                    }}
                />
            </IconButton>
        </div>
    )
    const style: React.CSSProperties = useMemo(() => (opts.selected ? {color: 'white', fontWeight: 'bold'} : {color: 'lightgray'}), [opts.selected])
    return (
        <Tab key={view.viewId} label={label} className="Tab" style={style} />
    )
}

export default ViewContainerTabBar