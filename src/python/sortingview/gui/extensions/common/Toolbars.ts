
export interface ActionItem {
    type: 'button'
    callback: () => void
    title: string
    icon: any
    keyCode: number
}

export interface DividerItem {
    type: 'divider'
}
