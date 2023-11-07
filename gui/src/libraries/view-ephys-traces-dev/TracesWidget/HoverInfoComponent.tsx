import { FunctionComponent } from "react";

type Props = {
    position?: {x: number, y: number}
    text?: string
}

const HoverInfoComponent: FunctionComponent<Props> = ({position, text}) => {
    if ((!text) || (!position)) return <span />
    return (
        <span style={{position: 'relative', left: position.x + 40, top: position.y - 40, background: 'lightgray'}}>
            {text}
        </span>
    )
}

export default HoverInfoComponent