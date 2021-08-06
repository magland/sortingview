import { MuiThemeProvider } from '@material-ui/core';
import KacheryNodeSetup from 'figurl/kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'figurl/labbox-react';
import MainWindow from 'figurl/labbox-react/MainWindow/MainWindow';
import { testSignatures } from 'kachery-js/crypto/signatures';
import { nodeLabel, TaskFunctionId } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useMemo, useReducer } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import './index.css';
import { initialRecentFigures, recentFiguresReducer } from './RecentFigures';
// import logo from './logo.svg';
import theme from './theme';
import { FigurlPlugin } from './types';

testSignatures()

type Props = {
  taskFunctionIds: TaskFunctionId[]
  plugins: FigurlPlugin[]
  introMd: string
  packageName: string
  pythonProjectVersion: string
  webAppProjectVersion: string
  repoUrl: string
  logo: any
}

const FigurlApp: FunctionComponent<Props> = ({
  plugins, taskFunctionIds, introMd, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, logo
}) => {
  const [recentFigures, recentFiguresDispatch] = useReducer(recentFiguresReducer, initialRecentFigures)
  const homePageProps = useMemo(() => ({
    taskFunctionIds, introMd, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, recentFigures, plugins
  }), [taskFunctionIds, introMd, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, recentFigures, plugins])
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup nodeLabel={nodeLabel("sortingview")}>
              <MainWindow
                packageName={packageName}
                plugins={plugins}
                logo={logo}
                homePageProps={homePageProps}
                recentFigures={recentFigures}
                recentFiguresDispatch={recentFiguresDispatch}
              />
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default FigurlApp
