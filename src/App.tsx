import React from 'react';
// import logo from './logo.svg';
import './App.css';
import AppWrapper from './reusable/AppWrapper/AppWrapper';
import MainWindow from './MainWindow/MainWindow';

function App() {
  return (
    <div className="App">
      <AppWrapper>
        <MainWindow />
      </AppWrapper>
    </div>
  );
}

export default App;
