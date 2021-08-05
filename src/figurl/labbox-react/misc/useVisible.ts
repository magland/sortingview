import { useCallback, useState } from "react"

const useVisible = () => {
    const [visible, setVisible] = useState(false)
    const show = useCallback(() => {setVisible(true)}, [])
    const hide = useCallback(() => {setVisible(false)}, [])
    const toggle = useCallback(() => setVisible(v => (!v)), [])
    return {visible, show, hide, toggle}
}

export default useVisible