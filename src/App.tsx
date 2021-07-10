import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'kachery-js/crypto/signatures';
import KacheryNodeSetup from 'kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'labbox-react';
import MainWindow from 'labbox-react/MainWindow/MainWindow';
import packageName from 'python/sortingview/gui/packageName';
import WorkspacePage from 'python/sortingview/gui/WorkspacePage/WorkspacePage';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
// import logo from './logo.svg';
import logo from './spike-icon.png';
import taskFunctionIds from './taskFunctionIds';
import theme from './theme';

testSignatures()

function App() {
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup>
              <MainWindow logo={logo} packageName={packageName} taskFunctionIds={taskFunctionIds}>
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
