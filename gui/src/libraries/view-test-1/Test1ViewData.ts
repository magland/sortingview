import { isEqualTo, validateObject } from "../core-utils"


export type Test1ViewData = {
    type: 'Test1'
}

export const isTest1ViewData = (x: any): x is Test1ViewData => {
    return validateObject(x, {
        type: isEqualTo('Test1')
    }, {allowAdditionalFields: true})
}