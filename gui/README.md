# spikesortingview

This is the [figurl](https://github.com/flatironinstitute/figurl) visualization frontend that corresponds to the [sortingview](https://github.com/magland/sortingview) Python package.

(The naming is weird. This should probably be called *sortingview-gui* instead, and we will likely change the name in the future.)

## How does it fit together?

[Figurl](https://github.com/flatironinstitute/figurl) pairs a visualization HTML bundle with a piece of data. The [sortingview](https://github.com/magland/sortingview) Python project is in charge of generating and preparing the data, uploading it to the cloud, and creating the figURL (figurl URL). Here is an example:

https://figurl.org/f?v=gs://figurl/spikesortingview-8&d=sha1://1e667e92ee3be76c8e4a85af4a94784329c710d2&label=test_spike_amplitudes

The `d` query parameter points to the data object, and the `v` query parameter points to the HTML bundle in the cloud, which is the compiled version of this project.

When the visualizations in this package are improved, a new HTML bundle is generated and uploaded to the cloud bucket. If there are no breaking changes to the data spec, the developer should not increment the deploy version so that it overwrites the existing bundle, and all visualizations (past, present, and future) will point to the improved view. However, if there are breaking changes, then a new version should be created, for example `gs://figurl/spikesortingview-8` becomes `gs://figurl/spikesortingview-9`. The sortingview Python package should then be updated to conform with the new data spec and to point to the new version of the HTML bundle.

For a more in-depth description of how figurl works, see the [figurl docs](https://github.com/flatironinstitute/figurl).


## Getting started for developers

If you would like to contribute to this project, either by enhancing existing views or by creating new views, you'll need to set up a local development environment.

## Prerequisites

* It is recommended that you use a conda environment
* node >= 16
* npm >= 8.6 (earlier versions will probably work as well)
* yarn >= 1.22 (eariler versions will probably work as well)
* python >= 3.8 and numpy (for sortingview)

## Clone this repo

```bash
git clone <this-repo>
```

## Use VS Code (highly recommended)

Open this workspace in VS Code.

```bash
cd spikesortingview
code .
```

Install the recommended VS Code extensions
* ESLint
* Python and Pylance (for sortingview)
* GitLens
* GitHub Pull Requests and Issues
* Dependency Cruiser Extension

## Install node packages via yarn

```bash
cd spikesortingview
yarn install
```

This will install a large number of packages in the `node_modules/` folder

## Start the development server

```bash
# In VS Code terminal
yarn start
```

If all works as intended, you will get a development server listening on port 3000.

Point your browser (preferably Chrome) to `http://localhost:3000`. You should get "Waiting for data" message. The reason it is not showing anything interesting is because this page is meant to be embedded as a figurl figure. Navigate to

https://www.figurl.org/f?v=http://localhost:3000&d=sha1://30954d339b438614df848bc4fe71dbbfef0b2187&label=Box%20layout%20example

You should see a bunch of spike-sorting-related plots. Notice that the `v` query parameter is pointing to the local development server. Therefore it will auto-load changes you make to the source code. In production, that same view is available at

https://www.figurl.org/f?v=gs://figurl/spikesortingview-9&d=sha1://30954d339b438614df848bc4fe71dbbfef0b2187&label=Box%20layout%20example

Notice in this case the `v` parameter points to the production HTML bundle in the cloud.

## Modifying the source code

With the development server listening on port 3000 and the URL pointing to `v=http://localhost:3000`, you can see your changes to the source code live in the browser, which is really convenient. *(This mostly works. Some types of changes require restarting the development server and/or reloading the page.)*

To test this, let's change the text "Select one or more units to view cross-correlograms" (appears in the lower-right box) to "I am testing my development setup". In VS Code, search the project (Ctrl+shift+F) for the string "Select one or more units to view cross-correlograms" (you'll find it in CrossCorrelogramsView.tsx) and change it to a different string. Upon saving the file, you'll see the development server quickly update the compilation, and the changes will take effect in the browser. Now switch it back to the original text.

## Libraries

The source code is organized into a flat structure with modular libraries in the [src/libraries](./src/libraries) folder. They are not really libraries, but we call them libraries because the plan is to eventually separate them out into external packages. Within the libraries folder, the prefix of the subdirectory reflects the type of module

* `view-*` is a plugin view (see below)
* `component-*` is a React component that is not a plugin view
* `context-*` is a React context for providing global state
* `util-*` is a utility module that is usually not a React component

## Views

Views are the building-blocks of the spikesortingview GUI. Each widget or sub-widget in a sortingview figure comes from a View. Each View has a type string, a data spec, and a React component.

See [src/View.tsx](./src/View.tsx) and [src/ViewData.ts](./src/ViewData.ts) for the list of Views and the data spec for each view.

The entry point to the project is [src/index.tsx](./src/index.tsx) which imports [src/App.tsx](./src/App.tsx).

## Create-React-App

This project was created by [Create-React-App](https://create-react-app.dev/) which manages the project configuration, including the Webpack configuration. The developer will be saved from a very large number of headaches, so we should do whatever we can to avoid [ejecting](https://stackoverflow.com/questions/48308936/what-does-this-react-scripts-eject-command-do).

## Deploying the HTML bundle

While developing locally is a lovely experience, eventually you will want others to see what you have created. This is just a matter of (a) building the bundle and (b) uploading it to a Google Cloud Storage Bucket. An example script for doing this is [devel/deploy.sh](./devel/deploy.sh). In fact this is the script used to deploy the production version (you need to have permission to upload to that bucket). When you want someone to see some changes you have made, you will probably want to upload to a different bucket, or to a different target directory in the production bucket. Then, when you share the URL, just be sure to redefine the `v` query parameter to point to your bundle.

## Creating a new View

Here, we'll assume you are creating a new view called Starlight.

1. Create a new folder in [src/libraries](./src/libraries) named `view-starlight`.
1. Create three files in this folder: `index.ts`, `StarlightViewData.ts`, and `StarlightView.tsx`.
1. Define the data spec and the functionality for your view component. To get started, use [src/libraries/view-console/](./src/libraries/view-console) as an example/template.
1. Add your view to [src/ViewData.ts](./src/ViewData.ts) and [src/View.tsx](./src/View.tsx).

To test this out, you'll need to generate a figURL from a Python script. Make a copy of [devel/dev_example.py](./devel/dev_example.py) and modify it to reflect your new View (you'll at least need to change the 'type' variable).

When you run the script, you'll get a figURL printed in the terminal. If you open that in the browser, you'll see an error message, because the cloud HTML bundle does not yet include your new view. Change the `v` query parameter in the URL to point to your local development server (`http://localhost:3000`) and you should be able to see your new view in action.

Once you have developed and tested your new view, you can incorporate it into the project by making pull requests to this repo and to the sortingview repo. On the sortingview side, you'll need to add your View class to the `sortingview/views` folder and edit `__init__.py` in that folder.

Congratulations, you have contributed a View to spikesortingview!