export interface MWViewPlugin {
    name: string
    label: string
    component: React.FunctionComponent<any>
    singleton: boolean
    icon?: any
    additionalProps?: {[key: string]: any}
}

export class MWView {
    activate: boolean = false // signal to set this tab as active
    area: 'north' | 'south' | '' = ''
    constructor(public plugin: MWViewPlugin, public extraProps: {[key: string]: any}, public label: string, public viewId: string) {

    }
}