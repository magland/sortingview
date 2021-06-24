import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'kachery-js/crypto/signatures';
import KacheryNodeSetup from 'kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'labbox-react';
import MainWindow from 'python/sortingview/gui/MainWindow/MainWindow';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
// import logo from './logo.svg';
import logo from './spike-icon.png';
import theme from './theme';

testSignatures()

function App() {
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup>
              <MainWindow logo={logo} />
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default App;
