import { Grid } from "@material-ui/core";
import { FigureObject, FigurlPlugin, isFigureObject } from "figurl/types";
import { isArrayOf, _validateObject } from "kachery-js/types/kacheryTypes";
import { FunctionComponent, useMemo } from "react";
import BoxLayoutItem from "./BoxLayoutItem";

type BoxLayoutData = {
    children: FigureObject[]
    direction: 'row' | 'column'
}
const isBoxLayoutData = (x: any): x is BoxLayoutData => {
    return _validateObject(x, {
        children: isArrayOf(isFigureObject),
        direction: (x: any) => (['row', 'column'].includes(x))
    })
}

type Props = {
    data: BoxLayoutData
    width: number
    height: number
}

const BoxLayoutComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {children, direction} = data
    const spacing = 2
    const margin = 10
    const itemInfos: {figureObject: FigureObject, width: number, height: number, style: React.CSSProperties}[] = useMemo(() => {
        const n = children.length
        if (direction === 'row') {
            const W = Math.floor((width - 2 * margin - spacing * (n - 1)) / n)
            return children.map((c, i) => ({
                figureObject: c,
                width: W,
                height: height - 2 * margin,
                style: {paddingTop: margin, paddingLeft: i === 0 ? margin : 0, paddingRight: spacing}
            }))
        }
        else {
            const H = Math.floor((height - 2 * margin - spacing * (n - 1)) / n)
            return children.map((c, i) => ({
                figureObject: c,
                width: width - 2 * margin,
                height: H,
                style: {paddingLeft: margin, paddingTop: i === 0 ? margin : 0, paddingBottom: spacing}
            }))
        }
    }, [children, width, height, direction])
    return (
        <Grid
            container
            direction={direction}
            spacing={0}
        >
            {
                itemInfos.map((x, ii) => (
                    <div key={ii} style={x.style}>
                        <BoxLayoutItem
                            figureObject={x.figureObject}
                            width={x.width}
                            height={x.height}
                        />
                    </div>
                ))
            }
        </Grid>
    )
}

const getLabel = (x: BoxLayoutData) => {
    return `BoxLayout`
}

const BoxLayoutPlugin: FigurlPlugin = {
    type: 'BoxLayout.1',
    validateData: isBoxLayoutData,
    component: BoxLayoutComponent,
    getLabel
}

export default BoxLayoutPlugin