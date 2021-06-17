import { MuiThemeProvider } from '@material-ui/core';
import KacheryNodeSetup from 'kachery-react/KacheryNodeSetup';
import MainWindow from 'python/sortingview/gui/MainWindow/MainWindow';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import { GoogleSignInSetup } from './python/sortingview/gui/labbox';
import theme from './theme';

function App() {
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup>
              <MainWindow />
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default App;
