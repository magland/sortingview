import React, { FunctionComponent } from 'react';

type Props = {
    onClick?: () => void
    href?: string
    target?: string
    style?: React.CSSProperties
    title?: string
}

const Hyperlink: FunctionComponent<Props> = ({ style={}, onClick, href, target, title, children }) => {
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
                    <a href={href} target={target} title={title}>{children}</a>
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