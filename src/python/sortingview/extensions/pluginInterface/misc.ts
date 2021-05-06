export const parseWorkspaceUri = (workspaceUri: string | undefined): {feedUri: string | undefined, workspaceName: string | undefined} => {
    if (!workspaceUri) return {feedUri: undefined, workspaceName: undefined}
    if (!workspaceUri.startsWith('workspace://')) {
        return {feedUri: undefined, workspaceName: undefined}
    }
    const a = workspaceUri.split('/')
    const feedId = a[2] || undefined
    const workspaceName = a[3] || undefined
    if ((!feedId) || (!workspaceName)) return {feedUri: undefined, workspaceName: undefined}
    return {
        feedUri: `feed://${feedId}`,
        workspaceName
    }
}