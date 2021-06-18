import React from 'react'
import { KacheryNode } from 'kachery-js'

const KacheryNodeContext = React.createContext<KacheryNode | undefined>(undefined)

export default KacheryNodeContext