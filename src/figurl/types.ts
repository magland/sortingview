import { isString, _validateObject } from "kachery-js/types/kacheryTypes";
import { ComponentType } from "react";

// A figurl plugin implements a figurl figure of a given type
export type FigurlPlugin = {
    type: string
    validateData: (d: any) => boolean // validate data coming in
    component: ComponentType<{data: any, width: number, height: number}>
    getLabel: (d: any) => string // return a canonical label for the figure based on the data
}

// A figure object comprises the figure type and the figure data to be sent to the figure component
export type FigureObject = {
    type: string
    data: any
}

export const isFigureObject = (x: any): x is FigureObject => {
    return _validateObject(x, {
        type: isString,
        data: () => (true)
    }, {allowAdditionalFields: true})
}