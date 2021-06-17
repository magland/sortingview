import React from 'react'
import KacheryDaemonNode from 'kachery-js/KacheryDaemonNode'

const KacheryNodeContext = React.createContext<KacheryDaemonNode | undefined>(undefined)

export default KacheryNodeContext