import React, { FunctionComponent } from 'react';

type Props = {
    onClick?: () => void
    color?: string
}

const Hyperlink: FunctionComponent<Props> = ({ color, onClick, children }) => {
    let style0 = {
        color: color || 'gray',
        cursor: 'pointer',
        textDecoration: 'underline'
    };
    return (
        <span
            style={style0}
            onClick={onClick}
        >
            {children}
        </span>
    );
}

export default Hyperlink