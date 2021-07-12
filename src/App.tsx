import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'kachery-js/crypto/signatures';
import { nodeLabel } from 'kachery-js/types/kacheryTypes';
import KacheryNodeSetup from 'kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'labbox-react';
import { HomePageProps } from 'labbox-react/HomePage/HomePage';
import MainWindow from 'labbox-react/MainWindow/MainWindow';
import packageName from 'python/sortingview/gui/packageName';
import WorkspacePage from 'python/sortingview/gui/WorkspacePage/WorkspacePage';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import introMd from './intro.md.gen';
import { pythonProjectVersion, webAppProjectVersion } from './python/sortingview/gui/version';
// import logo from './logo.svg';
import logo from './spike-icon.png';
import taskFunctionIds from './taskFunctionIds';
import theme from './theme';

testSignatures()

const homePageProps: HomePageProps = {
  taskFunctionIds,
  introMd,
  packageName,
  workspaceDescription: 'A sortingview workspace is a collection of ephys recordings and sortings together with sorting curations.',
  pythonProjectVersion,
  webAppProjectVersion,
  repoUrl: 'https://github.com/magland/sortingview'
}

function App() {
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup nodeLabel={nodeLabel("sortingview")}>
              <MainWindow logo={logo} homePageProps={homePageProps}>
                <WorkspacePage
                  width={0} // will be filled in
                  height = {0}
                />
              </MainWindow>
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default App;
