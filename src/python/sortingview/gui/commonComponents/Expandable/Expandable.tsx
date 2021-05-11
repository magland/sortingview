import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core'
import React, { FunctionComponent } from 'react'

interface Props {
    label: string
    defaultExpanded?: boolean
    icon?: JSX.Element
    unmountOnExit?: boolean // default is true
}

export const Expandable: FunctionComponent<Props> = (props) => {
    return (
        <Accordion TransitionProps={{ unmountOnExit: props.unmountOnExit !== undefined ? props.unmountOnExit : true }} defaultExpanded={props.defaultExpanded}>
            <AccordionSummary>
                {props.icon && <span style={{ paddingRight: 10 }}>{props.icon}</span>}<span style={{ paddingTop: 3 }}>{props.label}</span>
            </AccordionSummary>
            <AccordionDetails>
                <div style={{ width: "100%" }}>
                    {props.children}
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

export default Expandable