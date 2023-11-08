import { getFileData, useUrlState } from '@figurl/interface';
import { SortingCurationContext, sortingCurationReducer, UnitMetricSelectionContext, unitMetricSelectionReducer, useSelectedUnitIds } from '../spike-sorting-views';
import { ViewComponentProps } from '../../libraries/core-view-component-props';
import { FunctionComponent, useEffect, useReducer } from 'react';
import LayoutItemView from './LayoutItemView';
import { SortingLayoutViewData } from './SortingLayoutViewData';

type Props = {
    data: SortingLayoutViewData
    ViewComponent: FunctionComponent<ViewComponentProps>
    width: number
    height: number
}

const SortingLayoutView: FunctionComponent<Props> = ({data, ViewComponent, width, height}) => {
    const {layout, views} = data

    // const {state: sortingCuration} = useFeedReducer({feedUri: data.sortingCurationUri}, sortingCurationReducer, {}, {actionField: false})
    // const {userId, googleIdToken} = useSignedIn()
    const {unitIdSelectionDispatch} = useSelectedUnitIds()
    // const sortingCurationDispatch = useCallback((a: SortingCurationAction) => {
    //     if (!data.sortingCurationUri) return
    //     initiateTask({
    //       taskName: 'spikesortingview.sorting_curation_action.1',
    //       taskInput: {
    //         sorting_curation_uri: data.sortingCurationUri,
    //         action: a,
    //         user_id: userId,
    //         google_id_token: googleIdToken
    //       },
    //       taskType: 'action',
    //       onStatusChanged: () => {}
    //     })
    //     // this might be how we can do offline-first curation (get curationSubfeed from useSubfeedReducerS)
    //     // curationSubfeed.appendOfflineMessages([a]) // this would need to be implemented
    // }, [data.sortingCurationUri, userId, googleIdToken])
    // const [canCurate, setCanCurate] = useState<boolean>(false)

    const [sortingCuration2, sortingCurationDispatch2] = useReducer(sortingCurationReducer, {})

    const {initialUrlState} = useUrlState()
    useEffect(() => {
        if (initialUrlState.curation) {
            ;(async () => {
              const curation = await getFileData(initialUrlState.curation, () => {})
              sortingCurationDispatch2({
                type: 'SET_CURATION',
                curation
              })
            })()
        }
    }, [initialUrlState])

    useEffect(() => {
        if (initialUrlState.selectedUnitIds) {
          unitIdSelectionDispatch({type: 'SET_SELECTION', incomingSelectedUnitIds: initialUrlState.selectedUnitIds})
        }
        if (initialUrlState.visibleUnitIds) {
          unitIdSelectionDispatch({type: 'SET_RESTRICTED_UNITS', newRestrictedUnitIds: initialUrlState.visibleUnitIds})
        }
      }, [initialUrlState, unitIdSelectionDispatch])

    // useEffect(() => {
    //     setCanCurate(false)
    //     if (!data.sortingCurationUri) {
    //         return
    //     }
    //     if ((!userId) || (!googleIdToken)) {
    //         return
    //     }
    //     ;(async () => {
    //         const a = await getMutable(`@sortingview/@sortingCurationAuthorizedUsers/${feedIdForUri(data.sortingCurationUri || '')}`)
    //         if (!a) return
    //         const authorizedUsers = JSON.parse(a)
    //         if (authorizedUsers.includes(userId)) {
    //             setCanCurate(true)
    //         }
    //     })()
    // }, [userId, googleIdToken, data.sortingCurationUri])

    const [unitMetricSelection, unitMetricSelectionDispatch] = useReducer(unitMetricSelectionReducer, {})

    // // syncing state with backend
    // useEffect(() => {
    //     sendMessageToBackend({
    //         type: 'setSelectedUnitIds',
    //         selectedUnitIds: sortIds([...selectedUnitIds])
    //     })
    // }, [selectedUnitIds])
    // useEffect(() => {
    //     sendMessageToBackend({
    //         type: 'setSortingCuration',
    //         sortingCuration: sortingCuration2
    //     })
    // }, [sortingCuration2])
    // useEffect(() => {
    //     let canceled = false
    //     onMessageFromBackend((message) => {
    //         if (canceled) return
    //         if (message.type === 'setSelectedUnitIds') {
    //             unitIdSelectionDispatch({
    //                 type: 'SET_SELECTION',
    //                 incomingSelectedUnitIds: message.selectedUnitIds
    //             })
    //         }
    //         else if (message.type === 'setSortingCuration') {
    //             sortingCurationDispatch2({
    //                 type: 'SET_CURATION',
    //                 curation: message.sortingCuration
    //             })
    //         }
    //     })
    //     return () => {canceled = true}
    // }, [unitIdSelectionDispatch])

    const content = (
        <UnitMetricSelectionContext.Provider value={{unitMetricSelection, unitMetricSelectionDispatch}}>
            <LayoutItemView
                layoutItem={layout}
                ViewComponent={ViewComponent}
                views={views}
                width={width}
                height={height}
            />
        </UnitMetricSelectionContext.Provider>
    )

    return (
        <SortingCurationContext.Provider value={
            // data.sortingCurationUri ? (
            //     {sortingCuration, sortingCurationDispatch: canCurate ? sortingCurationDispatch : undefined}
            // ) : (
                {sortingCuration: sortingCuration2, sortingCurationDispatch: sortingCurationDispatch2}
            // )
        }>
            {content}
        </SortingCurationContext.Provider>
    )
}

export default SortingLayoutView