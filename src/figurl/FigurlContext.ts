import React from 'react'
import { FigurlPlugin } from './types'

const FigurlContext = React.createContext<{plugins: FigurlPlugin[]} | undefined>(undefined)

export default FigurlContext