type RoutePath = '/home' | '/about' | '/fig'
export const isRoutePath = (x: string): x is RoutePath => {
    if (x.startsWith('/workspace/')) return true
    if (['/home', '/about', '/fig'].includes(x)) return true
    return false
}

export default RoutePath