import { useCallback, useMemo } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { WorkspaceRoute } from "../pluginInterface"
import { locationFromRoute, routeFromLocation, WorkspaceRouteAction, workspaceRouteReducer } from "../pluginInterface/WorkspaceRoute"

const useWorkspaceRoute = () => {
    const location = useLocation()
    const history = useHistory()

    const workspaceRoute = useMemo((): WorkspaceRoute => {
        return routeFromLocation(location)
    }, [location])
    const workspaceRouteDispatch = useCallback((action: WorkspaceRouteAction) => {
        const r = routeFromLocation(location)
        const route2 = workspaceRouteReducer(r, action)
        const location2 = locationFromRoute(route2)
        history.push({...location, ...location2})
    }, [location, history])


    return {workspaceRoute, workspaceRouteDispatch: workspaceRouteDispatch}
}

export default useWorkspaceRoute

// jinjaroot synctool exclude