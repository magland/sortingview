import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'kachery-js/crypto/signatures';
import { nodeLabel, TaskFunctionId } from 'kachery-js/types/kacheryTypes';
import KacheryNodeSetup from 'figurl/kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'figurl/labbox-react';
import MainWindow from 'figurl/labbox-react/MainWindow/MainWindow';
import React, { FunctionComponent } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import './index.css'
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
  const homePageProps = {
    taskFunctionIds, introMd, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl
  }
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup nodeLabel={nodeLabel("sortingview")}>
              <MainWindow
                packageName={packageName} plugins={plugins} logo={logo} homePageProps={homePageProps}
              />
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default FigurlApp
