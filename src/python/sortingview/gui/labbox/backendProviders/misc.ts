import { FeedId, isFeedId } from "../kacheryTypes"

export const parseWorkspaceUri = (workspaceUri: string | undefined): {feedId: FeedId | undefined, feedUri: string | undefined, workspaceName: string | undefined} => {
    const undefinedResult = {feedId: undefined, feedUri: undefined, workspaceName: undefined}
    if (!workspaceUri) return undefinedResult
    if (!workspaceUri.startsWith('workspace://')) {
        return undefinedResult
    }
    const a = workspaceUri.split('/')
    const feedId = a[2] || undefined
    const workspaceName = a[3] || undefined
    if ((!feedId) || (!workspaceName)) return undefinedResult
    if (!isFeedId(feedId)) return undefinedResult
    return {
        feedId,
        feedUri: `feed://${feedId}`,
        workspaceName
    }
}