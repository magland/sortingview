import { Grid } from "@material-ui/core"
import { usePlugins } from "labbox"
import React, { Fragment, FunctionComponent } from 'react'
import Expandable from "../../common/Expandable"
import { LabboxPlugin, sortingUnitViewPlugins, SortingUnitViewProps } from "../../pluginInterface"


const MVSortingUnitView: FunctionComponent<SortingUnitViewProps> = (props) => {
    // important to exclude this plugin (not only for this widget but for all children) to avoid infinite recursion
    const plugins = usePlugins<LabboxPlugin>().filter(p => (p.name !== 'MVSortingUnitView'))
    const suvPlugins = sortingUnitViewPlugins(plugins)
    return (
        <Fragment>
            {/* Non-full width first */}
            <Grid container style={{flexFlow: 'wrap'}} spacing={0}>
                {
                    suvPlugins.filter(p => (!p.fullWidth)).map(suv => (
                        <Grid item key={suv.name}>
                            {/* Important to send in the plugins that do not include this one */}
                            <suv.component {...{...props, plugins}} width={400} height={400} />
                        </Grid>
                    ))
                }
            </Grid>
            {/* Full width */}
            <Grid container style={{flexFlow: 'column'}} spacing={0}>
                {
                    suvPlugins.filter(p => (p.fullWidth)).map(suv => (
                        <Grid item key={suv.name}>
                            {/* Important to send in the plugins that do not include this one */}
                            <Expandable defaultExpanded={suv.defaultExpanded} label={suv.label}>
                                <suv.component {...{...props, plugins}} width={props.width} height={400} />
                            </Expandable>
                        </Grid>
                    ))
                }
            </Grid>
        </Fragment>
    )
}

export default MVSortingUnitView