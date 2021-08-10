import { FigurlPlugin } from "figurl/types";
import { _validateObject } from "kachery-js/types/kacheryTypes";
import { FunctionComponent, useMemo } from 'react';
import { VegaLite } from 'react-vega'

// See https://github.com/vega/react-vega/issues/85#issuecomment-795138175
import './VegaLitePlugin.css'

type VegaLiteData = {
    spec: any
}
const isVegaLiteData = (x: any): x is VegaLiteData => {
    return _validateObject(x, {
        spec: () => (true)
    })
}

type Props = {
    data: VegaLiteData
    width: number
    height: number
}

const VegaLiteComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {spec} = data
    const spec2 = useMemo(() => {
        return {...spec, width: "container", height: "container"}
    }, [spec])
    return (
        <div style={{width, height}}>
            <VegaLite
                spec={spec2}
            />
        </div>
    )
}

const getLabel = (x: VegaLiteData) => {
    return `VegaLite`
}

const VegaLitePlugin: FigurlPlugin = {
    type: 'VegaLite.1',
    validateData: isVegaLiteData,
    component: VegaLiteComponent,
    getLabel
}

export default VegaLitePlugin