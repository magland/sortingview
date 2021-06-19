import { IconButton } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';

interface Props {
    width: number
    height: number
    customActions?: any[] | null
}

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4}

type Button = {
    type: string
    title: string
    onClick: () => void
    icon: any
    selected: boolean
}

const ViewToolbar: FunctionComponent<Props> = (props) => {
    const toolbarStyle = useMemo(() => ({
        width: props.width,
        height: props.height,
        overflow: 'hidden'
    }), [props.width, props.height])
    const buttons = useMemo(() => {
        const b: Button[] = []
        for (let a of (props.customActions || [])) {
            b.push({
                type: a.type || 'button',
                title: a.title,
                onClick: a.callback,
                icon: a.icon,
                selected: a.selected
            });
        }
        return b
    }, [props.customActions])
    return (
        <div className="ViewToolBar" style={{position: 'absolute', ...toolbarStyle}}>
            {
                buttons.map((button, ii) => {
                    if (button.type === 'button') {
                        let color: 'inherit' | 'primary' = 'inherit';
                        if (button.selected) color = 'primary';
                        return (
                            <IconButton title={button.title} onClick={button.onClick} key={ii} color={color} style={iconButtonStyle}>
                                {button.icon}
                            </IconButton>
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

export default ViewToolbar