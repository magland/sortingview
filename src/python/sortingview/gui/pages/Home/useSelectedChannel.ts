import { useCallback } from "react"
import { ChannelName } from "kachery-js/types/kacheryTypes"
import useRoute from "../../route/useRoute"

const useSelectedChannel = () => {
    const {channel, setRoute} = useRoute()
    const selectChannel = useCallback((channel: ChannelName | undefined) => {
        setRoute({
            channel
        })
    }, [setRoute])
    return {
        selectedChannel: channel,
        selectChannel
    }
}

export default useSelectedChannel