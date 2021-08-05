import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import figurlPlugins from './figurlPlugins'
import FigurlApp from 'figurl/FigurlApp';
import introMd from './intro.md.gen'
import { pythonProjectVersion, webAppProjectVersion } from 'python/sortingview/gui/version';
import packageName from 'python/sortingview/gui/packageName';
import taskFunctionIds from 'taskFunctionIds';
import logo from './spike-icon.png';
import { createExtensionContext, ExtensionsSetup } from 'figurl/labbox-react';
import registerExtensions from 'python/sortingview/gui/extensions/registerExtensions';
import { LabboxPlugin } from 'python/sortingview/gui/pluginInterface';

const extensionContext = createExtensionContext<LabboxPlugin>()
registerExtensions(extensionContext).then(() => {
  ReactDOM.render(
    // disable strict mode to supress: "findDOMNode is deprecated in StrictMode" warnings
    // <React.StrictMode>
    <ExtensionsSetup extensionContext={extensionContext}>
      <FigurlApp
        plugins={figurlPlugins}
        taskFunctionIds={taskFunctionIds}
        introMd={introMd}
        packageName={packageName}
        pythonProjectVersion={pythonProjectVersion}
        webAppProjectVersion={webAppProjectVersion}
        repoUrl={"https://github.com/magland/sortingview"}
        logo={logo}
      />
    </ExtensionsSetup>,
    // </React.StrictMode>,
    document.getElementById('root')
  )
})



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
