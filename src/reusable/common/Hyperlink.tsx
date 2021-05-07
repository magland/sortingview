import React, { FunctionComponent } from 'react';

type Props = {
    onClick?: () => void
    color?: string
    href?: string
    target?: string
}

const Hyperlink: FunctionComponent<Props> = ({ color, onClick, href, target, children }) => {
    let style0 = {
        color: color || 'gray',
        cursor: 'pointer',
        textDecoration: 'underline'
    };
    return (
        <span>
            {
                href ? (
                    <a href={href} target={target}>{children}</a>
                ) : (
                    <span
                        style={style0}
                        onClick={onClick}
                    >
                        {children}
                    </span>
                )
            }
        </span>
    );
}

export default Hyperlink