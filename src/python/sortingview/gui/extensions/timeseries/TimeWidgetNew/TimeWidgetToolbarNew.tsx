import { IconButton } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus } from 'react-icons/fa';

interface Props {
    width: number
    height: number
    top: number
    onZoomIn: () => void
    onZoomOut: () => void
    onShiftTimeLeft: () => void
    onShiftTimeRight: () => void
    customActions?: any[] | null
}

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4}

const TimeWidgetToolbarNew: FunctionComponent<Props> = (props) => {
    const style0 = {
        width: props.width,
        height: props.height,
        top: props.top,
        overflow: 'hidden'
    };
    let buttons = [];
    buttons.push({
        type: 'button',
        title: "Time zoom in (+)",
        onClick: props.onZoomIn,
        icon: <FaSearchPlus />
    });
    buttons.push({
        type: 'button',
        title: "Time zoom out (-)",
        onClick: props.onZoomOut,
        icon: <FaSearchMinus />
    });
    buttons.push({
        type: 'button',
        title: "Shift time left [left arrow]",
        onClick: props.onShiftTimeLeft,
        icon: <FaArrowLeft />
    });
    buttons.push({
        type: 'button',
        title: "Shift time right [right arrow]",
        onClick: props.onShiftTimeRight,
        icon: <FaArrowRight />
    });
    buttons.push({
        type: 'divider'
    });
    for (let a of (props.customActions || [])) {
        buttons.push({
            type: a.type || 'button',
            title: a.title,
            onClick: a.callback,
            icon: a.icon,
            selected: a.selected,
            disabled: a.disabled
        });
    }
    return (
        <div className="TimeWidgetToolBar" style={{position: 'absolute', ...style0}}>
            {
                buttons.map((button, ii) => {
                    if (button.type === 'button') {
                        let color: 'primary' | 'secondary' | 'inherit' = 'inherit'
                        // for some reason, secondary color looks more like a selection than primary
                        if (button.selected) color = 'secondary'
                        return (
                            // If we don't put the title/tooltip in a span element, it will not be displayed when the button is disabled
                            <span title={button.title}>
                                <IconButton onClick={button.onClick} key={ii} color={color} style={iconButtonStyle} disabled={button.disabled ? true : false}>
                                    {button.icon}
                                </IconButton>
                            </span>
                        );
                    }
                    else if (button.type === 'divider') {
                        return <hr key={ii} />;
                    }
                    else {
                        return <span key={ii} />;
                    }
                })
            }
        </div>
    );
}

export default TimeWidgetToolbarNew