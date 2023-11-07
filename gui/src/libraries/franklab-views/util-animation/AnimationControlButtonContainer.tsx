import { FunctionComponent, ReactNode, useMemo } from 'react'

type ButtonContainerProps = {
    width: number
    baseHeight: number
    squeezeHeight?: boolean
    overallWidth?: number
    children?: ReactNode
}

const leftPadding = -5 // this might be related to the scrubber radius but honestly it's just a manual tweak.

const AnimationControlButtonContainer: FunctionComponent<ButtonContainerProps> = (props: ButtonContainerProps) => {
    const { width, baseHeight, squeezeHeight, overallWidth, children } = props
    const height = useMemo(() => squeezeHeight ? Math.floor(baseHeight * .8) : baseHeight, [baseHeight, squeezeHeight])
    const top = useMemo(() => baseHeight - height, [baseHeight, height])
    const style: React.CSSProperties = useMemo(() => {
        return {
            // The constants really ought to go in CSS, but for some reason it isn't being honored.
            position: 'absolute',
            textAlign: 'center',
            width: width,
            height: height,
            top: top,
            left: overallWidth ? overallWidth - width + leftPadding : 0,
            font: `${Math.floor(baseHeight/2)}px FontAwesome`
        } as React.CSSProperties
    }, [width, height, baseHeight, top, overallWidth])

    return <div
        className='AnimationControlButton'
        style={style}
    >
        {children}
    </div>
}

export default AnimationControlButtonContainer