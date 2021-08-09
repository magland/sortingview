type RoutePath = '/home' | '/about' | '/fig' | '/selectWorkspace' | '/workspace'
export const isRoutePath = (x: string): x is RoutePath => {
    if (x.startsWith('/workspace/')) return true
    if (x === '/workspace') return true
    if (['/home', '/about', '/fig', '/selectWorkspace', '/workspace'].includes(x)) return true
    return false
}

export default RoutePath