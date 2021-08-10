import React, { FunctionComponent } from 'react';
import FigurlContext from './FigurlContext';
import { FigurlPlugin } from './types';

type Props = {
    plugins: FigurlPlugin[]
}

const FigurlSetup: FunctionComponent<Props> = ({plugins, children}) => {
    return (
        <FigurlContext.Provider value={{plugins}}>
            {children}
        </FigurlContext.Provider>
    )
}

export default FigurlSetup