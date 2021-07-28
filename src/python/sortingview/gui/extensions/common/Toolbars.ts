
export interface ActionItem {
    type: 'button'
    callback: () => void
    title: string
    icon: any
    selected?: boolean
    keyCode?: number
    disabled?: boolean
}

export interface DividerItem {
    type: 'divider'
}
