import { validateObject } from "../../core-utils"
import { isString, isArrayOf, isEqualTo, isNumber, isOneOf } from "../../core-utils"

export type UMGMetric = {
    key: string
    label: string
    dtype: string
}

const isUMGMetric = (x: any): x is UMGMetric => {
    return validateObject(x, {
        key: isString,
        label: isString,
        dtype: isString
    })
}

export type UMGUnit = {
    unitId: number | string
    values: {[key: string]: any}
}

const isUMGUnit = (x: any): x is UMGUnit => {
    return validateObject(x, {
        unitId: isOneOf([isNumber, isString]),
        values: () => (true)
    })
}

export type UnitMetricsGraphViewData = {
    type: 'UnitMetricsGraph'
    metrics: UMGMetric[]
    units: UMGUnit[]
}

export const isUnitMetricsGraphViewData = (x: any): x is UnitMetricsGraphViewData => {
    return validateObject(x, {
        type: isEqualTo('UnitMetricsGraph'),
        metrics: isArrayOf(isUMGMetric),
        units: isArrayOf(isUMGUnit)
    })
}