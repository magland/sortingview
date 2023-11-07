import React, { FunctionComponent } from 'react';

type Props = {
    text: string
}

const CopyableText: FunctionComponent<Props> = ({text}) => {
    return (
        <input value={text} type="text" style={{width: 200}} readOnly />
    )
}

export default CopyableText