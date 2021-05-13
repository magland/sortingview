import React, { FunctionComponent } from 'react';

type Props = {
    onClick?: () => void
    href?: string
    target?: string
    style?: React.CSSProperties
}

const Hyperlink: FunctionComponent<Props> = ({ style={}, onClick, href, target, children }) => {
    let style0: React.CSSProperties = {
        color: 'gray',
        cursor: 'pointer',
        textDecoration: 'underline',
        ...style
    };
    return (
        <span className="Hyperlink">
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