import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { FunctionComponent } from "react";
import { ViewComponentProps } from '../core-view-component-props';
import Expandable from "./components/Expandable/Expandable";
import { MWViewWrapper } from './MountainWorkspace';
import MWViewLauncher from "./MWViewLauncher";
import { MWViewPlugin } from "./MWViewPlugin";

type Props ={
	onLaunchView: (plugin: MWViewPlugin) => void
	viewPlugins: MWViewPlugin[]
	controlViewPlugins: MWViewPlugin[]
	ViewComponent: FunctionComponent<ViewComponentProps>
	width: number
	height: number
}

const MountainWorkspaceLeftPanel: FunctionComponent<Props> = ({width, onLaunchView, viewPlugins, controlViewPlugins, ViewComponent}) => {
	const launchIcon = <span style={{color: 'gray'}}><OpenInBrowserIcon /></span>
	return (
		<div>
			{/* Launch */}
			<Expandable icon={launchIcon} label="Open views" defaultExpanded={true} unmountOnExit={false}>
				<MWViewLauncher
					onLaunchView={onLaunchView}
					plugins={viewPlugins}
				/>
			</Expandable>

			{/* Curation */}
			{/* {
				!hideCurationControl && (
					<Expandable icon={launchIcon} label="Curation" defaultExpanded={true} unmountOnExit={false}>
						<MWCurationControl />
					</Expandable>
				)
			} */}

			{
				controlViewPlugins.map(v => (
					<Expandable key={v.name} icon={launchIcon} label={v.label} defaultExpanded={true} unmountOnExit={false}>
						<MWViewWrapper
							viewPlugin={v}
							ViewComponent={ViewComponent}
							width={width - 20}
						/>
					</Expandable>
				))
			}
		</div>
	)
}

export default MountainWorkspaceLeftPanel